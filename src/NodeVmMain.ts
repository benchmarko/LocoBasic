import type { INodeParts, MessageFromWorker, MessageToWorker, NodeWorkerType } from "./Interfaces";
import { VmMessageHandler, type VmMessageHandlerCallbacks } from "./VmMessageHandler";


export class NodeVmMain {

    private nodeParts: INodeParts;
    private workerFile: string;

    private worker?: NodeWorkerType;

    private finishedResolverFn: ((msg: string) => void) | undefined;

    private messageHandler: VmMessageHandler;

    constructor(nodeParts: INodeParts, workerFile: string) {
        this.nodeParts = nodeParts;
        this.workerFile = workerFile;

        const callbacks: VmMessageHandlerCallbacks = {
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

        this.messageHandler = new VmMessageHandler(callbacks);
        this.messageHandler.setPostMessageFn((message: MessageToWorker) => this.postMessage(message));
    }

    postMessage(message: MessageToWorker) {
        if (this.worker) {
            this.worker.postMessage(message);
        }
    }

    private workerOnMessageHandler = (data: MessageFromWorker): void => {
        this.messageHandler.handleMessage(data);
    };

    private getOrCreateWorker() {
        if (!this.worker) {
            this.worker = this.nodeParts.createNodeWorker(this.workerFile);
            this.worker.on('message', this.workerOnMessageHandler);
            this.postMessage({ type: 'config', isTerminal: true });
        }
        return this.worker;
    }

    public async run(code: string) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in las line)
        }
        this.messageHandler.setCode(code); // for error message
        this.getOrCreateWorker();

        const finishedPromise = new Promise<string>((resolve) => {
            this.finishedResolverFn = resolve;
            this.messageHandler.setFinishedResolver(resolve);
        })

        this.postMessage({ type: 'run', code });
        return finishedPromise;
    }

    public stop() {
        console.log("stop: Stop requested.");
        this.postMessage({ type: 'stop' });
    }

    public reset() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = undefined;
            //console.log("reset: Worker terminated.");
        }
        if (this.finishedResolverFn) {
            this.finishedResolverFn("terminated.");
            this.finishedResolverFn = undefined;
        }
    }

    public putKeys(keys: string) {
        //console.log("putKeys: key:", keys);
        this.postMessage({ type: 'putKeys', keys });
    }
}
