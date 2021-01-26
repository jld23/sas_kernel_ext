import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { IMainMenu } from '@jupyterlab/mainmenu';

import { sasIcon } from './iconImport';

const FACTORY = 'Editor';
const PALETTE_CATEGORY = 'Text Editor';
namespace CommandIDs {
  export const createNew = 'fileeditor:create-new-sas-file';
}


/**
 * Initialization data for the jlab-create-sas-file extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jlab-create-sas-file:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory],
  optional: [ILauncher, IMainMenu, ICommandPalette],
  activate: (
    app: JupyterFrontEnd,
    browserFactory: IFileBrowserFactory,
    launcher: ILauncher,
    menu: IMainMenu | null,
    palette: ICommandPalette
  ) => {
    const { commands } = app;

    const command = CommandIDs.createNew;

    commands.addCommand(command, {
      label: args => (args['isPalette'] ? 'New SAS File' : 'SAS File'),
      caption: 'Create a new SAS file',
      icon: sasIcon,
      execute: async args => {
        const cwd = args['cwd'] || browserFactory.defaultBrowser.model.path;
        const model = await commands.execute('docmanager:new-untitled', {
          path: cwd,
          type: 'file',
          ext: 'sas'
        });
        return commands.execute('docmanager:open', {
          path: model.path,
          factory: FACTORY
        });
      }
    });

    // add to the launcher
    if (launcher) {
      launcher.add({
        command,
        category: 'Other',
        rank: 1
      });
    }

    // add to the palette
    if (palette) {
      palette.addItem({
        command,
        args: { isPalette: true },
        category: PALETTE_CATEGORY
      });
    }

    // add to the menu
    if (menu) {
      menu.fileMenu.newMenu.addGroup([{ command }], 30);
    }

    // add to context menu
    app.contextMenu.addItem({
      command: command,
      selector: '.jp-DirListing-content',
      rank: 0
    });
  }
};

export default extension;

