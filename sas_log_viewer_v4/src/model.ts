import { IIterator } from '@lumino/algorithm';
import { VDomModel } from '@jupyterlab/apputils';
import { Kernel, KernelMessage } from '@jupyterlab/services';

const showLogCommand = '%showLog'
const executeRequestMsgType = 'execute_request'
const statusMsgType = 'status'
const idleExecutionState = 'idle'

export type MessageThread = {
  args: Kernel.IAnyMessageArgs;
  children: MessageThread[];
};

function isHeader(
  candidate: { [key: string]: undefined } | KernelMessage.IHeader
): candidate is KernelMessage.IHeader {
  return candidate.msg_id !== undefined;
}

export class ThreadIterator implements IIterator<ThreadIterator.IElement> {
  constructor(threads: MessageThread[], collapsed: { [key: string]: boolean }) {
    this._threads = threads;
    this._collapsed = collapsed;
    this._index = -1;
    this._child = null;
  }

  iter() {
    return this;
  }

  next(): ThreadIterator.IElement | undefined {
    if (this._child) {
      const next = this._child.next();
      if (next !== undefined) {
        return next;
      }
      this._child = null;
    }
    // Move to next thread
    ++this._index;
    if (this._index >= this._threads.length) {
      return undefined;
    }
    const entry = this._threads[this._index];
    if (
      entry.children.length > 0 &&
      !this._collapsed[entry.args.msg.header.msg_id]
    ) {
      // Iterate over children after this
      this._child = new ThreadIterator(entry.children, this._collapsed);
    }
    return { args: entry.args, hasChildren: entry.children.length > 0 };
  }

  clone(): ThreadIterator {
    const r = new ThreadIterator(this._threads, this._collapsed);
    r._index = this._index;
    if (this._child) {
      r._child = this._child.clone();
    }
    return r;
  }

  private _index: number;
  private _child: ThreadIterator | null;

  private _threads: MessageThread[];
  private _collapsed: { [key: string]: boolean };
}

export namespace ThreadIterator {
  export interface IElement {
    args: Kernel.IAnyMessageArgs;
    hasChildren: boolean;
  }
}

/**
 * Model for a kernel spy.
 */
export class KernelSpyModel extends VDomModel {
  private requestStarted: string = '';
  private logRequestStarted: string = '';
  public logStreamObj: any = {}

  constructor(kernel?: Kernel.IKernelConnection | null) {
    super();
    this.kernel = kernel ?? null;
  }

  clear() {
    this._log.splice(0, this._log.length);
    this._messages = {};
    this._childLUT = {};
    this._roots = [];

    this.logStreamObj = {}


    this.stateChanged.emit(void 0);
  }

  get kernel() {
    return this._kernel;
  }

  set kernel(value: Kernel.IKernelConnection | null) {
    if (this._kernel) {
      this._kernel.anyMessage.disconnect(this.onMessage, this);
    }
    this._kernel = value;
    if (this._kernel) {
      this._kernel.anyMessage.connect(this.onMessage, this);
    }
  }

  get log(): ReadonlyArray<Kernel.IAnyMessageArgs> {
    return this._log;
  }

  get tree(): MessageThread[] {
    return this._roots.map(rootId => {
      return this.getThread(rootId, false);
    });
  }

  depth(args: Kernel.IAnyMessageArgs | null): number {
    if (args === null) {
      return -1;
    }
    let depth = 0;
    while ((args = this._findParent(args))) {
      ++depth;
    }
    return depth;
  }

  getThread(msgId: string, ancestors = true): MessageThread {
    const args = this._messages[msgId];
    if (ancestors) {
      // Work up to root, then work downwards
      let root = args;
      let candidate;
      while ((candidate = this._findParent(root))) {
        root = candidate;
      }
      return this.getThread(root.msg.header.msg_id, false);
    }

    const childMessages = this._childLUT[msgId] || [];
    const childThreads = childMessages.map(childId => {
      return this.getThread(childId, false);
    });
    const thread: MessageThread = {
      args: this._messages[msgId],
      children: childThreads
    };
    return thread;
  }

  protected onMessage(
    sender: Kernel.IKernelConnection,
    args: Kernel.IAnyMessageArgs
  ) {
    const { msg } = args;
    console.log(`%c ${msg.header.msg_type}`, 'color: purple; font-weight: bold; font-size: 14px;')
    console.log(msg.content)
    this._log.push(args);
    this._messages[msg.header.msg_id] = args;
    const parent = this._findParent(args);

    if (parent === null) {
      this._roots.push(msg.header.msg_id);
    } else {
      const header = parent.msg.header;
      this._childLUT[header.msg_id] = this._childLUT[header.msg_id] || [];
      this._childLUT[header.msg_id].push(msg.header.msg_id);
    }

    // Check if execute_request has started
    // @ts-ignore
    if (msg.header.msg_type === executeRequestMsgType && msg.content.code !== showLogCommand && !this.requestStarted) {
      this.requestStarted = msg.header.msg_id
    }

    // Check if execute_request has ended
    const execRequestHasEnded = this.requestStarted &&
      // @ts-ignore
      msg.parent_header?.msg_id === this.requestStarted &&
      // @ts-ignore
      msg.content.execution_state === idleExecutionState && msg.header.msg_type === statusMsgType;

    // If execute_request has finished run %showLog command
    if (execRequestHasEnded) {
      console.log('%c --------- showLog start -------', 'color: red; font-weight: bold;')
      // Fetch the log
      this.kernel?.requestExecute({code: showLogCommand}, true);
    }

    // @ts-ignore
    const isLogRequest = msg.header.msg_type === executeRequestMsgType && msg.content?.code === showLogCommand

    // If it's %showLog execute_request
    if (isLogRequest) {
      this.requestStarted = ''            // reset initial execute_request has started flag
      let id = msg.header.msg_id          // get msg_id
      this.logRequestStarted = id         // set logRequestStartedId so we can start tracking log streams that will come in future
      this.logStreamObj[id] = []          // create array in logStreamObj under msg_id key - this key is later used to identify stream msg.parent_header id
    }


    // If we have log request stared and msg_type is stream save it in logStreamsObj under parent_header msg_id key
    if (this.logRequestStarted && msg.header.msg_type === 'stream') {
      // @ts-ignore
      let id = msg.parent_header?.msg_id
      // @ts-ignore
      this.logStreamObj[id].push(msg.content.text)
    }


    // Check if %showLog has ended
    const logRequestHasEnded = this.logRequestStarted &&
      // @ts-ignore
      msg.parent_header?.msg_id === this.logRequestStarted &&
      // @ts-ignore
      msg.content.execution_state === idleExecutionState && msg.header.msg_type === statusMsgType;
    // If status is Idle and logRequestsStarted this menas that %showLog command has finished
    // and logRequestStarted has to be cleared
    if (logRequestHasEnded && this.logRequestStarted) {
      console.log('%c --------- showLog end -------', 'color: red; font-weight: bold;')
      this.logRequestStarted = ''
    }

    this.stateChanged.emit(undefined);
  }

  private _findParent(
    args: Kernel.IAnyMessageArgs
  ): Kernel.IAnyMessageArgs | null {
    if (isHeader(args.msg.parent_header)) {
      return this._messages[args.msg.parent_header.msg_id] || null;
    }
    return null;
  }

  private _log: Kernel.IAnyMessageArgs[] = [];

  private _kernel: Kernel.IKernelConnection | null = null;

  private _messages: { [key: string]: Kernel.IAnyMessageArgs } = {};
  private _childLUT: { [key: string]: string[] } = {};
  private _roots: string[] = [];
}
