import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
// import { showDialog, Dialog } from '@jupyterlab/apputils';
// import { PageConfig } from '@jupyterlab/coreutils';
import { buildIcon} from '@jupyterlab/ui-components';
import { requestAPI } from './handler';

/**
 * Initialization data for the jlab-sas7bdat-view extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jlab-sas7bdat-view:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, factory: IFileBrowserFactory) => {
    console.log('JupyterLab extension jlab-sas7bdat-view is activated!');
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
    app.commands.addCommand('jlab-sas7bdat-view/context-menu:open', {
      label: 'Report the details of sas7bdat file',
      caption: 'Report the details of sas7bdat file',
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
        } catch (reason) {
          console.error(
            `TEST:::::Error on POST /jlab-sas7bdat-view/ ${dataToSend}.\n${reason}`
          );
        }

        console.log('JupyterLab extension jlab-sas7bdat-view after POST request');
        // Create new frame and put the contents and 10 rows in it.

        // showDialog({
        //   title: 'Converted',
        //   body: `${file.path} was converted to a notebook.`,
        //   buttons: [Dialog.okButton()],
        // }).catch((e) => console.log(e));
      },
    });

    app.contextMenu.addItem({
      command: 'jlab-sas7bdat-view/context-menu:open',
      selector: '.jp-DirListing-item[data-file-type="sas7bdat"]',
      rank: 0,
    });


    // requestAPI<any>('get_example')
    //   .then(data => {
    //     console.log(data);
    //   })
    //   .catch(reason => {
    //     console.error(
    //       `The jlab_sas7bdat_view server extension appears to be missing.\n${reason}`
    //     );
    //   });
  }
};

export default extension;

// class IFrameWidget extends IFrame {
//   constructor() {
//     super();
//     const baseUrl = PageConfig.getBaseUrl();
//     this.url = baseUrl + 'jlab-ext-example/public/index.html';
//     this.id = 'doc-example';
//     this.title.label = 'Server Doc';
//     this.title.closable = true;
//     this.node.style.overflowY = 'auto';
//   }
// }
