import { basicErrors } from "./Constants";
export class VmMessageHandler {
    constructor(callbacks) {
        this.code = "";
        this.callbacks = callbacks;
    }
    setPostMessageFn(postMessageFn) {
        this.postMessageFn = postMessageFn;
    }
    setCode(code) {
        this.code = code;
    }
    setFinishedResolver(resolver) {
        this.finishedResolverFn = resolver;
    }
    getFinishedResolver() {
        return this.finishedResolverFn;
    }
    clearFinishedResolver() {
        this.finishedResolverFn = undefined;
    }
    static describeError(stringToEval, lineno, colno) {
        const lines = stringToEval.split("\n");
        const line = lines[lineno - 1];
        return `${line}\n${" ".repeat(colno - 1) + "^"}`;
    }
    postMessageToWorker(message) {
        if (this.postMessageFn) {
            this.postMessageFn(message);
        }
    }
    async handleMessage(data) {
        switch (data.type) {
            case 'flush':
                this.callbacks.onFlush(data.message, data.needCls, data.hasGraphics);
                break;
            case 'geolocation': {
                try {
                    const str = await this.callbacks.onGeolocation();
                    this.postMessageToWorker({ type: 'continue', result: str });
                }
                catch (msg) {
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
                    }
                    else {
                        res = `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`
                            + VmMessageHandler.describeError(this.code, lineno - 2, colno) + "\n"
                            + message;
                    }
                }
                else if (res === "Error: INFO: Program stopped") {
                    res = "";
                }
                else {
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
                }
                catch (msg) {
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
//# sourceMappingURL=VmMessageHandler.js.map