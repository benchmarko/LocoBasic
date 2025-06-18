import type { ICore, INodeParts, NodeWorkerType } from "./Interfaces";
export declare class NodeParts implements INodeParts {
    private nodeVmMain;
    private nodeFs?;
    private nodeHttps?;
    private nodePath?;
    private nodeWorkerThreads?;
    private modulePath;
    private nodeReadline?;
    private readonly keyBuffer;
    private escape;
    private fnOnKeyPressHandler?;
    constructor();
    private getNodeFs;
    private getNodeHttps;
    private getNodePath;
    private getNodeWorkerConstructor;
    private nodeGetAbsolutePath;
    private nodeReadFile;
    private nodeReadUrl;
    createNodeWorker(workerFile: string): NodeWorkerType;
    private loadScript;
    private keepRunning;
    private putKeyInBuffer;
    private fnOnKeypress;
    private initKeyboardInput;
    getKeyFromBuffer(): string;
    getEscape(): boolean;
    consoleClear(): void;
    consolePrint(msg: string): void;
    private getWorkerAsString;
    private start;
    private getExampleMap;
    private getExampleScript;
    nodeMain(core: ICore): Promise<void>;
    private static getHelpString;
}
//# sourceMappingURL=NodeParts.d.ts.map