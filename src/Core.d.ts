import type { ConfigEntryType, ConfigType, DatabaseMapType, DatabaseType, ExampleMapType, ExampleType, ICore, IVmAdmin } from "./Interfaces";
import { Semantics } from "./Semantics";
export declare class Core implements ICore {
    private readonly defaultConfig;
    private readonly config;
    private readonly semantics;
    private readonly databaseMap;
    private arithmeticParser;
    constructor(defaultConfig: ConfigType);
    private onCheckSyntax;
    getDefaultConfigMap(): ConfigType;
    getConfigMap(): ConfigType;
    initDatabaseMap(): DatabaseMapType;
    getDatabaseMap(): DatabaseMapType;
    getDatabase(): DatabaseType;
    getExampleMap(): ExampleMapType;
    setExampleMap(exampleMap: ExampleMapType): void;
    getExample(name: string): ExampleType;
    setOnCheckSyntax(fn: (s: string) => Promise<string>): void;
    compileScript(script: string): string;
    executeScript(compiledScript: string, vm: IVmAdmin): Promise<string>;
    getSemantics(): Semantics;
    addIndex: (dir: string, input: Record<string, ExampleType[]> | (() => void)) => void;
    addItem: (key: string, input: string | (() => void)) => void;
    parseArgs(args: string[], config: Record<string, ConfigEntryType>): Record<string, ConfigEntryType>;
}
//# sourceMappingURL=Core.d.ts.map