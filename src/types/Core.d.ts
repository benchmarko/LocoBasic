import type { CompileResultType, ConfigEntryType, ConfigType, DatabaseMapType, DatabaseType, ExampleMapType, ExampleType, ICore, NodeWorkerFnType } from "./Interfaces";
import { Semantics } from "./Semantics";
export declare class Core implements ICore {
    private readonly defaultConfig;
    private readonly config;
    private readonly semantics;
    private readonly databaseMap;
    private arithmeticParser?;
    private scriptCreator?;
    constructor(defaultConfig: ConfigType);
    getDefaultConfigMap(): ConfigType;
    getConfigMap(): ConfigType;
    initDatabaseMap(): DatabaseMapType;
    getDatabaseMap(): DatabaseMapType;
    getDatabase(): DatabaseType;
    getExampleMap(): ExampleMapType;
    setExampleMap(exampleMap: ExampleMapType): void;
    getExample(name: string): ExampleType;
    private static expandNextStatements;
    compileScript(script: string): CompileResultType;
    getSemantics(): Semantics;
    private static fnHereDoc;
    addIndex: (dir: string, input: Record<string, ExampleType[]> | (() => void)) => void;
    addItem: (key: string, input: string | (() => void)) => void;
    parseArgs(args: string[], config: Record<string, ConfigEntryType>): Record<string, ConfigEntryType>;
    createStandaloneScript(workerFn: NodeWorkerFnType, compiledScript: string, usedInstr: string[]): string;
}
//# sourceMappingURL=Core.d.ts.map