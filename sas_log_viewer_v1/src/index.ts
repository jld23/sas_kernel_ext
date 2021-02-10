import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import { requestAPI } from './handler';

import { CommandToolbarButton,
          ICommandPalette,
          MainAreaWidget,
         WidgetTracker
          } from '@jupyterlab/apputils';

import { CommandRegistry } from '@lumino/commands';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { NotebookPanel, INotebookTracker, INotebookModel } from "@jupyterlab/notebook";

// import { showDialog, Dialog} from '@jupyterlab/apputils';

// import { sasLogIcon } from './iconImport';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { Token } from '@lumino/coreutils';

import { KernelSpyView } from './widget';

import { AttachedProperty } from '@lumino/properties';

import { find } from '@lumino/algorithm';


/**
 * IDs of the commands added by this extension.
 */
namespace CommandIDs {
  export const newSASLog = 'saslog:new';
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

const spyProp = new AttachedProperty<KernelSpyView, string>({
  create: () => '',
  name: 'SpyTarget'
});

export class SASLogExtension implements ISASLogExtension {
  /**
   *
   */
  constructor(commands: CommandRegistry) {
    this.commands = commands;
  }


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
  for (const id of [CommandIDs.newSASLog]) {
    const button = new CommandToolbarButton({ id, commands: this.commands });
    // button.addClass('jp-kernelspy-nbtoolbarbutton');
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

function addCommands(
  app: JupyterFrontEnd,
  tracker: INotebookTracker,
  spyTracker: WidgetTracker<MainAreaWidget<KernelSpyView>>,
  palette: ICommandPalette | null,
  menu: IMainMenu | null
): void {
  const { commands, shell } = app;

function hasKernel(): boolean {
  return (
    tracker.currentWidget !== null &&
    (tracker.currentWidget.context.sessionContext?.session?.kernel ??
      null) !== null
  );
}

commands.addCommand(CommandIDs.newSASLog, {
  label: 'SAS Log',
  caption: 'Open a window to show the SAS log.',
  // icon: sasLogIcon,
  iconClass: 'jp-Icon jp-Icon-16 jp-kernelspyIcon',
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
    const widget = new KernelSpyView(
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
  command: CommandIDs.newSASLog,
  category: 'Kernel'
});

menu?.kernelMenu.addGroup([{ command: CommandIDs.newSASLog }]);
}


/**
 * Initialization data for the sas_log_viewer_v1 extension.
 */
const extension: JupyterFrontEndPlugin<ISASLogExtension> = {
  id: 'sas_log_viewer_v1:plugin',
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
    console.log('JupyterLab extension sas_log_viewer_v1 is activated!');
    const { commands, docRegistry } = app;
    const extension = new SASLogExtension(commands);
    docRegistry.addWidgetExtension('Notebook', extension);
    
    // Recreate views from layout restorer
    const spyTracker = new WidgetTracker<MainAreaWidget<KernelSpyView>>({
      namespace: 'saslog'
    });

    addCommands(app, tracker, spyTracker, palette, mainMenu);
    function refreshNewCommand() {
      commands.notifyCommandChanged(CommandIDs.newSASLog);
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
    return extension;


    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The sas_log_viewer_v1 server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default extension;
