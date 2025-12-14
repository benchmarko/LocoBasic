import type { MessageFromWorker, MessageToWorker } from "./Interfaces";
export interface VmMessageHandlerCallbacks {
    onFlush(message: string, needCls?: boolean, hasGraphics?: boolean): void;
    onInput(prompt: string): void;
    onGeolocation(): Promise<string>;
    onSpeak(message: string, pitch: number): Promise<void>;
    onKeyDef(codes: number[]): void;
    onResultResolved(message: string): void;
}
export declare class VmMessageHandler {
    private code;
    private finishedResolverFn;
    private callbacks;
    private postMessageFn?;
    constructor(callbacks: VmMessageHandlerCallbacks);
    setPostMessageFn(postMessageFn: (message: MessageToWorker) => void): void;
    setCode(code: string): void;
    setFinishedResolver(resolver: (msg: string) => void): void;
    getFinishedResolver(): ((msg: string) => void) | undefined;
    clearFinishedResolver(): void;
    private static describeError;
    private postMessageToWorker;
    handleMessage(data: MessageFromWorker): Promise<void>;
}
//# sourceMappingURL=VmMessageHandler.d.ts.map