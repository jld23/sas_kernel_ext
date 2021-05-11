import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { ITranslator } from '@jupyterlab/translation';

import { Menu } from '@lumino/widgets';

import { ExamplePanel } from './panel';

// import {
//   NotebookPanel
// } from '@jupyterlab/notebook';

// import { requestAPI } from './handler';

namespace CommandIDs {
  export const create = 'SAS-View-Log:create';
}

/**
 * Initialization data for the sas_log_viewer_v3 extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'sas_log_viewer_v3',
  autoStart: true,
  requires: [ITranslator],
  activate: activate
  // activate: (app: JupyterFrontEnd) => {
  //   console.log('JupyterLab extension sas_log_viewer_v3 is activated!');

  //   requestAPI<any>('get_example')
  //     .then(data => {
  //       console.log(data);
  //     })
  //     .catch(reason => {
  //       console.error(
  //         `The sas_log_viewer_v3 server extension appears to be missing.\n${reason}`
  //       );
  //     });
  // }
};
function activate(
  app: JupyterFrontEnd,
  translator: ITranslator
): void {
  const manager = app.serviceManager;
  const trans = translator.load('jupyterlab');
}

async function createPanel(): Promise<ExamplePanel> {
  const panel = new ExamplePanel(manager, translator);
  shell.add(panel, 'main');
  return panel;
}

// add commands to registry
commands.addCommand(CommandIDs.create, {
  label: trans.__('Open the Kernel Messaging Panel'),
  caption: trans.__('Open the Kernel Messaging Panel'),
  execute: createPanel
}
//  WILL NEED TO BE REMOVED

// add menu tab
const exampleMenu = new Menu({ commands });
exampleMenu.title.label = trans.__('Kernel Messaging');
mainMenu.addMenu(exampleMenu);

// add commands to registry
commands.addCommand(CommandIDs.create, {
  label: trans.__('Open the Kernel Messaging Panel'),
  caption: trans.__('Open the Kernel Messaging Panel'),
  execute: createPanel
});

// add items in command palette and menu
palette.addItem({ command: CommandIDs.create, category });
exampleMenu.addItem({ command: CommandIDs.create });
}

// Add launcher
if (launcher) {
  launcher.add({
    command: CommandIDs.create,
    category: category
  });
}


);

export default extension;
