import type { MessageFromWorker, MessageToWorker } from "../Interfaces";

export class VmMain {

    private workerScript: string;

    private worker?: Worker;

    private finishedResolverFn: ((msg: string) => void) | undefined;

    private setUiKeysFn: (codes: number[]) => void;
    private onSpeakFn: (text: string, pitch: number) => Promise<void>;

    private code = "";

    constructor(workerScript: string, setUiKeysFn: (codes: number[]) => void, onSpeakFn: (text: string, pitch: number) => Promise<void>) {
        this.workerScript = workerScript;
        this.setUiKeysFn = setUiKeysFn;
        this.onSpeakFn = onSpeakFn;
    }

    private static describeError(stringToEval: string, lineno: number, colno: number): string {
        const lines = stringToEval.split("\n");
        const line = lines[lineno - 1];
        return `${line}\n${" ".repeat(colno - 1) + "^"}`;
    }

    workerOnMessageHandler = (event: MessageEvent): void => {
        const data = event.data as MessageFromWorker;
        const result = document.getElementById('outputText') as HTMLPreElement; //TTT
        switch (data.type) {
            case 'frame':
                if (data.needCls) {
                    result.innerHTML = data.message;
                } else {
                    result.innerHTML += data.message;
                }
                break;
            case 'input':
                setTimeout(() => {
                    const userInput = prompt(data.prompt);
                    if (this.worker) {
                        this.worker.postMessage({ type: 'input', prompt: userInput } as MessageToWorker);
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
                    } else {
                        res = `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`
                            + VmMain.describeError(this.code, lineno - 2, colno) + "\n"
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
                const finishedPromise = this.onSpeakFn(data.message, data.pitch);
                finishedPromise.then(() => {
                    if (this.worker) {
                        this.worker.postMessage({ type: 'continue' } as MessageToWorker);
                    }
                }).catch((msg) => {
                    console.log(msg);
                    if (this.worker) {
                        this.worker.postMessage({ type: 'stop' } as MessageToWorker);
                        this.worker.postMessage({ type: 'continue' } as MessageToWorker);
                    }
                });
                break;
            }
            default:
                // Unknown message type
                break;
        }
    };

    private getOrCreateWorker() {
        if (!this.worker) {
            //const workerFn = (window as any).locoVmWorker.workerFn; const workerScript = `(${workerFn})();`;
            const blob = new Blob([this.workerScript], { type: "text/javascript" });

            this.worker = new Worker(window.URL.createObjectURL(blob));
            this.worker.onmessage = this.workerOnMessageHandler;
        }
        return this.worker;
    }

    public run(code: string) {
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
            console.log("reset: Worker terminated.");
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
