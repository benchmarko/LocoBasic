import { VmMainBase } from "../VmMainBase";
export class VmMain extends VmMainBase {
    constructor(locoVmWorkerName, createWebWorker, addOutputText, setUiKeysFn, onGeolocationFn, onSpeakFn) {
        super();
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
        window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
    }
    createCallbacks() {
        return {
            onFlush: (message, needCls, hasGraphics) => {
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
}
//# sourceMappingURL=VmMain.js.map