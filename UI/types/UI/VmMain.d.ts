import type { MessageToWorker } from "../Interfaces";
declare global {
    interface Window {
        locoVmWorker: {
            workerFn: () => unknown;
        };
    }
}
export declare class VmMain {
    private locoVmWorkerName;
    private createWebWorker;
    private worker?;
    private finishedResolverFn;
    private addOutputText;
    private setUiKeysFn;
    private onGeolocationFn;
    private onSpeakFn;
    private code;
    constructor(locoVmWorkerName: string, createWebWorker: (workerName: string) => Promise<Worker>, addOutputText: (str: string, needCls?: boolean, hasGraphics?: boolean) => void, setUiKeysFn: (codes: number[]) => void, onGeolocationFn: () => Promise<string>, onSpeakFn: (text: string, pitch: number) => Promise<void>);
    private static describeError;
    postMessage(message: MessageToWorker): void;
    workerOnMessageHandler: (event: MessageEvent) => void;
    private handleBeforeUnload;
    private getOrCreateWorker;
    run(code: string): Promise<string>;
    stop(): void;
    reset(): void;
    putKeys(keys: string): void;
}
//# sourceMappingURL=VmMain.d.ts.map