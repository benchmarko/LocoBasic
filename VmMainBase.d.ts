import type { MessageToWorker } from "./Interfaces";
import { VmMessageHandler, type VmMessageHandlerCallbacks } from "./VmMessageHandler";
interface WorkerInterface {
    terminate(): void;
    postMessage(message: MessageToWorker): void;
}
export type WorkerType = WorkerInterface;
export declare abstract class VmMainBase {
    protected messageHandler: VmMessageHandler;
    protected finishedResolverFn: ((msg: string) => void) | undefined;
    protected worker?: WorkerType;
    constructor();
    protected abstract createCallbacks(): VmMessageHandlerCallbacks;
    protected abstract getOrCreateWorker(): Promise<WorkerType> | WorkerType;
    protected abstract postMessage(message: MessageToWorker): void;
    run(code: string): Promise<string>;
    frameTime(time: number): void;
    stop(): void;
    reset(): void;
    putKeys(keys: string): void;
}
export {};
//# sourceMappingURL=VmMainBase.d.ts.map