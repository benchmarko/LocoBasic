import type { INodeParts, MessageFromWorker, MessageToWorker, NodeWorkerType } from "./Interfaces";
import type { VmMessageHandlerCallbacks } from "./VmMessageHandler";
import { VmMainBase } from "./VmMainBase";


export class NodeVmMain extends VmMainBase {

    private nodeParts: INodeParts;
    private workerFile: string;

    constructor(nodeParts: INodeParts, workerFile: string) {
        super();
        this.nodeParts = nodeParts;
        this.workerFile = workerFile;
    }

    protected createCallbacks(): VmMessageHandlerCallbacks {
        return {
            onFrame: (message: string, needCls?: boolean) => {
                if (needCls) {
                    this.nodeParts.consoleClear();
                }
                this.nodeParts.consolePrint(message);
            },
            onInput: (prompt: string) => {
                setTimeout(() => {
                    this.nodeParts.consolePrint(prompt);
                    const userInput = ""; //TODO
                    this.postMessage({ type: 'input', prompt: userInput });
                }, 50); // 50ms delay to allow UI update
            },
            onGeolocation: async () => {
                // TODO
                return '';
            },
            onSpeak: async () => {
                // TODO
            },
            onKeyDef: () => {
                //TODO
            },
            onResultResolved: (message: string) => {
                if (this.finishedResolverFn) {
                    this.finishedResolverFn(message);
                    this.finishedResolverFn = undefined;
                }
            }
        };
    }

    protected postMessage(message: MessageToWorker) {
        if (this.worker) {
            (this.worker as NodeWorkerType).postMessage(message);
        }
    }

    private workerOnMessageHandler = (data: MessageFromWorker): void => {
        this.messageHandler.handleMessage(data);
    };

    protected getOrCreateWorker(): NodeWorkerType {
        if (!this.worker) {
            this.worker = this.nodeParts.createNodeWorker(this.workerFile);
            (this.worker as NodeWorkerType).on('message', this.workerOnMessageHandler);
            this.postMessage({ type: 'config', isTerminal: true });
        }
        return this.worker as NodeWorkerType;
    }
}
