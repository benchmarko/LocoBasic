import type { INodeParts, MessageToWorker } from "./Interfaces";
export declare class NodeVmMain {
    private nodeParts;
    private workerFile;
    private worker?;
    private finishedResolverFn;
    private messageHandler;
    constructor(nodeParts: INodeParts, workerFile: string);
    postMessage(message: MessageToWorker): void;
    private workerOnMessageHandler;
    private getOrCreateWorker;
    run(code: string): Promise<string>;
    stop(): void;
    reset(): void;
    putKeys(keys: string): void;
}
//# sourceMappingURL=NodeVmMain.d.ts.map