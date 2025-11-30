export type ConfigEntryType = string | number | boolean;
export interface ExampleType {
    key: string;
    title: string;
    meta: string;
    script?: string;
}
export type ExampleMapType = Record<string, ExampleType>;
export interface DatabaseType {
    key: string;
    source: string;
    exampleMap?: ExampleMapType;
}
export type DatabaseMapType = Record<string, DatabaseType>;
export type ConfigType = {
    action: string;
    autoCompile: boolean;
    autoExecute: boolean;
    databaseDirs: string;
    database: string;
    debounceCompile: number;
    debounceExecute: number;
    debug: number;
    example: string;
    fileName: string;
    grammar: string;
    input: string;
    showBasic: boolean;
    showCompiled: boolean;
    showOutput: boolean;
};
export type DefinedLabelEntryType = {
    label: string;
    first: number;
    last: number;
    dataIndex: number;
};
export type UsedLabelEntryType = {
    count: number;
};
export interface ISemantics {
    getUsedLabels(): Record<string, Record<string, UsedLabelEntryType>>;
    getHelper(): SemanticsHelperType;
}
export type SemanticsHelperType = {
    getInstrMap(): Record<string, number>;
};
export type CompileResultType = {
    compiledScript: string;
    messages: string[];
};
export interface ICore {
    getDefaultConfigMap(): ConfigType;
    getConfigMap(): ConfigType;
    initDatabaseMap(): DatabaseMapType;
    getDatabaseMap(): DatabaseMapType;
    getDatabase(): DatabaseType;
    getExampleMap(): ExampleMapType;
    setExampleMap(exampleMap: ExampleMapType): void;
    getExample(name: string): ExampleType;
    getSemantics(): ISemantics;
    compileScript(script: string): CompileResultType;
    addIndex: (dir: string, input: Record<string, ExampleType[]> | (() => void)) => void;
    addItem(key: string, input: string | (() => void)): void;
    parseArgs(args: string[], config: Record<string, ConfigEntryType>): void;
    prepareWorkerFnString(workerFnString: string): string;
    createStandaloneScript(workerString: string, compiledScript: string, usedInstrMap: Record<string, number>): string;
}
export type MessageToWorker = {
    type: 'config';
    isTerminal: boolean;
} | {
    type: 'continue';
    result: string;
} | {
    type: 'input';
    prompt: string | null;
} | {
    type: 'putKeys';
    keys: string;
} | {
    type: 'run';
    code: string;
} | {
    type: 'stop';
};
export type MessageFromWorker = {
    type: 'frame';
    message: string;
    hasGraphics: boolean;
    needCls?: boolean;
} | {
    type: 'geolocation';
} | {
    type: 'input';
    prompt: string;
} | {
    type: 'keyDef';
    codes: number[];
} | {
    type: 'result';
    result: string;
} | {
    type: 'speak';
    message: string;
    pitch: number;
};
export interface NodeWorkerType {
    on: (event: string, listener: (data: MessageFromWorker) => void) => void;
    postMessage: (message: MessageToWorker) => void;
    terminate: () => void;
}
export interface NodeWorkerThreadsType {
    parentPort: {
        postMessage: (message: MessageFromWorker) => void;
        on: (event: string, listener: (data: MessageToWorker) => void) => void;
    };
}
export interface INodeParts {
    getEscape(): boolean;
    getKeyFromBuffer(): string;
    createNodeWorker(workerFile: string): NodeWorkerType;
    consoleClear(): void;
    consolePrint(msg: string): void;
}
export interface IUI {
    addOutputText(str: string, needCls?: boolean, hasGraphics?: boolean): void;
    getCurrentDataKey(): string;
    onWindowLoadContinue(core: ICore, locoVmWorkerName: string): void;
}
//# sourceMappingURL=Interfaces.d.ts.map