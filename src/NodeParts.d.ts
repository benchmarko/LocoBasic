import { ICore } from "./Interfaces";
export declare class NodeParts {
    private nodeFs?;
    private modulePath;
    private nodeVm?;
    private nodeReadline?;
    private readonly keyBuffer;
    private escape;
    private fnOnKeyPressHandler?;
    private nodeReadFile;
    private keepRunning;
    private putScriptInFrame;
    private nodeCheckSyntax;
    private putKeyInBuffer;
    private fnOnKeypress;
    private initKeyboardInput;
    getKeyFromBuffer(): string;
    getEscape(): boolean;
    private start;
    nodeMain(core: ICore): Promise<void>;
    private static getHelpString;
}
//# sourceMappingURL=NodeParts.d.ts.map