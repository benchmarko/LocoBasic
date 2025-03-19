import { ICore } from "./Interfaces";
export declare class NodeParts {
    private nodePath?;
    private nodeFs?;
    private nodeHttps?;
    private modulePath;
    private nodeVm?;
    private nodeReadline?;
    private readonly keyBuffer;
    private escape;
    private fnOnKeyPressHandler?;
    private nodeGetAbsolutePath;
    private nodeReadFile;
    private nodeReadUrl;
    private loadScript;
    private keepRunning;
    private putScriptInFrame;
    private nodeCheckSyntax;
    private putKeyInBuffer;
    private fnOnKeypress;
    private initKeyboardInput;
    getKeyFromBuffer(): string;
    getEscape(): boolean;
    private start;
    private getExampleMap;
    private getExampleScript;
    nodeMain(core: ICore): Promise<void>;
    private static getHelpString;
}
//# sourceMappingURL=NodeParts.d.ts.map