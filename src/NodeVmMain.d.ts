import type { NodeWorkerType } from "./Interfaces";
import { type VmMessageHandlerCallbacks } from "./VmMessageHandler";
export declare class NodeVmMain {
    private readonly messageHandler;
    private readonly createNodeWorker;
    private worker?;
    constructor(callbacks: VmMessageHandlerCallbacks, createNodeWorker: () => NodeWorkerType);
    private postMessage;
    private workerOnMessageHandler;
    private getOrCreateWorker;
    run(code: string): Promise<string>;
    frameTime(time: number): void;
    stop(): void;
    reset(): void;
    putKeys(keys: string): void;
}
//# sourceMappingURL=NodeVmMain.d.ts.map