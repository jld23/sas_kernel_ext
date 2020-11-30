import {
    SessionContext,
    ISessionContext,
    sessionContextDialogs
  } from '@jupyterlab/apputils';

  
import { OutputAreaModel, SimplifiedOutputArea } from '@jupyterlab/outputarea';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { KernelMessage, ServiceManager } from '@jupyterlab/services';

import { Message } from '@lumino/messaging';

import { StackedPanel } from '@lumino/widgets';


/**
 * The class name added to the panels.
 */
const PANEL_CLASS = 'jp-RovaPanel';

/**
 * A panel which has the ability to add other children.
 */
export class sasLogPanel extends StackedPanel {
    constructor(
      manager: ServiceManager.IManager,
      rendermime: IRenderMimeRegistry
    ) {
      super();
      this.addClass(PANEL_CLASS);
      this.id = 'sas_kernel-log-panel';
      this.title.label = 'SAS Kernel Log View';
      this.title.closable = true;
  
      this._sessionContext = new SessionContext({
        sessionManager: manager.sessions,
        specsManager: manager.kernelspecs,
        name: 'SAS Log'
      });
  
      this._outputareamodel = new OutputAreaModel();
      this._outputarea = new SimplifiedOutputArea({
        model: this._outputareamodel,
        rendermime: rendermime
      });
  
      this.addWidget(this._outputarea);
      // Get the current active Kernel
  
      void this._sessionContext
        .initialize()
        .then(async value => {
          if (value) {
            await sessionContextDialogs.selectKernel(this._sessionContext);
          }
        })
        .catch(reason => {
          console.error(
            `Failed to initialize the session in sasLogPanel.\n${reason}`
          );
        });
    }
  
    get session(): ISessionContext {
      return this._sessionContext;
    }
    // Make sure the current session is a SAS Kernel
  
    dispose(): void {
      this._sessionContext.dispose();
      super.dispose();
    }
  
    execute(code: string): void {
      SimplifiedOutputArea.execute(code, this._outputarea, this._sessionContext)
        .then((msg: KernelMessage.IExecuteReplyMsg) => {
          console.log(msg);
        })
        .catch(reason => console.error(reason));
    }

    protected onCloseRequest(msg: Message): void {
      super.onCloseRequest(msg);
      this.dispose();
    }
  
    private _sessionContext: SessionContext;
    private _outputarea: SimplifiedOutputArea;
    private _outputareamodel: OutputAreaModel;
  }
