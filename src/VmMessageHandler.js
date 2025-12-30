import { basicErrors } from "./Constants";
export class VmMessageHandler {
    constructor(callbacks, postMessage) {
        this.code = "";
        this.callbacks = callbacks;
        this.postMessage = postMessage;
    }
    setCode(code) {
        this.code = code;
    }
    setFinishedResolver(finishedResolverFn) {
        this.finishedResolverFn = finishedResolverFn;
    }
    onResultResolved(message = "") {
        if (this.finishedResolverFn) {
            this.finishedResolverFn(message);
            this.finishedResolverFn = undefined;
        }
    }
    static describeError(stringToEval, lineno, colno) {
        const lines = stringToEval.split("\n");
        const line = lines[lineno - 1];
        return `${line}\n${" ".repeat(colno - 1) + "^"}`;
    }
    async handleMessage(data) {
        switch (data.type) {
            case 'flush':
                this.callbacks.onFlush(data.message, data.needCls, data.hasGraphics);
                break;
            case 'geolocation': {
                let result = "";
                try {
                    result = await this.callbacks.onGeolocation();
                }
                catch (msg) {
                    console.warn(msg);
                    this.callbacks.onFlush(String(msg));
                    //this.postMessage({ type: 'stop' });
                }
                this.postMessage({ type: 'continue', result });
                break;
            }
            case 'input': {
                setTimeout(async () => {
                    const input = await this.callbacks.onInput(data.prompt);
                    this.postMessage({ type: 'input', input });
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
                this.onResultResolved(res);
                break;
            }
            case 'speak': {
                try {
                    await this.callbacks.onSpeak(data.message, data.pitch);
                }
                catch (msg) {
                    console.log(msg);
                    //this.postMessage({ type: 'stop' });
                }
                this.postMessage({ type: 'continue', result: '' });
                break;
            }
            default:
                console.error("VmMessageHandler: Unknown message type:", data);
                break;
        }
    }
}
//# sourceMappingURL=VmMessageHandler.js.map