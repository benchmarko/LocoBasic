import type { MessageFromWorker, MessageToWorker } from "./Interfaces";
import { basicErrors } from "./Constants";

export interface VmMessageHandlerCallbacks {
    onFrame(message: string, needCls?: boolean, hasGraphics?: boolean): void;
    onInput(prompt: string): void;
    onGeolocation(): Promise<string>;
    onSpeak(message: string, pitch: number): Promise<void>;
    onKeyDef(codes: number[]): void;
    onResultResolved(message: string): void;
}

export class VmMessageHandler {
    private code = "";
    private finishedResolverFn: ((msg: string) => void) | undefined;
    private callbacks: VmMessageHandlerCallbacks;
    private postMessageFn?: (message: MessageToWorker) => void;

    constructor(callbacks: VmMessageHandlerCallbacks) {
        this.callbacks = callbacks;
    }

    public setPostMessageFn(postMessageFn: (message: MessageToWorker) => void): void {
        this.postMessageFn = postMessageFn;
    }

    public setCode(code: string): void {
        this.code = code;
    }

    public setFinishedResolver(resolver: (msg: string) => void): void {
        this.finishedResolverFn = resolver;
    }

    public getFinishedResolver(): ((msg: string) => void) | undefined {
        return this.finishedResolverFn;
    }

    public clearFinishedResolver(): void {
        this.finishedResolverFn = undefined;
    }

    private static describeError(stringToEval: string, lineno: number, colno: number): string {
        const lines = stringToEval.split("\n");
        const line = lines[lineno - 1];
        return `${line}\n${" ".repeat(colno - 1) + "^"}`;
    }

    private postMessageToWorker(message: MessageToWorker): void {
        if (this.postMessageFn) {
            this.postMessageFn(message);
        }
    }

    public async handleMessage(data: MessageFromWorker): Promise<void> {
        switch (data.type) {
            case 'frame':
                this.callbacks.onFrame(data.message, data.needCls, data.hasGraphics);
                break;
            case 'geolocation': {
                try {
                    const str = await this.callbacks.onGeolocation();
                    this.postMessageToWorker({ type: 'continue', result: str });
                } catch (msg) {
                    console.error(msg);
                    this.postMessageToWorker({ type: 'stop' });
                    this.postMessageToWorker({ type: 'continue', result: '' });
                }
                break;
            }
            case 'input': {
                setTimeout(() => {
                    this.callbacks.onInput(data.prompt);
                }, 50); // 50ms delay to allow UI update
                break;
            }
            case 'keyDef':
                this.callbacks.onKeyDef(data.codes);
                break;
            case 'result': {
                let res = data.result || "";

                if (res.startsWith("{")) {
                    const json = JSON.parse(res);
                    const { lineno, colno, message } = json;
                    if (message === "No Error: Parsing successful!") {
                        res = "";
                    } else {
                        res = `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`
                            + VmMessageHandler.describeError(this.code, lineno - 2, colno) + "\n"
                            + message;
                    }
                } else if (res === "Error: INFO: Program stopped") {
                    res = "";
                } else {
                    const match1 = res.match(/^Error: (\d+)$/);
                    if (match1) {
                        res += ": " + basicErrors[Number(match1[1])];
                    }
                }

                if (this.finishedResolverFn) {
                    this.callbacks.onResultResolved(res);
                    this.finishedResolverFn = undefined;
                }
                break;
            }
            case 'speak': {
                try {
                    await this.callbacks.onSpeak(data.message, data.pitch);
                    this.postMessageToWorker({ type: 'continue', result: '' });
                } catch (msg) {
                    console.log(msg);
                    this.postMessageToWorker({ type: 'stop' });
                    this.postMessageToWorker({ type: 'continue', result: '' });
                }
                break;
            }
            default:
                console.error("VmMessageHandler: Unknown message type:", data);
                break;
        }
    }
}
