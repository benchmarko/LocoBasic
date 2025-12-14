import { VmMessageHandler } from "./VmMessageHandler";
export class VmMainBase {
    constructor() {
        const callbacks = this.createCallbacks();
        this.messageHandler = new VmMessageHandler(callbacks);
        this.messageHandler.setPostMessageFn((message) => this.postMessage(message));
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
        if (this.finishedResolverFn) {
            this.finishedResolverFn("terminated.");
            this.finishedResolverFn = undefined;
        }
    }
    putKeys(keys) {
        this.postMessage({ type: 'putKeys', keys });
    }
}
//# sourceMappingURL=VmMainBase.js.map