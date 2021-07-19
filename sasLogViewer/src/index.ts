import {
  JupyterFrontEnd,
  ILayoutRestorer,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette,
  WidgetTracker,
  MainAreaWidget
} from '@jupyterlab/apputils';

import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
  INotebookModel,
  NotebookPanel,
  INotebookTracker
} from '@jupyterlab/notebook';

import { IDisposable } from '@lumino/disposable';
import { CommandRegistry } from '@lumino/commands';


import { sasLogViewer } from './iconImport';
import APODWidget from "./APODWidget";


namespace CommandIDs {
//   // export const openRetro = 'retrolab:open';
  export const openSASlog = 'saslog:open';
//   // export const launchRetroTree = 'retrolab:launchtree';
}

// function hasKernel(): boolean {
//   return (
//     tracker.currentWidget !== null &&
//     (tracker.currentWidget.context.sessionContext?.session?.kernel ??
//       null) !== null &&
//       tracker.currentWidget.sessionContext.prevKernelName == 'sas'
//   );
// }
class SASLogButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
     /**
   * Instantiate a new SASLogButton.
   * @param commands The command registry.
   */
    constructor(commands: CommandRegistry) {
      this._commands = commands;
    }

  createNew(panel: NotebookPanel): IDisposable {
    // Create the toolbar button
    const sasLogbutton = new ToolbarButton({
      tooltip: 'Show SAS Log for Notebook',
      icon: sasLogViewer,
      // enabled: hasKernel,
      onClick: () => {
        console.log('You did it!')
        this._commands.execute(CommandIDs.openSASlog);
      }
    });
    // Add the toolbar button to the notebook toolbar
    panel.toolbar.insertAfter('cellType', 'saslog_button', sasLogbutton);

    return sasLogbutton;
  }
  private _commands: CommandRegistry;
}

/**
 * Activate the APOD widget extension.
 */
function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette | null,
  // translator: ITranslator,
  // menu: IMainMenu | null,
  // tracker: INotebookTracker,
  restorer: ILayoutRestorer
) {
  console.log('JupyterLab extension sasLogViewer is activated!');
  const { commands, docRegistry, shell } = app;
  const saslog_button = new SASLogButton(commands);
  docRegistry.addWidgetExtension('Notebook', saslog_button);

  let widget: MainAreaWidget<APODWidget>;

  const command: string = CommandIDs.openSASlog;
  commands.addCommand(command, {
    label: 'SAS Random Astronomy Picture',
    execute: () => {
      if (!widget || widget.isDisposed) {
        // Create a single widget
        const content = new APODWidget();
        widget = new MainAreaWidget({ content });
        widget.id = 'apod-jupyterlab';
        widget.title.label = 'SAS Astronomy Picture';
        widget.title.closable = true;
      }
      if (!tracker.has(widget)) {
        // Track the state of the widget for later restoration
        tracker.add(widget);
      }

      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        shell.add(widget, 'main');
      }
      // Refresh the picture in the widget
      widget.content.update();
      // Activate the widget
      shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Tutorial' });
  let tracker = new WidgetTracker<MainAreaWidget<APODWidget>>({
    namespace: 'apod'
  });
  restorer.restore(tracker, {
    command,
    name: () => 'apod'
  });
}

/**
 * Initialization data for the sasLogViewer extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'sasLogViewer',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer, INotebookTracker],
  activate: activate
};

export default extension;
