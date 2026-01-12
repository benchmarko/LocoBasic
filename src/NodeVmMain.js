import { VmMessageHandler } from "./VmMessageHandler";
export class NodeVmMain {
    constructor(callbacks, createNodeWorker) {
        this.workerOnMessageHandler = (data) => {
            this.messageHandler.handleMessage(data);
        };
        this.messageHandler = new VmMessageHandler(callbacks, (message) => this.postMessage(message));
        this.createNodeWorker = createNodeWorker;
    }
    postMessage(message) {
        var _a;
        (_a = this.worker) === null || _a === void 0 ? void 0 : _a.postMessage(message);
    }
    getOrCreateWorker() {
        if (!this.worker) {
            this.worker = this.createNodeWorker();
            this.worker.on('message', this.workerOnMessageHandler);
            this.postMessage({ type: 'config', isTerminal: true });
        }
        return this.worker;
    }
    async run(code) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script ends with a new line (needed for line comment in last line)
        }
        this.messageHandler.setCode(code); // for error message
        this.getOrCreateWorker();
        const finishedPromise = this.messageHandler.createFinishedPromise();
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
//# sourceMappingURL=NodeVmMain.js.map