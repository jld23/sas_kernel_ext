import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { buildIcon } from '@jupyterlab/ui-components';
import { showDialog, Dialog, InputDialog } from '@jupyterlab/apputils';
import { requestAPI } from './handler';

const PLUGIN_ID = 'sas7bdatProfile:sas-settings';

/**
 * Initialization data for the sas7bdatProfile extension.
 */

const extension: JupyterFrontEndPlugin<void> = {
  id: 'PLUGIN_ID:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory, ISettingRegistry],
  activate: async function(
  app: JupyterFrontEnd,
  factory: IFileBrowserFactory,
  settings: ISettingRegistry) {
  console.log('JupyterLab extension sas7bdatProfile is activated!');
  const { commands, docRegistry, contextMenu, restored } = app;
  let saspy_cfg = new String();
  let current_dir = new String();
  let local_config = new Boolean();
  let cfgname = new String();

  function loadSetting(setting: ISettingRegistry.ISettings): void {
    // Read the settings and convert to the correct type
    cfgname = setting.get('cfgname').composite as string;
    console.log(
      `Settings Example extension: cfgname is set to '${cfgname}'`
    );
  }

  Promise.all([restored, settings.load(PLUGIN_ID)])
    .then(([, setting]) => {
      // Read the settings
      loadSetting(setting);

      // Listen for your plugin setting changes using Signal
      setting.changed.connect(loadSetting);

      requestAPI<any>('profile')
        .then(data => {
          console.log(data);
          local_config = data.local_config;
          current_dir = data.current_dir;
          data.saspy_configs.push('<prompt>')
          // Request a choice from a list if the setting is '<prompt>', the default.
          if (cfgname == '<prompt>') {
            InputDialog.getItem({
              title: 'Select SASPy Configuration:',
              label: 'Choose your configuration:',
              items: data.saspy_configs
            }).then(value => {
              saspy_cfg = value.value;
              console.log('SASPy Configuration: ' + saspy_cfg);
              Promise.all([
                setting.set('cfgname', saspy_cfg as string)
              ])
            });

            console.log(data['saspy_configs']);

          }

        })
        .catch(reason => {
          console.error(
            `The sas7bdatProfile server extension appears to be missing.\n${reason}`
          );
        });
    })
  // register the sas7bdat file type
  docRegistry.addFileType({
    name: 'sas7bdat',
    // icon: sasIcon,
    icon: buildIcon,
    displayName: 'SAS Data Set',
    extensions: ['.sas7bdat'],
    fileFormat: 'base64',
    contentType: 'file',
    mimeTypes: ['text/plain'],
  });


  commands.addCommand('sas7dbdatProfile/context-menu:open', {
    label: 'Profile sas7bdat file',
    caption: 'Profile sas7bdat file',
    // TODO: Get new icon.
    icon: buildIcon,
    execute: async () => {
      const file = factory.tracker.currentWidget.selectedItems().next();
      // POST request
      const dataToSend = {
        fpath: file.path,
        origin: origin,
        cfgname: saspy_cfg,
        local_config: local_config,
        current_dir: current_dir,

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
    }
  });
  // Add menu item for sas7bdat files only.
  contextMenu.addItem({
    command: 'sas7dbdatProfile/context-menu:open',
    selector: '.jp-DirListing-item[data-file-type="sas7bdat"]',
    rank: 0,
  });
}
}
export default extension;
