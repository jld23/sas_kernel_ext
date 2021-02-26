import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';


import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { buildIcon} from '@jupyterlab/ui-components';
import { showDialog, Dialog } from '@jupyterlab/apputils';

import { requestAPI } from './handler';

/**
 * Initialization data for the sas7bdatProfile extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'sas7bdatProfile:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, factory: IFileBrowserFactory) => {
    console.log('JupyterLab extension sas7bdatProfile is activated!');
    app.docRegistry.addFileType({
      name: 'sas7bdat',
      // icon: sasIcon,
      icon: buildIcon,
      displayName: 'SAS Data Set',
      extensions: ['.sas7bdat'],
      fileFormat: 'base64',
      contentType: 'file',
      mimeTypes: ['text/plain'],
    });

    requestAPI<any>('profile')
      .then(data => {
        console.log(data);
        // list of configurations current registered
        console.log(data['saspy_configs'])
      })
      .catch(reason => {
        console.error(
          `The sas7bdatProfile server extension appears to be missing.\n${reason}`
        );
      });
    app.commands.addCommand('sas7dbdatProfile/context-menu:open', {
      label: 'Profile sas7bdat file',
      caption: 'Profile sas7bdat file',
      icon: buildIcon,
      execute: async () => {
        const file = factory.tracker.currentWidget.selectedItems().next();
        // POST request
        const dataToSend = { fpath: file.path, origin: origin };
        try {
          const reply = await requestAPI<any>('explore', {
            body: JSON.stringify(dataToSend),
            method: 'POST',
          });
          console.log(reply);
          showDialog({
            title: 'Profiled',
            buttons: [Dialog.okButton()]
          })
        } catch (reason) {
          console.error(
            `Error on POST /sas7dbdatProfile/ ${dataToSend}.\n${reason}`
          );
        }
      }
    })
  }
};

export default extension;
