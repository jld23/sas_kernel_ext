import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { showDialog, Dialog } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { requestAPI } from './handler';
import { sasIcon } from './iconImport';


/**
 * Initialization data for the jlab-sas-2-nb extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jlab-sas-2-nb:plugin',
  autoStart: true,
  optional: [ILauncher],
  requires: [IFileBrowserFactory],
  activate: async (
    app: JupyterFrontEnd,
    factory: IFileBrowserFactory
    //palette: ICommandPalette,
    //launcher: ILauncher | null
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
    console.log('JupyterLab extension jlab-sas-2-nb is activated!');

    // // GET request
    // try {
    //   const data = await requestAPI<any>('convert');
    //   console.log(data);
    // } catch (reason) {
    //   console.error(`Error on foobar GET /jlab-sas-2-nb/convert.\n${reason}`);
    // }
    // console.log('JupyterLab extension jlab-sas-2-nb after GET request');
    app.commands.addCommand('jlab-sas-2-nb/context-menu:open', {
      label: 'Convert SAS to ipynb',
      caption: 'Convert a SAS file to a notebook',
      icon: sasIcon,
      execute: async () => {
        const file = factory.tracker.currentWidget.selectedItems().next();

        // POST request
        const dataToSend = {fpath: file.path, origin: origin};
        try {
          const reply = await requestAPI<any>('convert', {
            body: JSON.stringify(dataToSend),
            method: 'POST'
          });
          console.log(reply);
          

        } catch (reason) {
          console.error(
            `Error on POST /jlab-sas-2-nb/convert ${dataToSend}.\n${reason}`
          );
        }
        console.log('JupyterLab extension jlab-sas-2-nb after POST request');
        showDialog({
          title: "Converted",
          body: `${file.path} was converted to a notebook.`,
          buttons: [Dialog.okButton()]
        }).catch(e => console.log(e));
      }
    });

    app.contextMenu.addItem({
      command: 'jl-sas-2-nb/context-menu:open',
      selector: '.jp-DirListing-item[data-file-type="sas"]',
      rank: 0
    });
    console.log('JupyterLab extension jlab-sas-2-nb after ADD menu item');
  }
};

export default extension;
