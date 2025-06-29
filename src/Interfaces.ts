export type ConfigEntryType = string | number | boolean;

export interface ExampleType {
    key: string;
    title: string;
    meta: string; // D=data
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
    action: string; // "compile,run"
    autoCompile: boolean;
    autoExecute: boolean;
    databaseDirs: string, // example base directories (comma separated)
    database: string, // examples, apps, saved
    debounceCompile: number;
    debounceExecute: number;
    debug: number;
    example: string;
    fileName: string;
    grammar: string; // "basic" or "strict"
    input: string;
    showBasic: boolean;
    showCompiled: boolean;
    showOutput: boolean;
};

// Type definition for a defined label entry (line label)
export type DefinedLabelEntryType = {
    label: string,
    first: number,
    last: number,
    dataIndex: number
}

// Type definition for a used label entry (GOSUB, RESTORE)
export type UsedLabelEntryType = {
    count: number
}

export interface ISemantics {
    getUsedLabels(): Record<string, Record<string, UsedLabelEntryType>>;
}

export type CompileResultType = {
    compiledScript: string,
    messages: string[] 
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
}


export type MessageToWorker =
    | { type: 'config'; isTerminal: boolean }
    | { type: 'continue', result: string }
    | { type: 'input'; prompt: string | null }
    | { type: 'putKeys'; keys: string }
    | { type: 'run'; code: string }
    | { type: 'stop' };

export type MessageFromWorker =
    | { type: 'frame'; message: string; hasGraphics: boolean, needCls?: boolean }
    | { type: 'geolocation' }
    | { type: 'input'; prompt: string }
    | { type: 'keyDef'; codes: number[] }
    | { type: 'result'; result: string }
    | { type: 'speak'; message: string; pitch: number };

export interface NodeWorkerType {
    on: (event: string, listener: (data: MessageFromWorker) => void) => void;
    postMessage: (message: MessageToWorker) => void;
    terminate: () => void;
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
    onWindowLoadContinue(core: ICore, workerFn: () => unknown): void;
    prompt(msg: string): string | null;
}
