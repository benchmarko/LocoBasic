import type { MessageToWorker, NodeWorkerFnType } from "../Interfaces";
import type { VmMessageHandlerCallbacks } from "../VmMessageHandler";
import { VmMainBase } from "../VmMainBase";
declare global {
    interface Window {
        locoVmWorker: NodeWorkerFnType;
    }
}
export declare class VmMain extends VmMainBase {
    private locoVmWorkerName;
    private createWebWorker;
    private addOutputText;
    private setUiKeysFn;
    private onGeolocationFn;
    private onSpeakFn;
    constructor(locoVmWorkerName: string, createWebWorker: (workerName: string) => Promise<Worker>, addOutputText: (str: string, needCls?: boolean, hasGraphics?: boolean) => void, setUiKeysFn: (codes: number[]) => void, onGeolocationFn: () => Promise<string>, onSpeakFn: (text: string, pitch: number) => Promise<void>);
    protected createCallbacks(): VmMessageHandlerCallbacks;
    protected postMessage(message: MessageToWorker): void;
    workerOnMessageHandler: (event: MessageEvent) => void;
    private handleBeforeUnload;
    protected getOrCreateWorker(): Promise<Worker>;
}
//# sourceMappingURL=VmMain.d.ts.map