import type { MessageFromWorker, MessageToWorker } from "../Interfaces";


    const basicErrors = [
        "Improper argument", // 0
        "Unexpected NEXT", // 1
        "Syntax Error", // 2
        "Unexpected RETURN", // 3
        "DATA exhausted", // 4
        "Improper argument", // 5
        "Overflow", // 6
        "Memory full", // 7
        "Line does not exist", // 8
        "Subscript out of range", // 9
        "Array already dimensioned", // 10
        "Division by zero", // 11
        "Invalid direct command", // 12
        "Type mismatch", // 13
        "String space full", // 14
        "String too long", // 15
        "String expression too complex", // 16
        "Cannot CONTinue", // 17
        "Unknown user function", // 18
        "RESUME missing", // 19
        "Unexpected RESUME", // 20
        "Direct command found", // 21
        "Operand missing", // 22
        "Line too long", // 23
        "EOF met", // 24
        "File type error", // 25
        "NEXT missing", // 26
        "File already open", // 27
        "Unknown command", // 28
        "WEND missing", // 29
        "Unexpected WEND", // 30
        "File not open", // 31,
        "Broken", // 32 "Broken in" (derr=146: xxx not found)
        "Unknown error" // 33...
    ];

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
        window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
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
                } else {
                    const match1 = res.match(/^Error: (\d+)$/);
                    if (match1) {
                        res += ": " + basicErrors[Number(match1[1])];
                    }
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

    private handleBeforeUnload = () => { // bound this
        this.worker?.terminate();
    }

    private getOrCreateWorker() {
        if (!this.worker) {
            const blob = new Blob([this.workerScript], { type: "text/javascript" });
            const objectURL = window.URL.createObjectURL(blob);

            this.worker = new Worker(objectURL);
            window.URL.revokeObjectURL(objectURL);
            this.worker.onmessage = this.workerOnMessageHandler;
        }
        return this.worker;
    }

    public run(code: string) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in last line)
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
