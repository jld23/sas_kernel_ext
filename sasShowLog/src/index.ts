import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

//import { ICommandPalette, InputDialog } from '@jupyterlab/apputils';

import { ICommandPalette} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { Menu } from '@lumino/widgets';

import { sasLogPanel } from './panel';

/**
 * The command IDs used by the console plugin.
 */
namespace CommandIDs {
  export const create = 'sasShowLog:create';
  export const pLog = 'sasShowLog:pLog';
  export const fLog = 'sasShowLog:fLog';
}


/**
 * Initialization data for the extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'sasShowLog',
  autoStart: true,
  optional: [ILauncher],
  requires: [ICommandPalette, IMainMenu, IRenderMimeRegistry],
  activate: activate
};

/**
 * Activate the JupyterLab extension.
 *
 * @param app Jupyter Font End
 * @param palette Jupyter Commands Palette
 * @param mainMenu Jupyter Menu
 * @param rendermime Jupyter Render Mime Registry
 * @param launcher [optional] Jupyter Launcher
 */
function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  mainMenu: IMainMenu,
  rendermime: IRenderMimeRegistry,
  launcher: ILauncher | null
): void {
  const manager = app.serviceManager;
  const { commands, shell } = app;
  const category = 'SAS Kernel';

  let panel: sasLogPanel;

  /**
   * Creates a SAS Log panel.
   *
   * @returns The panel
   */
  async function createPanel(): Promise<sasLogPanel> {
    panel = new sasLogPanel(manager, rendermime);
    shell.add(panel, 'main');
    return panel;
  }

  // add menu tab
  const sasKernelMenu = new Menu({ commands });
  sasKernelMenu.title.label = 'SAS Log';
  mainMenu.addMenu(sasKernelMenu);

  // add commands to registry
  commands.addCommand(CommandIDs.create, {
    label: 'Open SAS Log Window',
    caption: 'Open SAS Log Window',
    execute: createPanel
  });

  commands.addCommand(CommandIDs.pLog, {
    label: 'Show SAS Log for last Submission',
    caption: 'Show SAS Log for last Submission',
    execute: async () => {
      // Create the panel if it does not exist
      if (!panel) {
        await createPanel();
      }
      const code = '%showLog';
      panel.execute(code);
    }
  });

  commands.addCommand(CommandIDs.fLog, {
    label: 'Show SAS Log for Session',
    caption: 'Show SAS Log for Session',
    execute: async () => {
      // Create the panel if it does not exist
      if (!panel) {
        await createPanel();
      }
      const code = '%showFullLog';
      panel.execute(code);
    }
  });

 // add items in command palette and menu
 [CommandIDs.create, CommandIDs.pLog, CommandIDs.fLog].forEach(command => {
 //[CommandIDs.create, CommandIDs.execute].forEach(command => {
  palette.addItem({ command, category });
  sasKernelMenu.addItem({ command });
});



// Add launcher
if (launcher) {
  launcher.add({
    command: CommandIDs.create,
    category: category
  });
}
}

export default extension;
