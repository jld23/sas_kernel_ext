'use strict';

import {
  JupyterFrontEndPlugin,
  JupyterFrontEnd,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  CommandToolbarButton,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { IMainMenu } from '@jupyterlab/mainmenu';

import {
  INotebookModel,
  NotebookPanel,
  INotebookTracker
} from '@jupyterlab/notebook';

import { find } from '@lumino/algorithm';

import { CommandRegistry } from '@lumino/commands';

import { Token } from '@lumino/coreutils';

import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { AttachedProperty } from '@lumino/properties';

import { SASLogView } from './widget';
import { requestAPI } from './handler';

/**
 * IDs of the commands added by this extension.
 */
namespace CommandIDs {
  export const newSpy = 'saslog:new';
}

/**
 * The token identifying the JupyterLab plugin.
 */
export const ISASLogExtension = new Token<ISASLogExtension>(
  'jupyter.extensions.saslog'
);

export type ISASLogExtension = DocumentRegistry.IWidgetExtension<
  NotebookPanel,
  INotebookModel
>;

const spyProp = new AttachedProperty<SASLogView, string>({
  create: () => '',
  name: 'SpyTarget'
});

export class KernelSpyExtension implements ISASLogExtension {
  /**
   *
   */
  constructor(commands: CommandRegistry) {
    this.commands = commands;
  }

  /**
   * Create a new extension object.
   */
  createNew(
    nb: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    // Add buttons to toolbar
    const buttons: CommandToolbarButton[] = [];
    let insertionPoint = -1;
    find(nb.toolbar.children(), (tbb, index) => {
      if (tbb.hasClass('jp-Notebook-toolbarCellType')) {
        insertionPoint = index;
        return true;
      }
      return false;
    });
    let i = 1;
    for (const id of [CommandIDs.newSpy]) {
      const button = new CommandToolbarButton({ id, commands: this.commands });
      button.addClass('jp-saslog-nbtoolbarbutton');
      if (insertionPoint >= 0) {
        nb.toolbar.insertItem(
          insertionPoint + i++,
          this.commands.label(id),
          button
        );
      } else {
        nb.toolbar.addItem(this.commands.label(id), button);
      }
      buttons.push(button);
    }

    return new DisposableDelegate(() => {
      // Cleanup extension here
      for (const btn of buttons) {
        btn.dispose();
      }
    });
  }

  protected commands: CommandRegistry;
}

/**
 * Add the main file view commands to the application's command registry.
 */
function addCommands(
  app: JupyterFrontEnd,
  tracker: INotebookTracker,
  spyTracker: WidgetTracker<MainAreaWidget<SASLogView>>,
  palette: ICommandPalette | null,
  menu: IMainMenu | null
): void {
  const { commands, shell } = app;

  /**
   * Whether there is an active notebook.
   */
  function hasKernel(): boolean {
    return (
      tracker.currentWidget !== null &&
      (tracker.currentWidget.context.sessionContext?.session?.kernel ??
        null) !== null
    );
  }

  commands.addCommand(CommandIDs.newSpy, {
    label: 'Show SAS Log',
    caption: 'Show the SAS log for the associated notebook',
    iconClass: 'jp-Icon jp-Icon-16 jp-saslogIcon',
    // iconClass: 'sasLogIcon',
    isEnabled: hasKernel,
    execute: args => {
      let notebook: NotebookPanel | null;
      if (args.path) {
        notebook = tracker.find(nb => nb.context.path === args.path) ?? null;
      } else {
        notebook = tracker.currentWidget;
      }
      if (!notebook) {
        return;
      }
      const widget = new SASLogView(
        notebook.context.sessionContext?.session?.kernel
      );

      widget.title.label = `SAS Log: ${notebook.title.label}`;
      notebook.title.changed.connect(() => {
        widget.title.label = `SAS Log: ${notebook!.title.label}`;
      });

      const outer = new MainAreaWidget({ content: widget });
      spyProp.set(widget, notebook.context.path);
      notebook.context.pathChanged.connect((_, path) => {
        spyProp.set(widget, path);
        spyTracker.save(outer);
      });
      spyTracker.add(outer);
      notebook.context.sessionContext.kernelChanged.connect((_, args) => {
        widget.model.kernel = args.newValue;
      });

      shell.add(outer, 'main', { mode: 'split-right' });

      if (args['activate'] !== false) {
        shell.activateById(outer.id);
      }
      notebook.disposed.connect(() => {
        outer.close();
      });
    }
  });

  palette?.addItem({
    command: CommandIDs.newSpy,
    category: 'Kernel'
  });

  menu?.kernelMenu.addGroup([{ command: CommandIDs.newSpy }]);
}


/**
 * Initialization data for the sas-log-viewer-v2 extension.
 */
const extension: JupyterFrontEndPlugin<ISASLogExtension> = {
  id: 'sas-log-viewer-v2:plugin',
  autoStart: true,
  requires: [INotebookTracker],
  optional: [ICommandPalette, IMainMenu, ILayoutRestorer],
  provides: ISASLogExtension,
  activate: async (
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    palette: ICommandPalette | null,
    mainMenu: IMainMenu | null,
    restorer: ILayoutRestorer | null
  ) => {
    console.log('JupyterLab extension sas-log-viewer-v2 is activated!');
    const { commands, docRegistry } = app;
    const extension = new KernelSpyExtension(commands);
    docRegistry.addWidgetExtension('Notebook', extension);

    // Recreate views from layout restorer
    const spyTracker = new WidgetTracker<MainAreaWidget<SASLogView>>({
      namespace: 'saslog'
    });
    if (restorer) {
      void restorer.restore(spyTracker, {
        command: CommandIDs.newSpy,
        args: widget => ({
          path: spyProp.get(widget.content),
          activate: false
        }),
        name: widget => spyProp.get(widget.content),
        when: tracker.restored
      });
    }
    addCommands(app, tracker, spyTracker, palette, mainMenu);
    function refreshNewCommand() {
      commands.notifyCommandChanged(CommandIDs.newSpy);
    }
    // Update the command registry when the notebook state changes.
    tracker.currentChanged.connect(refreshNewCommand);

    let prevWidget: NotebookPanel | null = tracker.currentWidget;
    if (prevWidget) {
      prevWidget.context.sessionContext.kernelChanged.connect(
        refreshNewCommand
      );
    }
    tracker.currentChanged.connect(tracker => {
      if (prevWidget) {
        prevWidget.context.sessionContext.kernelChanged.disconnect(
          refreshNewCommand
        );
      }
      prevWidget = tracker.currentWidget;
      if (prevWidget) {
        prevWidget.context.sessionContext.kernelChanged.connect(
          refreshNewCommand
        );
      }
    });
    requestAPI<any>('get_log')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The sas_log_viewer_v2 server extension appears to be missing.\n${reason}`
        );
      });
    return extension;
  }
};

export default extension;
