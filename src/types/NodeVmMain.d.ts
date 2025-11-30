import type { INodeParts, MessageToWorker, NodeWorkerType } from "./Interfaces";
import type { VmMessageHandlerCallbacks } from "./VmMessageHandler";
import { VmMainBase } from "./VmMainBase";
export declare class NodeVmMain extends VmMainBase {
    private nodeParts;
    private workerFile;
    constructor(nodeParts: INodeParts, workerFile: string);
    protected createCallbacks(): VmMessageHandlerCallbacks;
    protected postMessage(message: MessageToWorker): void;
    private workerOnMessageHandler;
    protected getOrCreateWorker(): NodeWorkerType;
}
//# sourceMappingURL=NodeVmMain.d.ts.map