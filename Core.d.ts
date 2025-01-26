import type { ICore, ConfigType, ConfigEntryType } from "./Interfaces";
export declare class Core implements ICore {
    private readonly startConfig;
    private readonly semantics;
    private readonly examples;
    private vm;
    private onCheckSyntax;
    getConfigObject(): ConfigType;
    getConfig<T extends ConfigEntryType>(name: string): T;
    getExampleObject(): Record<string, string>;
    setExample(name: string, script: string): void;
    getExample(name: string): string;
    setOnCls(fn: () => void): void;
    setOnPrint(fn: (msg: string) => void): void;
    setOnPrompt(fn: (msg: string) => string): void;
    setOnCheckSyntax(fn: (s: string) => Promise<string>): void;
    setPaperColors(colors: string[]): void;
    setPenColors(colors: string[]): void;
    private arithmeticParser;
    compileScript(script: string): any;
    executeScript(compiledScript: string): Promise<string>;
    putScriptInFrame(script: string): string;
}
//# sourceMappingURL=Core.d.ts.map