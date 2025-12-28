import type { MessageFromWorker, MessageToWorker } from "../Interfaces";
import { VmMessageHandler, type VmMessageHandlerCallbacks } from "../VmMessageHandler";

export class VmMain {
    private readonly messageHandler: VmMessageHandler;
    private readonly createWebWorker: () => Promise<Worker>;
    private worker?: Worker;

    constructor(callbacks: VmMessageHandlerCallbacks, createWebWorker: () => Promise<Worker>) {
        this.messageHandler = new VmMessageHandler(callbacks, (message: MessageToWorker) => this.postMessage(message));
        this.createWebWorker = createWebWorker;

        window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
    }

    private postMessage(message: MessageToWorker) {
        this.worker?.postMessage(message);
    }

    private workerOnMessageHandler = (event: MessageEvent): void => {
        const data = event.data as MessageFromWorker;
        this.messageHandler.handleMessage(data);
    };

    private handleBeforeUnload = () => { // bound this
        this.worker?.terminate();
    }

    private async getOrCreateWorker(): Promise<Worker> {
        if (!this.worker) {
            this.worker = await this.createWebWorker();
            this.worker.onmessage = this.workerOnMessageHandler;
            // this.postMessage({ type: 'config', isTerminal: false }); // is default: isTerminal: false
        }
        return this.worker;
    }

    public async run(code: string) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script ends with a new line (needed for line comment in last line)
        }
        this.messageHandler.setCode(code); // for error message
        await this.getOrCreateWorker();

        const finishedPromise = new Promise<string>((resolve) => {
            this.messageHandler.setFinishedResolver(resolve);
        });

        this.postMessage({ type: 'run', code });
        return finishedPromise;
    }

    public frameTime(time: number) {
        this.postMessage({ type: 'frameTime', time });
    }

    public stop() {
        console.log("stop: Stop requested.");
        this.postMessage({ type: 'stop' });
    }

    public pause() {
        console.log("pause: Pause requested.");
        this.postMessage({ type: 'pause' });
    }

    public resume() {
        console.log("resume: Resume requested.");
        this.postMessage({ type: 'resume' });
    }

    public reset() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = undefined;
        }
        this.messageHandler.onResultResolved("terminated.");
    }

    public putKeys(keys: string) {
        this.postMessage({ type: 'putKeys', keys });
    }
}
