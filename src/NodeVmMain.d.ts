import type { INodeParts } from "./Interfaces";
export declare class NodeVmMain {
    private nodeParts;
    private workerFile;
    private worker?;
    private finishedResolverFn;
    private code;
    constructor(nodeParts: INodeParts, workerFile: string);
    private static describeError;
    private workerOnMessageHandler;
    private getOrCreateWorker;
    run(code: string): Promise<string>;
    stop(): void;
    reset(): void;
    putKeys(keys: string): void;
}
//# sourceMappingURL=NodeVmMain.d.ts.map