import type { ICore, ConfigType } from "./Interfaces";
export declare class Core implements ICore {
    private readonly startConfig;
    private readonly semantics;
    private readonly examples;
    private vm;
    getConfigObject(): ConfigType;
    getConfig(name: string): import("./Interfaces").ConfigEntryType;
    getExampleObject(): Record<string, string>;
    setExample(name: string, script: string): void;
    getExample(name: string): string;
    setOnCls(fn: () => void): void;
    private arithmeticParser;
    compileScript(script: string): any;
    executeScript(compiledScript: string): Promise<string>;
}
//# sourceMappingURL=Core.d.ts.map