'use strict';

import * as React from 'react';

import { VDomRenderer, Toolbar, ToolbarButton } from '@jupyterlab/apputils';

import { KernelMessage, Kernel } from '@jupyterlab/services';

import {
  caretDownIcon,
  caretRightIcon,
  closeIcon
} from '@jupyterlab/ui-components';

import { each } from '@lumino/algorithm';

import { UUID } from '@lumino/coreutils';

import { Widget, BoxLayout } from '@lumino/widgets';

import {
  ObjectInspector,
  ObjectLabel,
  InspectorNodeParams
} from 'react-inspector';

import { SASLogModel, ThreadIterator } from './model';

import '../style/index.css';
import { sasLogIcon } from './iconImport';


const theme = {
  BASE_FONT_FAMILY: 'var(--jp-code-font-family)',
  BASE_FONT_SIZE: 'var(--jp-code-font-size)',
  BASE_LINE_HEIGHT: 'var(--jp-code-line-height)',

  BASE_BACKGROUND_COLOR: 'var(--jp-layout-color0)',
  BASE_COLOR: 'var(--jp-content-font-color1)',

  OBJECT_NAME_COLOR: 'var(--jp-mirror-editor-attribute-color)',
  OBJECT_VALUE_NULL_COLOR: 'var(--jp-mirror-editor-builtin-color)',
  OBJECT_VALUE_UNDEFINED_COLOR: 'var(--jp-mirror-editor-builtin-color)',
  OBJECT_VALUE_REGEXP_COLOR: 'var(--jp-mirror-editor-string-color)',
  OBJECT_VALUE_STRING_COLOR: 'var(--jp-mirror-editor-string-color)',
  OBJECT_VALUE_SYMBOL_COLOR: 'var(--jp-mirror-editor-operator-color)',
  OBJECT_VALUE_NUMBER_COLOR: 'var(--jp-mirror-editor-number-color)',
  OBJECT_VALUE_BOOLEAN_COLOR: 'var(--jp-mirror-editor-builtin-color))',
  OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: 'var(--jp-mirror-editor-def-color))',

  ARROW_COLOR: 'var(--jp-content-font-color2)',
  ARROW_MARGIN_RIGHT: 3,
  ARROW_FONT_SIZE: 12,

  TREENODE_FONT_FAMILY: 'var(--jp-code-font-family)',
  TREENODE_FONT_SIZE: 'var(--jp-code-font-size)',
  TREENODE_LINE_HEIGHT: 'var(--jp-code-line-height)',
  TREENODE_PADDING_LEFT: 12
};

function msgNodeRenderer(args: InspectorNodeParams) {
  const { name, depth, isNonenumerable, data } = args;
  if (depth !== 0) {
    return (
      <ObjectLabel
        key={'node-label'}
        name={name}
        data={data}
        isNonenumerable={isNonenumerable}
      />
    );
  }
  const msg = (data as unknown) as KernelMessage.IMessage;
  return <span key={'node-label'}>{msg.header.msg_id}</span>;
}

function Message(props: Message.IProperties): React.ReactElement<any>[] {
  const msg = props.message;
  const msgId = msg.header.msg_id;
  const threadStateClass = props.collapsed ? 'jp-mod-collapsed' : '';
  const collapserIcon = props.hasChildren
    ? props.collapsed
      ? caretRightIcon
      : caretDownIcon
    : null;
  const hasChildrenClass = props.hasChildren ? 'jp-mod-children' : '';
  const tabIndex = props.hasChildren ? 0 : -1;
  return [
    <div
      key={`threadnode-${msgId}`}
      className="jp-saslog-threadnode"
      onClick={() => {
        props.onCollapse(props.message);
      }}
    >
      <div style={{ paddingLeft: 16 * props.depth }}>
        <button
          className={`jp-saslog-threadcollapser ${threadStateClass} ${hasChildrenClass}`}
          tabIndex={tabIndex}
        >
          {collapserIcon && (
            <collapserIcon.react className={'kspy-collapser-icon'} />
          )}
        </button>
        <span className="jp-saslog-threadlabel">
          {msg.header.date}
        </span>
      </div>
    </div>,
    // <div key={`message-${msg.content}`} className="jp-saslog-message">
    <div key={'SAS Log Output'} className="jp-saslog-message">
      {/* TODO: Need to add msg.content.text but throwing error at compile time */}
      {/* <div key={`message-${msg.content.txt}`} className="jp-saslog-message"></div> */}
      <ObjectInspector
        data={msg}
        theme={theme as any}
        nodeRenderer={msgNodeRenderer}
      />
    </div>
  ];
}

namespace Message {
  export interface IProperties {
    message: KernelMessage.IMessage;
    depth: number;
    collapsed: boolean;
    hasChildren: boolean;
    onCollapse: (message: KernelMessage.IMessage) => void;
  }
}

export class MessageLogView extends VDomRenderer<SASLogModel> {
  constructor(model: SASLogModel) {
    super(model);
    this.id = `saslog-messagelog-${UUID.uuid4()}`;
    this.addClass('jp-saslog-messagelog');
  }

  /**
   * Render the extension discovery view using the virtual DOM.
   */
  protected render(): React.ReactElement<any>[] {
    const model = this.model!;
    const elements: React.ReactElement<any>[] = [];

    elements.push(
      <span key="header-thread" className="jp-saslog-logheader">
        SAS Submission
      </span>,
      <span
        key="header-divider"
        className="jp-saslog-logheader jp-saslog-divider"
      />
    );

    const threads = new ThreadIterator(model.tree, this.collapsed);

    let first = true;
    each(threads, ({ args, hasChildren }) => {
      const depth = model.depth(args);
      if (depth === 0) {
        if (first) {
          first = false;
        } else {
          // Insert spacer between main threads
          elements.push(
            <span
              key={`'divider-${args.msg.header.msg_id}`}
              className="jp-saslog-divider"
            />
          );
        }
      }
      // display SAS log results
      const collapsed = this.collapsed[args.msg.header.msg_id];
      // TODO:
      // What should happen is listen the if condition below. Then call model.kernel.requestExecute({code :'%showLog'});
      // In the response from `requestExecute` in args.msg.content?.text will contain the text that we want to display. 
      // It should have ascii codes to color the text so nothing needs to be done but render in the window.
      if (args.msg.header.msg_type == 'execute_input') {
        // Call %showLog magic to get the log from the last submission
        // https://jupyterlab.github.io/jupyterlab/modules/_services_src_index_._services_src_kernel_kernel_.ikernelconnection.html#requestexecute
        // TODO: get the format correct
        console.log("%showLog Requested")
        // make async, look for msg id + stream type
        // window.alert("model.kernel.requestExecute({code :'%showLog'});");
        let future = model.kernel.requestExecute({code :'%showLog'})
        future.onIOPub = (msg) => {
          if (msg.content.hasOwnProperty('text')) {
            console.log("Received message", msg);
          }
        };
        future.done;

      }
      // This is just used to filter the messages in the window during development.
      // When feature complete only the text will be pushed to the elements stack for rendering
      if (args.msg.header.msg_type == 'stream') {
        // window.alert("Potential Results");

        // if (args.msg.header.msg_type =='stream' && args.msg.content.name == 'stdout') {
          // window.alert(args.msg.content?.text)
        // }
        elements.push(
          ...Message({
            message: args.msg,
            depth,
            collapsed,
            hasChildren,
            onCollapse: message => {
              this.onCollapse(message);
            }
          })
        );
      }
    });
    return elements;
  }

  onCollapse(msg: KernelMessage.IMessage) {
    const id = msg.header.msg_id;
    this.collapsed[id] = !this.collapsed[id];
    this.update();
  }

  protected collapsed: { [key: string]: boolean } = {};
}

export class SASLogView extends Widget {
  constructor(kernel?: Kernel.IKernelConnection | null) {
    super();
    this._model = new SASLogModel(kernel);
    this.addClass('jp-saslog-view');
    this.id = `saslog-${UUID.uuid4()}`;
    this.title.label = 'SAS Log';
    this.title.closable = true;
    this.title.icon = sasLogIcon;

    const layout = (this.layout = new BoxLayout());

    this._toolbar = new Toolbar();
    this._toolbar.addClass('jp-saslog-toolbar');

    this._messagelog = new MessageLogView(this._model);

    layout.addWidget(this._toolbar);
    layout.addWidget(this._messagelog);

    BoxLayout.setStretch(this._toolbar, 0);
    BoxLayout.setStretch(this._messagelog, 1);

    this.clearAllButton = new ToolbarButton({
      onClick: () => {
        this._model.clear();
      },
      className: 'jp-saslog-clearAll',
      icon: closeIcon,
      tooltip: 'Clear all SAS Submissions'
    });
    this._toolbar.addItem('clear-all', this.clearAllButton);
  }

  /**
   * Handle `'activate-request'` messages.
   */

  get model(): SASLogModel {
    return this._model;
  }

  private _toolbar: Toolbar<Widget>;
  private _messagelog: MessageLogView;

  private _model: SASLogModel;

  protected clearAllButton: ToolbarButton;
}
