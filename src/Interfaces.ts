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
    syntax: "loco11" | "loco20";
    example: string;
    exampleFilter: string;
    fileName: string;
    input: string;
    standaloneTerminal: boolean;
    showBasic: boolean;
    showCompiled: boolean;
    showOutput: boolean;
    outputConsole: boolean;
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
    getHelper(): SemanticsHelperType;
}

export type SemanticsHelperType = {
    getInstrMap(): InstrMapType;
}

export type VmInstructionName =
    | "abs"
    | "after"
    | "asc"
    | "atn"
    | "bin$"
    | "chr$"
    | "cint"
    | "clearInput"
    | "cls"
    | "cos"
    | "creal"
    | "dec$"
    | "dim"
    | "dim1"
    | "dim1i16"
    | "draw"
    | "drawr"
    | "end"
    | "every"
    | "exp"
    | "fix"
    | "frame"
    | "graphicsPen"
    | "hex$"
    | "ink"
    | "inkey$"
    | "input"
    | "instr"
    | "int"
    | "left$"
    | "len"
    | "lineInput"
    | "log"
    | "log10"
    | "lower$"
    | "max"
    | "mid$"
    | "mid$Assign"
    | "min"
    | "mode"
    | "move"
    | "mover"
    | "origin"
    | "paper"
    | "pen"
    | "pi"
    | "plot"
    | "plotr"
    | "pos"
    | "print"
    | "printTab"
    | "printTag"
    | "printTabTag"
    | "read"
    | "remain"
    | "restore"
    | "right$"
    | "rnd"
    | "round"
    | "round1"
    | "rsxArc"
    | "rsxCircle"
    | "rsxDate"
    | "rsxEllipse"
    | "rsxGeolocation"
    | "rsxPitch"
    | "rsxPolygon"
    | "rsxRect"
    | "rsxSay"
    | "rsxTime"
    | "sgn"
    | "sin"
    | "space$"
    | "spc"
    | "sqr"
    | "stop"
    | "str$"
    | "string$Num"
    | "string$Str"
    | "tan"
    | "time"
    | "toDeg"
    | "toRad"
    | "unt"
    | "upper$"
    | "using"
    | "val"
    | "val1"
    | "vpos"
    | "write"
    | "writeTag"
    | "xpos"
    | "ypos"
    | "zone";

export type InstrMapType = Partial<Record<VmInstructionName, number>>;

// Bivariant parameter hack: keeps assignability from concrete VmWorker methods
// while allowing normal calls in tests and generated code.
type VmInstructionFn = {
    bivarianceHack: (...args: unknown[]) => unknown;
}["bivarianceHack"];

export type VmApi = {
    pi: number;
} & {
    [K in Exclude<VmInstructionName, "pi" | "rsxDate" | "rsxTime">]: VmInstructionFn;
} & {
    // Helper/runtime methods used by worker tests and standalone generation
    getFlushedText: () => string;
    graGetFlushedGraphics: () => string;
    convert2ControlCodes: (str: string) => string;
    escapeText: (str: string) => string;
    onMessageHandler: (data: MessageToWorker) => void;
    pauseAllTimers: () => void;
    resumeAllTimers: () => void;
    remainAll: () => void;
    resetAll: () => void;
    deleteAllItems: (items: Record<string, unknown>) => void;
    rsxDate: (arg: string) => string[];
    rsxTime: (arg: string) => string[];

    // Internal worker state touched by tests
    _output: string;
    _isTerminal: boolean;
    _paperValue: number;
    _penValue: number;
    _pos: number;
    _vpos: number;
    _needCls: boolean;
    _data: (string | number)[];
    _dataPtr: number;
    _graBackgroundColor: string;
    _restoreMap: Record<string, number>;
    _rsxPitch: number;
    _stopRequested: boolean;
    _keyBuffer: string[];
    _graColorsForPens: number[];
    _graGraphicsBuffer: string;
    _timerMap: Record<number, unknown>;
    _pausePromise: Promise<void> | undefined;
    _waitResolvedFn: ((value: string) => void) | null;
};

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
    createStandaloneScript(workerFn: NodeWorkerFnType, compiledScript: string, usedInstr: string[], regexPrefix?: string, isTerminal?: boolean): string;
}

export type MessageToWorker =
    | { type: 'config'; isTerminal: boolean }
    | { type: 'continue', result: string }
    | { type: 'frameTime', time: number }
    | { type: 'input'; input: string | null }
    | { type: 'pause' }
    | { type: 'putKeys'; keys: string }
    | { type: 'resume' }
    | { type: 'run'; code: string }
    | { type: 'stop' };

export type MessageFromWorker =
    | { type: 'flush'; message: string; hasGraphics: boolean, needCls?: boolean }
    | { type: 'geolocation' }
    | { type: 'input'; prompt: string }
    | { type: 'inputKeys'; keys: string }
    | { type: 'result'; result: string }
    | { type: 'speak'; message: string; pitch: number };

export type VMObject = Record<string, unknown>;

export type NodeWorkerFnType = {
    workerFn: (parentPort: NodeWorkerThreadsType["parentPort"]) => VmApi;
}

export interface NodeWorkerType {
    on: (event: string, listener: (data: MessageFromWorker) => void) => void;
    postMessage: (message: MessageToWorker) => void;
    terminate: () => void;
}

export interface NodeWorkerThreadsType {
    parentPort: {
        postMessage: (message: MessageFromWorker) => void
        on: (event: string, listener: (data: MessageToWorker) => void) => void;
    }
}

export interface BrowserWorkerThreadsType {
    parentPort: {
        postMessage: (message: MessageFromWorker) => void
        addEventListener: (event: string, listener: (event: Event) => void, options?: EventListenerOptions) => void;
        removeEventListener: (event: string, listener: (event: Event) => void, options?: EventListenerOptions) => void;
    }
}

export interface IUI {
    addOutputText(str: string, needCls?: boolean, hasGraphics?: boolean): void;
    getCurrentDataKey(): string;
    onWindowLoadContinue(core: ICore, locoVmWorkerName: string): void;
}
