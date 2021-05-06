import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the sas_log_viewer_v3 extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'sas_log_viewer_v3',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension sas_log_viewer_v3 is activated!');

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The sas_log_viewer_v3 server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default extension;
