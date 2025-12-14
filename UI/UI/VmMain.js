import { VmMessageHandler } from "../VmMessageHandler";
export class VmMain {
    constructor(callbacks, createWebWorker) {
        this.workerOnMessageHandler = (event) => {
            const data = event.data;
            this.messageHandler.handleMessage(data);
        };
        this.handleBeforeUnload = () => {
            var _a;
            (_a = this.worker) === null || _a === void 0 ? void 0 : _a.terminate();
        };
        this.messageHandler = new VmMessageHandler(callbacks, (message) => this.postMessage(message));
        this.createWebWorker = createWebWorker;
        window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
    }
    postMessage(message) {
        if (this.worker) {
            this.worker.postMessage(message);
        }
    }
    async getOrCreateWorker() {
        if (!this.worker) {
            this.worker = await this.createWebWorker();
            this.worker.onmessage = this.workerOnMessageHandler;
            // this.postMessage({ type: 'config', isTerminal: false }); // is default: isTerminal: false
        }
        return this.worker;
    }
    async run(code) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script ends with a new line (needed for line comment in last line)
        }
        this.messageHandler.setCode(code); // for error message
        await this.getOrCreateWorker();
        const finishedPromise = new Promise((resolve) => {
            this.messageHandler.setFinishedResolver(resolve);
        });
        this.postMessage({ type: 'run', code });
        return finishedPromise;
    }
    frameTime(time) {
        this.postMessage({ type: 'frameTime', time });
    }
    stop() {
        console.log("stop: Stop requested.");
        this.postMessage({ type: 'stop' });
    }
    reset() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = undefined;
        }
        this.messageHandler.onResultResolved("terminated.");
    }
    putKeys(keys) {
        this.postMessage({ type: 'putKeys', keys });
    }
}
//# sourceMappingURL=VmMain.js.map