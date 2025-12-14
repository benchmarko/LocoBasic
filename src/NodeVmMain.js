import { VmMainBase } from "./VmMainBase";
export class NodeVmMain extends VmMainBase {
    constructor(nodeParts, workerFile) {
        super();
        this.workerOnMessageHandler = (data) => {
            this.messageHandler.handleMessage(data);
        };
        this.nodeParts = nodeParts;
        this.workerFile = workerFile;
    }
    createCallbacks() {
        return {
            onFlush: (message, needCls) => {
                if (needCls) {
                    this.nodeParts.consoleClear();
                }
                this.nodeParts.consolePrint(message);
            },
            onInput: (prompt) => {
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
            onResultResolved: (message) => {
                if (this.finishedResolverFn) {
                    this.finishedResolverFn(message);
                    this.finishedResolverFn = undefined;
                }
            }
        };
    }
    postMessage(message) {
        if (this.worker) {
            this.worker.postMessage(message);
        }
    }
    getOrCreateWorker() {
        if (!this.worker) {
            this.worker = this.nodeParts.createNodeWorker(this.workerFile);
            this.worker.on('message', this.workerOnMessageHandler);
            this.postMessage({ type: 'config', isTerminal: true });
        }
        return this.worker;
    }
}
//# sourceMappingURL=NodeVmMain.js.map