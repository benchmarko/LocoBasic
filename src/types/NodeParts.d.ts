import type { ICore } from "./Interfaces";
export declare class NodeParts {
    private nodeVmMain?;
    private locoVmWorkerName;
    private readonly loadedNodeModules;
    private modulePath;
    private fnOnKeyPressHandler?;
    private getNodeModule;
    private getNodePath;
    private nodeGetAbsolutePath;
    private nodeReadFile;
    private nodeReadUrl;
    private createNodeWorker;
    private getNodeWorkerFn;
    private static isUrl;
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