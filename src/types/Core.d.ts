import type { ConfigEntryType, ConfigType, ICore, IVmAdmin } from "./Interfaces";
export declare class Core implements ICore {
    private config;
    private readonly semantics;
    private readonly examples;
    private arithmeticParser;
    constructor(defaultConfig: ConfigType);
    private onCheckSyntax;
    getConfigObject(): ConfigType;
    getExampleObject(): Record<string, string>;
    setExample(name: string, script: string): void;
    getExample(name: string): string;
    setOnCheckSyntax(fn: (s: string) => Promise<string>): void;
    compileScript(script: string): string;
    executeScript(compiledScript: string, vm: IVmAdmin): Promise<string>;
    addItem: (key: string, input: string | (() => void)) => void;
    parseArgs(args: string[], config: Record<string, ConfigEntryType>): Record<string, ConfigEntryType>;
}
//# sourceMappingURL=Core.d.ts.map