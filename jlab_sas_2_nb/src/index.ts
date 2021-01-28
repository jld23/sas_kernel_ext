import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { showDialog, Dialog } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { sasIcon } from './iconImport';
import { requestAPI } from './handler';

/**
 * The command IDs used by the server extension plugin.
 */

const extension: JupyterFrontEndPlugin<void> = {
  id: 'jlab-sas-2-nb:plugin',
  autoStart: true,
  optional: [ILauncher],
  requires: [IFileBrowserFactory],
  activate: async (app: JupyterFrontEnd, factory: IFileBrowserFactory) => {
    console.log('JupyterLab extension jlab-sas-2-nb is activated!');
    app.docRegistry.addFileType({
      name: 'sas',
      icon: sasIcon,
      displayName: 'SAS File',
      extensions: ['.sas'],
      fileFormat: 'text',
      contentType: 'file',
      mimeTypes: ['text/plain'],
    });

    // GET request
    try {
      const data = await requestAPI<any>('convert');
      console.log(data);
    } catch (reason) {
      console.error(
        `TEST:::::Error on GET /jlab-sas-2-nb/convert.\n${reason}`
      );
    }
    app.commands.addCommand('jlab-sas-2-nb/context-menu:open', {
      label: 'Convert SAS to ipynb',
      caption: 'Convert a SAS file to a notebook',
      icon: sasIcon,
      execute: async () => {
        const file = factory.tracker.currentWidget.selectedItems().next();

        // POST request
        const dataToSend = { fpath: file.path, origin: origin };
        try {
          const reply = await requestAPI<any>('convert', {
            body: JSON.stringify(dataToSend),
            method: 'POST',
          });
          console.log(reply);
        } catch (reason) {
          console.error(
            `TEST:::::Error on POST /jlab-sas-2-nb/convert ${dataToSend}.\n${reason}`
          );
        }

        console.log('JupyterLab extension jlab-sas-2-nb after POST request');
        showDialog({
          title: 'Converted',
          body: `${file.path} was converted to a notebook.`,
          buttons: [Dialog.okButton()],
        }).catch((e) => console.log(e));
      },
    });

    app.contextMenu.addItem({
      command: 'jlab-sas-2-nb/context-menu:open',
      selector: '.jp-DirListing-item[data-file-type="sas"]',
      rank: 0,
    });
  },
};

export default extension;
