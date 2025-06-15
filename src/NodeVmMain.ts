import type { INodeParts, MessageFromWorker, MessageToWorker, NodeWorkerType } from "./Interfaces";


export class NodeVmMain {

    private nodeParts: INodeParts;
    private workerFile: string;

    private worker?: NodeWorkerType;

    private finishedResolverFn: ((msg: string) => void) | undefined;

    private code = "";

    constructor(nodeParts: INodeParts, workerFile: string) {
        this.nodeParts = nodeParts;
        this.workerFile = workerFile;
    }


    private static describeError(stringToEval: string, lineno: number, colno: number): string {
        const lines = stringToEval.split("\n");
        const line = lines[lineno - 1];
        return `${line}\n${" ".repeat(colno - 1) + "^"}`;
    }

    private workerOnMessageHandler = (data: MessageFromWorker): void => {
        switch (data.type) {
            case 'frame':
                if (data.needCls) {
                    this.nodeParts.consoleClear();
                }
                this.nodeParts.consolePrint(data.message);
                break;
            case 'input':
                setTimeout(() => {
                    this.nodeParts.consolePrint(data.prompt);
                    const userInput = ""; //TODO
                    if (this.worker) {
                        this.worker.postMessage({ type: 'input', prompt: userInput });
                    }
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
                    } else {
                        res = `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`
                            + NodeVmMain.describeError(this.code, lineno - 2, colno) + "\n"
                            + message;
                    }
                } else if (res === "Error: INFO: Program stopped") {
                    res = "";
                }
                if (this.finishedResolverFn) {
                    this.finishedResolverFn(res);
                    this.finishedResolverFn = undefined;
                }
                break;
            }
            case 'speak': {
                // TODO
                if (this.worker) {
                    this.worker.postMessage({ type: 'continue' });
                }
                break;
            }
            default:
                // Unknown message type
                break;
        }
    };

    private getOrCreateWorker() {
        if (!this.worker) {
            this.worker = this.nodeParts.createNodeWorker(this.workerFile);
            this.worker.on('message', this.workerOnMessageHandler);
            this.worker.postMessage({ type: 'config', isTerminal: true });
            // "locoVmWorker.js",
        }
        return this.worker;
    }

    public run(code: string) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in las line)
        }
        this.code = code; // for error message
        const worker = this.getOrCreateWorker();

        const finishedPromise = new Promise<string>((resolve) => {
            this.finishedResolverFn = resolve;
        })

        worker.postMessage({ type: 'run', code } as MessageToWorker);
        return finishedPromise;
    }

    public stop() {
        if (this.worker) {
            console.log("stop: Stop requested.");
            this.worker.postMessage({ type: 'stop' } as MessageToWorker);
        }
    }

    public reset() {
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

    public putKeys(keys: string) {
        if (this.worker) {
            console.log("putKeys: key:", keys);
            this.worker.postMessage({ type: 'putKeys', keys } as MessageToWorker);
        }
    }
}
