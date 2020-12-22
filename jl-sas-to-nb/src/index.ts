import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

// import { ICommandPalette, IFrame } from '@jupyterlab/apputils';

// import { PageConfig } from '@jupyterlab/coreutils';

import { ILauncher } from '@jupyterlab/launcher';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { showDialog, Dialog } from '@jupyterlab/apputils';
//import { buildIcon, runIcon } from '@jupyterlab/ui-components';

// Need to add back
// import { requestAPI } from './jl-sas-to-nb';
import { sasIcon }  from './CodeSnippetLangues';

/**
 * The command IDs used by the server extension plugin.
 */
// namespace CommandIDs {
//   export const get = 'server:get-file';
// }

/**
 * Initialization data for the jl-sas-to-nb extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jl-sas-to-nb',
  autoStart: true,
  optional: [ILauncher],
  requires: [IFileBrowserFactory],
  activate: async (app: JupyterFrontEnd,
    // palette: ICommandPalette,
    // launcher: ILauncher | null,
    factory: IFileBrowserFactory) => {
    app.docRegistry.addFileType({
      name: 'sas',
      icon: sasIcon,
      displayName: 'SAS File',
      extensions: ['.sas'],
      fileFormat: 'text',
      contentType: 'file',
      mimeTypes: ['text/plain']
    });

    app.commands.addCommand('jl-sas-to-nb/context-menu:open', {
      label: 'Convert SAS to ipynb',
      caption: 'Convert a SAS file to a notebook',
      icon: sasIcon,
      execute: () => {
        const file = factory.tracker.currentWidget.selectedItems().next();
        // window.alert("in addCommand execute " + file.path)

        // TODO: Call server extension convert(file.path)
        showDialog({
          title: file.name,
          body: 'Path: ' + file.path,
          buttons: [Dialog.okButton()]
        }).catch(e => console.log(e));
      }
    });
    //window.alert("after addCommand")

    app.contextMenu.addItem({
      command: 'jl-sas-to-nb/context-menu:open',
      selector: '.jp-DirListing-item[data-file-type="sas"]',
      rank: 0
    });

    //window.alert("after addItem")

    console.log('JupyterLab extension server-extension-example is activated!');
    
    // GET request
    // try {
    //   const data = await requestAPI<any>('hello');
    //   console.log(data);
    // } catch (reason) {
    //   console.error(`Error on GET /jl-sas-to-nb/hello.\n${reason}`);
    // }

    // POST request
    // const dataToSend = { name: 'George' };
    // try {
    //   const reply = await requestAPI<any>('hello', {
    //     body: JSON.stringify(dataToSend),
    //     method: 'POST'
    //   });
    //   console.log(reply);
    // } catch (reason) {
    //   console.error(
    //     `Error on POST /jl-sas-to-nb/hello ${dataToSend}.\n${reason}`
    //   );
    // }
    // const { commands, shell } = app;
    // const command = CommandIDs.get;
    // const category = 'Extension Examples';

    // commands.addCommand(command, {
    //   label: 'SAS Get Server Content in a IFrame Widget',
    //   caption: 'Get Server SAS Content in a IFrame Widget',
    //   execute: () => {
    //     const widget = new IFrameWidget();
    //     shell.add(widget, 'main');
    //   }
    // });

    // palette.addItem({ command, category: category });

    // if (launcher) {
    //   // Add launcher
    //   launcher.add({
    //     command: command,
    //     category: category
    //   });
    // }
  }
};

export default extension;

// class IFrameWidget extends IFrame {
//   constructor() {
//     super();
//     const baseUrl = PageConfig.getBaseUrl();
//     this.url = baseUrl + 'jl-sas-to-nb/static/index.html';
//     this.id = 'sas-example';
//     this.title.label = 'Server Response FooBar';
//     this.title.closable = true;
//     this.node.style.overflowY = 'auto';
//   }
// }
