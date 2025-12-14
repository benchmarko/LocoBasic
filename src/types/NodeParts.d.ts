import type { ICore } from "./Interfaces";
export declare class NodeParts {
    private nodeVmMain?;
    private locoVmWorkerName;
    private nodeFs?;
    private nodeHttps?;
    private nodePath?;
    private nodeWorkerThreads?;
    private modulePath;
    private nodeReadline?;
    private fnOnKeyPressHandler?;
    private getNodeFs;
    private getNodeHttps;
    private getNodePath;
    private getNodeWorkerConstructor;
    private nodeGetAbsolutePath;
    private nodeReadFile;
    private nodeReadUrl;
    private createNodeWorker;
    private getNodeWorkerFn;
    private loadScript;
    private keepRunning;
    private fnOnKeypress;
    private initKeyboardInput;
    private createMessageHandlerCallbacks;
    private getNodeVmMain;
    private startRun;
    private start;
    private getExampleMap;
    private getExampleScript;
    nodeMain(core: ICore, locoVmWorkerName: string): Promise<void>;
    private static getHelpString;
}
//# sourceMappingURL=NodeParts.d.ts.map