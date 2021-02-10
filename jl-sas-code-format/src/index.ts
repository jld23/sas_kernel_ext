import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jl-sas-code-format extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jl-sas-code-format',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jl-sas-code-format is activated!');
  }
};

export default extension;
