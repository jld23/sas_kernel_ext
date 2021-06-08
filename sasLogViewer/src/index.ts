import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the sasLogViewer extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'sasLogViewer',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension sasLogViewer is activated!');
  }
};

export default extension;
