import type { MessageFromWorker, MessageToWorker } from "../Interfaces";
import { VmMessageHandler, type VmMessageHandlerCallbacks } from "../VmMessageHandler";

declare global {
    interface Window {
        locoVmWorker: {
            workerFn: () => unknown
        }
    }
}

export class VmMain {
    private locoVmWorkerName: string;
    private createWebWorker: (workerName: string) => Promise<Worker>;

    private worker?: Worker;

    private addOutputText: (str: string, needCls?: boolean, hasGraphics?: boolean) => void;
    private setUiKeysFn: (codes: number[]) => void;

    private onGeolocationFn: () => Promise<string>;
    private onSpeakFn: (text: string, pitch: number) => Promise<void>;

    private messageHandler: VmMessageHandler;
    private finishedResolverFn: ((msg: string) => void) | undefined;

    constructor(locoVmWorkerName: string, createWebWorker: (workerName: string) => Promise<Worker>, addOutputText: (str: string, needCls?: boolean, hasGraphics?: boolean) => void, setUiKeysFn: (codes: number[]) => void, onGeolocationFn: () => Promise<string>, onSpeakFn: (text: string, pitch: number) => Promise<void>) {
        this.locoVmWorkerName = locoVmWorkerName;
        this.createWebWorker = createWebWorker;
        this.addOutputText = addOutputText;
        this.setUiKeysFn = setUiKeysFn;
        this.onSpeakFn = onSpeakFn;
        this.onGeolocationFn = onGeolocationFn;

        const callbacks: VmMessageHandlerCallbacks = {
            onFrame: (message: string, needCls?: boolean, hasGraphics?: boolean) => {
                this.addOutputText(message, needCls, hasGraphics);
            },
            onInput: (prompt: string) => {
                const userInput = window.prompt(prompt);
                this.postMessage({ type: 'input', prompt: userInput });
            },
            onGeolocation: () => this.onGeolocationFn(),
            onSpeak: (message: string, pitch: number) => this.onSpeakFn(message, pitch),
            onKeyDef: (codes: number[]) => {
                this.setUiKeysFn(codes);
            },
            onResultResolved: (message: string) => {
                if (this.finishedResolverFn) {
                    this.finishedResolverFn(message);
                    this.finishedResolverFn = undefined;
                }
            }
        };

        this.messageHandler = new VmMessageHandler(callbacks);
        this.messageHandler.setPostMessageFn((message: MessageToWorker) => this.postMessage(message));

        window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
    }

    postMessage(message: MessageToWorker) {
        if (this.worker) {
            this.worker.postMessage(message);
        }
    }

    workerOnMessageHandler = (event: MessageEvent): void => {
        const data = event.data as MessageFromWorker;
        this.messageHandler.handleMessage(data);
    };

    private handleBeforeUnload = () => { // bound this
        this.worker?.terminate();
    }

    private async getOrCreateWorker() {
        if (!this.worker) {
            this.worker = await this.createWebWorker(this.locoVmWorkerName);
            this.worker.onmessage = this.workerOnMessageHandler;

            // Send config message to initialize worker
            //this.postMessage({ type: 'config', isTerminal: false });
        }
        return this.worker;
    }

    public async run(code: string) {
        if (!code.endsWith("\n")) {
            code += "\n"; // make sure the script end with a new line (needed for line comment in last line)
        }
        this.messageHandler.setCode(code); // for error message
        await this.getOrCreateWorker();

        const finishedPromise = new Promise<string>((resolve) => {
            this.finishedResolverFn = resolve;
            this.messageHandler.setFinishedResolver(resolve);
        })

        this.postMessage({ type: 'run', code });
        return finishedPromise;
    }

    public stop() {
        console.log("stop: Stop requested.");
        this.postMessage({ type: 'stop' });
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
        this.postMessage({ type: 'putKeys', keys });
    }
}
