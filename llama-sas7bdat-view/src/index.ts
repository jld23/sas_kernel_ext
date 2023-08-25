import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

/**
 * Initialization data for the sas7bdat-viewer extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'sas7bdat-viewer:plugin',
  description: 'A JupyterLab extension. to view sas7bdat sessions in current session.',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension sas7bdat-viewer is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('sas7bdat-viewer settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for sas7bdat-viewer.', reason);
        });
    }
  }
};

export default plugin;
