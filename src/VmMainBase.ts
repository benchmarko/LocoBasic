import type { MessageToWorker } from "./Interfaces";
import { VmMessageHandler, type VmMessageHandlerCallbacks } from "./VmMessageHandler";

interface WorkerInterface {
    terminate(): void;
    postMessage(message: MessageToWorker): void;
}

export type WorkerType = WorkerInterface; // Worker (browser) | NodeWorkerType (node)

export abstract class VmMainBase {
    protected messageHandler: VmMessageHandler;
    protected finishedResolverFn: ((msg: string) => void) | undefined;
    protected worker?: WorkerType;

    constructor() {
        const callbacks = this.createCallbacks();
        this.messageHandler = new VmMessageHandler(callbacks);
        this.messageHandler.setPostMessageFn((message: MessageToWorker) => this.postMessage(message));
    }

    protected abstract createCallbacks(): VmMessageHandlerCallbacks;
    protected abstract getOrCreateWorker(): Promise<WorkerType> | WorkerType;
    protected abstract postMessage(message: MessageToWorker): void;

    public async run(code: string) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in last line)
        }
        this.messageHandler.setCode(code); // for error message
        await this.getOrCreateWorker();

        const finishedPromise = new Promise<string>((resolve) => {
            this.finishedResolverFn = resolve;
            this.messageHandler.setFinishedResolver(resolve);
        });

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
        }
        if (this.finishedResolverFn) {
            this.finishedResolverFn("terminated.");
            this.finishedResolverFn = undefined;
        }
    }

    public putKeys(keys: string) {
        this.postMessage({ type: 'putKeys', keys });
    }
}
