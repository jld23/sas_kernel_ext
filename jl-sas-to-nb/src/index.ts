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
import { sasIcon } from './CodeSnippetLangues';
import { requestAPI } from './jl-sas-to-nb';

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
  activate: async (
    app: JupyterFrontEnd,
    // palette: ICommandPalette,
    // launcher: ILauncher | null,
    factory: IFileBrowserFactory
  ) => {
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
      execute: async () => { 
        const file = factory.tracker.currentWidget.selectedItems().next();
        // window.alert("in addCommand execute " + file.path)

        // TODO: Call server extension convert(file.path)
        // POST request
        //const dataToSend = { name: file.path };
        const dataToSend = { name: '/home/dsw/source/github/sas_kernel_ext/jl-sas-to-nb/test_folder/untitled.sas' };
        try {
          const reply = await requestAPI<any>('convert', {
            body: JSON.stringify(dataToSend),
            method: 'POST'
          });
          console.log(reply);
        } catch (reason) {
          console.error(
            `Error on POST /jl-sas-to-nb/convert ${dataToSend}.\n${reason}`
          );
        }
        // GET request
        // try {
        //   const data = await requestAPI<any>('Jared');
        //   console.log(data);
        // } catch (reason) {
        //   console.error(`Error on GET /jl-sas-to-nb/convert.\n${reason}`);
        // }
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

  
  }
};

export default extension;
