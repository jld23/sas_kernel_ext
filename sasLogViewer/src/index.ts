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

import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';

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
        alert('You did it!')
        this._commands.execute(CommandIDs.openSASlog);
      }
    });
    // Add the toolbar button to the notebook toolbar
    panel.toolbar.insertAfter('cellType', 'saslog_button', sasLogbutton);

    return sasLogbutton;
  }
  private _commands: CommandRegistry;
}

interface APODResponse {
  copyright: string;
  date: string;
  explanation: string;
  media_type: 'video' | 'image';
  title: string;
  url: string;
}

class APODWidget extends Widget {
  /**
   * Construct a new APOD widget.
   */
  constructor() {
    super();

    this.addClass('my-apodWidget');

    // Add an image element to the panel
    this.img = document.createElement('img');
    this.node.appendChild(this.img);

    // Add a summary element to the panel
    this.summary = document.createElement('p');
    this.node.appendChild(this.summary);
  }

  /**
   * The image element associated with the widget.
   */
  readonly img: HTMLImageElement;

  /**
   * The summary text element associated with the widget.
   */
  readonly summary: HTMLParagraphElement;

  /**
   * Handle update requests for the widget.
   */
  async onUpdateRequest(msg: Message): Promise<void> {
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${this.randomDate()}`
    );

    if (!response.ok) {
      const data = await response.json();
      if (data.error) {
        this.summary.innerText = data.error.message;
      } else {
        this.summary.innerText = response.statusText;
      }
      return;
    }

    const data = (await response.json()) as APODResponse;

    if (data.media_type === 'image') {
      // Populate the image
      this.img.src = data.url;
      this.img.title = data.title;
      this.summary.innerText = data.title;
      if (data.copyright) {
        this.summary.innerText += ` (Copyright ${data.copyright})`;
      }
    } else {
      this.summary.innerText = 'Random APOD fetched was not an image.';
    }
  }
  /**
   * Get a random date string in YYYY-MM-DD format.
   */
   randomDate(): string {
    const start = new Date(2010, 1, 1);
    const end = new Date();
    const randomDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    return randomDate.toISOString().slice(0, 10);
  }

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
  
  const command: string = 'apod:open';
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
