import type { MessageFromWorker, MessageToWorker, NodeWorkerType } from "./Interfaces";
import { VmMessageHandler, type VmMessageHandlerCallbacks } from "./VmMessageHandler";

export class NodeVmMain {
    private readonly messageHandler: VmMessageHandler;
    private readonly createNodeWorker: () => NodeWorkerType;
    private worker?: NodeWorkerType;

    constructor(callbacks: VmMessageHandlerCallbacks, createNodeWorker: () => NodeWorkerType) {
        this.messageHandler = new VmMessageHandler(callbacks, (message: MessageToWorker) => this.postMessage(message));
        this.createNodeWorker = createNodeWorker;
    }

    private postMessage(message: MessageToWorker) {
        if (this.worker) {
            (this.worker as NodeWorkerType).postMessage(message);
        }
    }

    private workerOnMessageHandler = (data: MessageFromWorker): void => {
        this.messageHandler.handleMessage(data);
    };

    private getOrCreateWorker(): NodeWorkerType {
        if (!this.worker) {
            this.worker = this.createNodeWorker();
            this.worker.on('message', this.workerOnMessageHandler);
            this.postMessage({ type: 'config', isTerminal: true });
        }
        return this.worker;
    }

    public async run(code: string) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script ends with a new line (needed for line comment in last line)
        }
        this.messageHandler.setCode(code); // for error message
        this.getOrCreateWorker();

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
