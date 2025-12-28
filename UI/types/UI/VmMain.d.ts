import { type VmMessageHandlerCallbacks } from "../VmMessageHandler";
export declare class VmMain {
    private readonly messageHandler;
    private readonly createWebWorker;
    private worker?;
    constructor(callbacks: VmMessageHandlerCallbacks, createWebWorker: () => Promise<Worker>);
    private postMessage;
    private workerOnMessageHandler;
    private handleBeforeUnload;
    private getOrCreateWorker;
    run(code: string): Promise<string>;
    frameTime(time: number): void;
    stop(): void;
    pause(): void;
    resume(): void;
    reset(): void;
    putKeys(keys: string): void;
}
//# sourceMappingURL=VmMain.d.ts.map