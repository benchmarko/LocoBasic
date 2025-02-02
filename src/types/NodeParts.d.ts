import { ICore } from "./Interfaces";
export declare class NodeParts {
    private core;
    private nodeFs?;
    private modulePath;
    private nodeVm?;
    constructor(core: ICore);
    private nodeReadFile;
    private keepRunning;
    private putScriptInFrame;
    private nodeCheckSyntax;
    private start;
    nodeMain(): Promise<void>;
}
//# sourceMappingURL=NodeParts.d.ts.map