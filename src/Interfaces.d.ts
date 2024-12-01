export type ConfigEntryType = string | number | boolean;
export type ConfigType = Record<string, ConfigEntryType>;
export type ExampleType = Record<string, string>;
export interface ICore {
    getConfigObject(): ConfigType;
    getConfig(name: string): ConfigEntryType;
    getExampleObject(): ExampleType;
    getExample(name: string): string;
    setExample(key: string, script: string): void;
    compileScript(script: string): string;
    executeScript(compiledScript: string): Promise<string>;
    setOnCls(fn: () => void): void;
}
export interface IUi {
    parseUri(urlQuery: string, config: ConfigType): string[];
    onWindowLoad(event: Event): void;
    setOutputText(value: string): void;
}
//# sourceMappingURL=Interfaces.d.ts.map