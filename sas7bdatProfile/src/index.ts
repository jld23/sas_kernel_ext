import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { buildIcon } from '@jupyterlab/ui-components';
import { showDialog, Dialog } from '@jupyterlab/apputils';
import { requestAPI } from './handler';

/**
 * Initialization data for the sas7bdatProfile extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'sas7bdatProfile:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: async function (app: JupyterFrontEnd, factory: IFileBrowserFactory) {
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

    await requestAPI<any>('profile')
      .then(data => {
        console.log(data);
        // list of configurations current registered
        //  TODO: data needs to be scoped to be passable to POST request
        console.log(data['saspy_configs']);
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
        const dataToSend = {
          fpath: file.path,
          origin: origin,
          //  TODO: once data is global these won't need to be hard coded
          cfgname: 'localhost',
          // local_config: data_from_get['local_config']
          current_dir: '/home/dsw/source/github/sas_kernel_ext',
          local_config: true

        };
        await requestAPI<any>('profile', {
          body: JSON.stringify(dataToSend),
          method: 'POST'
        }).then(reply => {
          console.log(reply);
          // TODO: take the reply and create displays from the json response.
          showDialog({
            title: 'Profiled',
            hasClose: false,
            buttons: [Dialog.okButton()]
          })
            .catch(reason => {
              console.error(`Error on POST /sas7dbdatProfile/ ${dataToSend}.\n${reason}`);
            });

        });
        // try {
        //   const reply = await requestAPI<any>('profile', {
        //     body: JSON.stringify(dataToSend),
        //     method: 'POST',
        //   });
        //   console.log(reply);
        //   showDialog({
        //     title: 'Profiled',
        //     hasClose: false,
        //     buttons: [Dialog.okButton()]
        //   })
        // } catch (reason) {
        //   console.error(
        //     `Error on POST /sas7dbdatProfile/ ${dataToSend}.\n${reason}`
        //   );
        // }
      }
    });
    app.contextMenu.addItem({
      command: 'sas7dbdatProfile/context-menu:open',
      selector: '.jp-DirListing-item[data-file-type="sas7bdat"]',
      rank: 0,
    });
  }
};

export default extension;
