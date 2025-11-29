import { VmMessageHandler } from "../VmMessageHandler";
export class VmMain {
    constructor(locoVmWorkerName, createWebWorker, addOutputText, setUiKeysFn, onGeolocationFn, onSpeakFn) {
        this.workerOnMessageHandler = (event) => {
            const data = event.data;
            this.messageHandler.handleMessage(data);
        };
        this.handleBeforeUnload = () => {
            var _a;
            (_a = this.worker) === null || _a === void 0 ? void 0 : _a.terminate();
        };
        this.locoVmWorkerName = locoVmWorkerName;
        this.createWebWorker = createWebWorker;
        this.addOutputText = addOutputText;
        this.setUiKeysFn = setUiKeysFn;
        this.onSpeakFn = onSpeakFn;
        this.onGeolocationFn = onGeolocationFn;
        const callbacks = {
            onFrame: (message, needCls, hasGraphics) => {
                this.addOutputText(message, needCls, hasGraphics);
            },
            onInput: (prompt) => {
                const userInput = window.prompt(prompt);
                this.postMessage({ type: 'input', prompt: userInput });
            },
            onGeolocation: () => this.onGeolocationFn(),
            onSpeak: (message, pitch) => this.onSpeakFn(message, pitch),
            onKeyDef: (codes) => {
                this.setUiKeysFn(codes);
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
        window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
    }
    postMessage(message) {
        if (this.worker) {
            this.worker.postMessage(message);
        }
    }
    async getOrCreateWorker() {
        if (!this.worker) {
            this.worker = await this.createWebWorker(this.locoVmWorkerName);
            this.worker.onmessage = this.workerOnMessageHandler;
            // Send config message to initialize worker
            //this.postMessage({ type: 'config', isTerminal: false });
        }
        return this.worker;
    }
    async run(code) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in last line)
        }
        this.messageHandler.setCode(code); // for error message
        await this.getOrCreateWorker();
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
            console.log("reset: Worker terminated.");
        }
        if (this.finishedResolverFn) {
            this.finishedResolverFn("terminated.");
            this.finishedResolverFn = undefined;
        }
    }
    putKeys(keys) {
        this.postMessage({ type: 'putKeys', keys });
    }
}
//# sourceMappingURL=VmMain.js.map