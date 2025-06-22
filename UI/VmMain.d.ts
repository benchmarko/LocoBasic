import type { MessageToWorker } from "../Interfaces";
export declare class VmMain {
    private workerScript;
    private worker?;
    private finishedResolverFn;
    private setUiKeysFn;
    private onGeolocationFn;
    private onSpeakFn;
    private code;
    constructor(workerScript: string, setUiKeysFn: (codes: number[]) => void, onGeolocationFn: () => Promise<string>, onSpeakFn: (text: string, pitch: number) => Promise<void>);
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