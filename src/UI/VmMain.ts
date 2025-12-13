import type { MessageFromWorker, MessageToWorker, NodeWorkerFnType } from "../Interfaces";
import type { VmMessageHandlerCallbacks } from "../VmMessageHandler";
import { VmMainBase } from "../VmMainBase";

declare global {
    interface Window {
        locoVmWorker: NodeWorkerFnType
    }
}

export class VmMain extends VmMainBase {
    private locoVmWorkerName: string;
    private createWebWorker: (workerName: string) => Promise<Worker>;

    private addOutputText: (str: string, needCls?: boolean, hasGraphics?: boolean) => void;
    private setUiKeysFn: (codes: number[]) => void;

    private onGeolocationFn: () => Promise<string>;
    private onSpeakFn: (text: string, pitch: number) => Promise<void>;

    constructor(locoVmWorkerName: string, createWebWorker: (workerName: string) => Promise<Worker>, addOutputText: (str: string, needCls?: boolean, hasGraphics?: boolean) => void, setUiKeysFn: (codes: number[]) => void, onGeolocationFn: () => Promise<string>, onSpeakFn: (text: string, pitch: number) => Promise<void>) {
        super();
        this.locoVmWorkerName = locoVmWorkerName;
        this.createWebWorker = createWebWorker;
        this.addOutputText = addOutputText;
        this.setUiKeysFn = setUiKeysFn;
        this.onSpeakFn = onSpeakFn;
        this.onGeolocationFn = onGeolocationFn;

        window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
    }

    protected createCallbacks(): VmMessageHandlerCallbacks {
        return {
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
    }

    protected postMessage(message: MessageToWorker) {
        if (this.worker) {
            (this.worker as Worker).postMessage(message);
        }
    }

    workerOnMessageHandler = (event: MessageEvent): void => {
        const data = event.data as MessageFromWorker;
        this.messageHandler.handleMessage(data);
    };

    private handleBeforeUnload = () => { // bound this
        this.worker?.terminate();
    }

    protected async getOrCreateWorker(): Promise<Worker> {
        if (!this.worker) {
            this.worker = await this.createWebWorker(this.locoVmWorkerName);
            (this.worker as Worker).onmessage = this.workerOnMessageHandler;

            // Send config message to initialize worker
            //this.postMessage({ type: 'config', isTerminal: false });
        }
        return this.worker as Worker;
    }
}
