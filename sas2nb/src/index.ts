import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { showDialog, Dialog } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { sasIcon } from './iconImport';

import { requestAPI } from './handler';

/**
 * Initialization data for the sas2nb extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'sas2nb:plugin',
  autoStart: true,
  optional: [ILauncher],
  requires: [IFileBrowserFactory],
  activate: async (app: JupyterFrontEnd, factory: IFileBrowserFactory) => {
    console.log('JupyterLab extension sas2nb is activated!');
    app.docRegistry.addFileType({
      name: 'sas',
      icon: sasIcon,
      displayName: 'SAS File',
      extensions: ['.sas'],
      fileFormat: 'text',
      contentType: 'file',
      mimeTypes: ['text/plain'],
    });

    await requestAPI<any>('convert')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The sas2nb server extension appears to be missing.\n${reason}`
        );
      });
      app.commands.addCommand('sas2nb/context-menu:open', {
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
            showDialog({
              title: 'Converted',
              body: `${file.path} was converted to a notebook.`,
              buttons: [Dialog.okButton()],
            }).catch((e) => console.log(e));
          } catch (reason) {
            console.error(`Error on POST /sas2nb/convert ${dataToSend}.\n${reason}`);
          }
        },
      });
  
      app.contextMenu.addItem({
        command: 'sas2nb/context-menu:open',
        selector: '.jp-DirListing-item[data-file-type="sas"]',
        rank: 0,
      });
  }
};

export default extension;
