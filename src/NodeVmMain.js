export class NodeVmMain {
    constructor(nodeParts, workerFile) {
        this.code = "";
        this.workerOnMessageHandler = (data) => {
            switch (data.type) {
                case 'frame':
                    if (data.needCls) {
                        this.nodeParts.consoleClear();
                    }
                    this.nodeParts.consolePrint(data.message);
                    break;
                case 'geolocation':
                    // TODO
                    this.postMessage({ type: 'continue', result: '' });
                    break;
                case 'input':
                    setTimeout(() => {
                        this.nodeParts.consolePrint(data.prompt);
                        const userInput = ""; //TODO
                        this.postMessage({ type: 'input', prompt: userInput });
                    }, 50); // 50ms delay to allow UI update
                    break;
                case 'keyDef':
                    //sthis.setUiKeysFn(data.codes);
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
                                + NodeVmMain.describeError(this.code, lineno - 2, colno) + "\n"
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
                case 'speak':
                    // TODO
                    this.postMessage({ type: 'continue', result: '' });
                    break;
                default:
                    console.error("NodeVmMain: Unknown message type:", data);
                    break;
            }
        };
        this.nodeParts = nodeParts;
        this.workerFile = workerFile;
    }
    static describeError(stringToEval, lineno, colno) {
        const lines = stringToEval.split("\n");
        const line = lines[lineno - 1];
        return `${line}\n${" ".repeat(colno - 1) + "^"}`;
    }
    postMessage(message) {
        if (this.worker) {
            this.worker.postMessage(message);
        }
    }
    getOrCreateWorker() {
        if (!this.worker) {
            this.worker = this.nodeParts.createNodeWorker(this.workerFile);
            this.worker.on('message', this.workerOnMessageHandler);
            this.postMessage({ type: 'config', isTerminal: true });
        }
        return this.worker;
    }
    run(code) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in las line)
        }
        this.code = code; // for error message
        this.getOrCreateWorker();
        const finishedPromise = new Promise((resolve) => {
            this.finishedResolverFn = resolve;
        });
        this.postMessage({ type: 'run', code });
        return finishedPromise;
    }
    stop() {
        console.log("stop: Stop requested.");
        this.postMessage({ type: 'stop' });
    }
    reset() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = undefined;
            //console.log("reset: Worker terminated.");
        }
        if (this.finishedResolverFn) {
            this.finishedResolverFn("terminated.");
            this.finishedResolverFn = undefined;
        }
    }
    putKeys(keys) {
        //console.log("putKeys: key:", keys);
        this.postMessage({ type: 'putKeys', keys });
    }
}
//# sourceMappingURL=NodeVmMain.js.map