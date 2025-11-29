import { VmMessageHandler } from "./VmMessageHandler";
export class NodeVmMain {
    constructor(nodeParts, workerFile) {
        this.workerOnMessageHandler = (data) => {
            this.messageHandler.handleMessage(data);
        };
        this.nodeParts = nodeParts;
        this.workerFile = workerFile;
        const callbacks = {
            onFrame: (message, needCls) => {
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
        this.messageHandler = new VmMessageHandler(callbacks);
        this.messageHandler.setPostMessageFn((message) => this.postMessage(message));
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
    async run(code) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in las line)
        }
        this.messageHandler.setCode(code); // for error message
        this.getOrCreateWorker();
        const finishedPromise = new Promise((resolve) => {
            this.finishedResolverFn = resolve;
            this.messageHandler.setFinishedResolver(resolve);
        });
        this.postMessage({ type: 'run', code });
        return finishedPromise;
    }
    stop() {
        console.log("stop: Stop requested.");
        this.postMessage({ type: 'stop' });
    }
    reset() {
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
    putKeys(keys) {
        //console.log("putKeys: key:", keys);
        this.postMessage({ type: 'putKeys', keys });
    }
}
//# sourceMappingURL=NodeVmMain.js.map