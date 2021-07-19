'use strict';
import * as React from 'react';
import {VDomRenderer, Toolbar, ToolbarButton} from '@jupyterlab/apputils';
import {Kernel} from '@jupyterlab/services';
import {
	caretDownIcon,
	caretRightIcon,
	closeIcon,
	jsonIcon
} from '@jupyterlab/ui-components';
import {UUID} from '@lumino/coreutils';
import {Message as luminoMessage} from '@lumino/messaging';
import {Widget, BoxLayout} from '@lumino/widgets';
import {KernelSpyModel} from './model';
import '../style/index.css';
import '../style/widget.css'
import Convert from 'ansi-to-html'

const convert = new Convert()


/**
 * The main view for the kernel spy.
 */
export class MessageLogView extends VDomRenderer<KernelSpyModel> {
	constructor(model: KernelSpyModel) {
		super(model);
		this.id = `kernelspy-messagelog-${UUID.uuid4()}`;
		this.addClass('jp-kernelspy-messagelog');
	}

	collapsedKeys: { [key: string]: boolean } = {}

	/**
	 * Render the extension discovery view using the virtual DOM.
	 */
	protected render(): React.ReactElement {
		const logStreamObj = this.model.logStreamObj
		return (<div>{Object.keys(logStreamObj).map((key: string) => {
			const collapsed = this.collapsedKeys[key]
			const collapserIcon = collapsed ? caretRightIcon : caretDownIcon
			return <div key={key} className={`collapsible ${collapsed ? 'collapsed' : ''}`}>
				<div className={'log-header'}>
					<button
						className={`collapser`}
						onClick={() => {
							this.collapsedKeys[key] = !this.collapsedKeys[key];
							this.update();
						}}
					>
						<collapserIcon.react className={'kspy-collapser-icon'}/>
					</button>
					<div className={'log-id'}>{key}</div>
				</div>
				<div className={'log-container'}>
					{logStreamObj[key].map((stream: string, i: number) => <div key={`${key}-${i}`}>
						<div dangerouslySetInnerHTML={{__html: convert.toHtml(stream)}}/>
					</div>)}
				</div>
			</div>
		})}
		</div>)
	}

	collapseAll() {
		for (const key in this.model.logStreamObj) {
			this.collapsedKeys[key] = true
		}
		this.update();
	}

	expandAll() {
		this.collapsedKeys = {}
		this.update();
	}
}

/**
 * The main view for the kernel spy.
 */
export class KernelSpyView extends Widget {
	constructor(kernel?: Kernel.IKernelConnection | null) {
		super();
		this._model = new KernelSpyModel(kernel);
		this.addClass('jp-kernelspy-view');
		this.id = `kernelspy-${UUID.uuid4()}`;
		this.title.label = 'Kernel spy';
		this.title.closable = true;
		this.title.iconRenderer = jsonIcon;

		const layout = (this.layout = new BoxLayout());

		this._toolbar = new Toolbar();
		this._toolbar.addClass('jp-kernelspy-toolbar');

		this._messagelog = new MessageLogView(this._model);

		layout.addWidget(this._toolbar);
		layout.addWidget(this._messagelog);

		BoxLayout.setStretch(this._toolbar, 0);
		BoxLayout.setStretch(this._messagelog, 1);

		this.collapseAllButton = new ToolbarButton({
			onClick: () => {
				this._messagelog.collapseAll();
			},
			className: 'jp-kernelspy-collapseAll',
			icon: caretRightIcon,
			tooltip: 'Collapse all threads'
		});
		this._toolbar.addItem('collapse-all', this.collapseAllButton);

		this.expandAllButton = new ToolbarButton({
			onClick: () => {
				this._messagelog.expandAll();
			},
			className: 'jp-kernelspy-expandAll',
			icon: caretDownIcon,
			tooltip: 'Expand all threads'
		});
		this._toolbar.addItem('expand-all', this.expandAllButton);

		this.clearAllButton = new ToolbarButton({
			onClick: () => {
				this._model.clear();
			},
			className: 'jp-kernelspy-clearAll',
			icon: closeIcon,
			tooltip: 'Clear all threads'
		});
		this._toolbar.addItem('clear-all', this.clearAllButton);
	}

	/**
	 * Handle `'activate-request'` messages.
	 */
	protected onActivateRequest(msg: luminoMessage): void {
		if (!this.node.contains(document.activeElement)) {
			this.collapseAllButton.node.focus();
		}
	}

	get model(): KernelSpyModel {
		return this._model;
	}

	private _toolbar: Toolbar<Widget>;
	private _messagelog: MessageLogView;

	private _model: KernelSpyModel;

	protected clearAllButton: ToolbarButton;
	protected expandAllButton: ToolbarButton;
	protected collapseAllButton: ToolbarButton;
}

