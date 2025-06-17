export class VmMain {
    constructor(workerScript, setUiKeysFn, onSpeakFn) {
        this.code = "";
        this.workerOnMessageHandler = (event) => {
            const data = event.data;
            const result = document.getElementById('outputText'); //TTT
            switch (data.type) {
                case 'frame':
                    if (data.needCls) {
                        result.innerHTML = data.message;
                    }
                    else {
                        result.innerHTML += data.message;
                    }
                    break;
                case 'input':
                    setTimeout(() => {
                        const userInput = prompt(data.prompt);
                        if (this.worker) {
                            this.worker.postMessage({ type: 'input', prompt: userInput });
                        }
                    }, 50); // 50ms delay to allow UI update
                    break;
                case 'keyDef':
                    this.setUiKeysFn(data.codes);
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
                                + VmMain.describeError(this.code, lineno - 2, colno) + "\n"
                                + message;
                        }
                    }
                    else if (res === "Error: INFO: Program stopped") {
                        res = "";
                    }
                    if (this.finishedResolverFn) {
                        this.finishedResolverFn(res);
                        this.finishedResolverFn = undefined;
                    }
                    break;
                }
                case 'speak': {
                    const finishedPromise = this.onSpeakFn(data.message, data.pitch);
                    finishedPromise.then(() => {
                        if (this.worker) {
                            this.worker.postMessage({ type: 'continue' });
                        }
                    }).catch((msg) => {
                        console.log(msg);
                        if (this.worker) {
                            this.worker.postMessage({ type: 'stop' });
                            this.worker.postMessage({ type: 'continue' });
                        }
                    });
                    break;
                }
                default:
                    // Unknown message type
                    break;
            }
        };
        this.handleBeforeUnload = () => {
            var _a;
            (_a = this.worker) === null || _a === void 0 ? void 0 : _a.terminate();
        };
        this.workerScript = workerScript;
        this.setUiKeysFn = setUiKeysFn;
        this.onSpeakFn = onSpeakFn;
        window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
    }
    static describeError(stringToEval, lineno, colno) {
        const lines = stringToEval.split("\n");
        const line = lines[lineno - 1];
        return `${line}\n${" ".repeat(colno - 1) + "^"}`;
    }
    getOrCreateWorker() {
        if (!this.worker) {
            const blob = new Blob([this.workerScript], { type: "text/javascript" });
            const objectURL = window.URL.createObjectURL(blob);
            this.worker = new Worker(objectURL);
            window.URL.revokeObjectURL(objectURL);
            this.worker.onmessage = this.workerOnMessageHandler;
        }
        return this.worker;
    }
    run(code) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in last line)
        }
        this.code = code; // for error message
        const worker = this.getOrCreateWorker();
        const finishedPromise = new Promise((resolve) => {
            this.finishedResolverFn = resolve;
        });
        worker.postMessage({ type: 'run', code });
        return finishedPromise;
    }
    stop() {
        if (this.worker) {
            console.log("stop: Stop requested.");
            this.worker.postMessage({ type: 'stop' });
        }
    }
    reset() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = undefined;
            console.log("reset: Worker terminated.");
        }
        if (this.finishedResolverFn) {
            this.finishedResolverFn("terminated.");
            this.finishedResolverFn = undefined;
        }
    }
    putKeys(keys) {
        if (this.worker) {
            console.log("putKeys: key:", keys);
            this.worker.postMessage({ type: 'putKeys', keys });
        }
    }
}
//# sourceMappingURL=VmMain.js.map