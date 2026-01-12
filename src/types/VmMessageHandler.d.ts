import type { MessageFromWorker, MessageToWorker } from "./Interfaces";
export interface VmMessageHandlerCallbacks {
    onFlush(message: string, needCls?: boolean, hasGraphics?: boolean): void;
    onInput(prompt: string): Promise<string | null>;
    onGeolocation(): Promise<string>;
    onSpeak(message: string, pitch: number): Promise<void>;
    onKeyDef(codes: number[]): void;
}
export declare class VmMessageHandler {
    private readonly callbacks;
    private readonly postMessage;
    private code;
    private finishedPromise?;
    private finishedResolverFn?;
    constructor(callbacks: VmMessageHandlerCallbacks, postMessage: (message: MessageToWorker) => void);
    setCode(code: string): void;
    getFinishedPromise(): Promise<string> | undefined;
    createFinishedPromise(): Promise<string>;
    onResultResolved(message?: string): void;
    private static describeError;
    handleMessage(data: MessageFromWorker): Promise<void>;
}
//# sourceMappingURL=VmMessageHandler.d.ts.map