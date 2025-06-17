export declare class VmMain {
    private workerScript;
    private worker?;
    private finishedResolverFn;
    private setUiKeysFn;
    private onSpeakFn;
    private code;
    constructor(workerScript: string, setUiKeysFn: (codes: number[]) => void, onSpeakFn: (text: string, pitch: number) => Promise<void>);
    private static describeError;
    workerOnMessageHandler: (event: MessageEvent) => void;
    private handleBeforeUnload;
    private getOrCreateWorker;
    run(code: string): Promise<string>;
    stop(): void;
    reset(): void;
    putKeys(keys: string): void;
}
//# sourceMappingURL=VmMain.d.ts.map