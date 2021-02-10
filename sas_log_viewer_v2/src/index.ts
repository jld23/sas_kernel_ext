import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the sas-log-viewer-v2 extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'sas-log-viewer-v2:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension sas-log-viewer-v2 is activated!');

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The sas_log_viewer_v2 server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default extension;
