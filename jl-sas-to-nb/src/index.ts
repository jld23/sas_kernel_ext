import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './jl-sas-to-nb';

/**
 * Initialization data for the jl-sas-to-nb extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jl-sas-to-nb',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jl-sas-to-nb is activated!');

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jl_sas_to_nb server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default extension;
