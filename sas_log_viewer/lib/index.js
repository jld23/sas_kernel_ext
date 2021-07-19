/**
 * Initialization data for the sas_log_viewer extension.
 */
const extension = {
    id: 'sas_log_viewer',
    autoStart: true,
    activate: (app) => {
        console.log('JupyterLab extension sas_log_viewer is activated!');
    }
};
export default extension;
