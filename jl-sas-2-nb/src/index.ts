import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ILauncher } from '@jupyterlab/launcher';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { showDialog, Dialog } from '@jupyterlab/apputils';

import { sasIcon } from './iconImport';
import { requestAPI } from './handler';


/**
 * Initialization data for the jl-sas-2-nb extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jl-sas-2-nb:plugin',
  autoStart: true,
  optional: [ILauncher],
  requires: [IFileBrowserFactory],
  activate: async (
    app: JupyterFrontEnd,
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
      console.log("jl-sas-2-nb starting1");
      app.commands.addCommand('jl-sas-2-nb/context-menu:open', {
        label: 'Convert SAS to ipynb',
        caption: 'Convert a SAS file to a notebook',
        icon: sasIcon,
        execute: async () => { 
          const file = factory.tracker.currentWidget.selectedItems().next();
          //window.alert("in addCommand execute " + file.path)
  
          // TODO: Call server extension convert(file.path)
          // POST request
          const dataToSend = { name: file.path };
          //const dataToSend = { name: '/home/dsw/source/github/sas_kernel_ext/jl-sas-2-nb/test_folder/untitled.sas' };
          try {
            const reply = await requestAPI<any>('convert', {
              body: JSON.stringify(dataToSend),
              method: 'POST'
            });
            console.log(reply);
          } catch (reason) {
            console.error(
              `Error on POST /jl-sas-2-nb/convert ${dataToSend}.\n${reason}`
            );
          }
          showDialog({
            title: file.name,
            body: 'Path: ' + file.path,
            buttons: [Dialog.okButton()]
          }).catch(e => console.log(e));
        }
      });
      console.log("jl-sas-2-nb starting2");

      app.contextMenu.addItem({
        command: 'jl-sas-2-nb/context-menu:open',
        selector: '.jp-DirListing-item[data-file-type="sas"]',
        rank: 0
      });
      console.log("jl-sas-2-nb starting3");
  }
};

export default extension;
