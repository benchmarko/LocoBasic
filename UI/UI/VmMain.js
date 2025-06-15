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
        this.workerScript = workerScript;
        this.setUiKeysFn = setUiKeysFn;
        this.onSpeakFn = onSpeakFn;
    }
    static describeError(stringToEval, lineno, colno) {
        const lines = stringToEval.split("\n");
        const line = lines[lineno - 1];
        return `${line}\n${" ".repeat(colno - 1) + "^"}`;
    }
    getOrCreateWorker() {
        if (!this.worker) {
            //const workerFn = (window as any).locoVmWorker.workerFn; const workerScript = `(${workerFn})();`;
            const blob = new Blob([this.workerScript], { type: "text/javascript" });
            this.worker = new Worker(window.URL.createObjectURL(blob));
            this.worker.onmessage = this.workerOnMessageHandler;
        }
        return this.worker;
    }
    run(code) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in las line)
        }
        this.code = code; // for error message
        const worker = this.getOrCreateWorker();
        /*
        const result = document.getElementById('outputText') as HTMLPreElement; //TTT
        result.innerHTML = ""; // Clear previous results
        console.log('run: sending code to worker...');
        s*/
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