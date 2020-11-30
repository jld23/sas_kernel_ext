import {
    SessionContext,
    ISessionContext,
    sessionContextDialogs
  } from '@jupyterlab/apputils';
  
  import { ServiceManager } from '@jupyterlab/services';
  
  import { Message } from '@lumino/messaging';
  
  import { StackedPanel } from '@lumino/widgets';
  
  import { KernelView } from './widget';
  
  import { KernelModel } from './model';

/**
 * The class name added to the panels.
 */
const PANEL_CLASS = 'jp-RovaPanel';

/**
 * A panel which has the ability to add other children.
 */
export class sasLogPanel extends StackedPanel {
    constructor(manager: ServiceManager.IManager) {
      super();
      this.addClass(PANEL_CLASS);
      this.id = 'kernel-messaging-panel';
      this.title.label = 'SAS Log View';
      this.title.closable = true;
  
      this._sessionContext = new SessionContext({
        sessionManager: manager.sessions,
        specsManager: manager.kernelspecs,
        name: 'SAS Log'
      });
  
      this._model = new KernelModel(this._sessionContext);
      this._example = new KernelView(this._model);
  
      this.addWidget(this._example);
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
  
    dispose(): void {
      this._sessionContext.dispose();
      super.dispose();
    }
  
    protected onCloseRequest(msg: Message): void {
      super.onCloseRequest(msg);
      this.dispose();
    }
  
    private _model: KernelModel;
    private _sessionContext: SessionContext;
    private _example: KernelView;
  }
