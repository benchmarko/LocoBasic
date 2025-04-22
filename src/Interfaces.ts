export type ConfigEntryType = string | number | boolean;

export interface ExampleType {
	key: string
	title: string
	meta: string // D=data
	script?: string
}

export type ExampleMapType = Record<string, ExampleType>;

export interface DatabaseType {
	key: string
    source: string,
	exampleMap?: ExampleMapType
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

export type TimerMapType = Record<number, number | NodeJS.Timeout | undefined>;

export interface IVm {
    cls(): void;
    drawMovePlot(type: string, x: number, y: number): void;
    flush(): void;
    graphicsPen(num: number): void;
    ink(num: number, col: number): void;
    inkey$(): Promise<string>;
    input(msg: string): Promise<string | null>;
    mode(num: number): void;
    origin(x: number, y: number): void;
    paper(color: number): void;
    pen(color: number): void;
    print(msg: string): void;
    rsx(cmd: string, args: (string | number)[]): Promise<(number | string)[]>;
    tag(active: boolean): void;
    xpos(): number;
    ypos(): number;
    getEscape(): boolean;
    getTimerMap(): TimerMapType;
}

export interface IVmAdmin extends IVm {
    getOutput(): string;
    setOutput(str: string): void;
}

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

export interface ISemanticsHelper {
    addDataIndex(count: number): void;
    addDefinedLabel(label: string, line: number): void;
    addUsedLabel(label: string, type: string): void;
    addIndent(num: number): number;
    addInstr(name: string): number;
    addRestoreLabel(label: string): void;
    applyNextIndent(): void;
    getDataIndex(): number;
    getDataList(): (string | number)[];
    getDefinedLabels(): DefinedLabelEntryType[];
    getUsedLabels(): Record<string, Record<string, UsedLabelEntryType>>;
    getIndent(): number;
    getIndentStr(): string;
    getInstrMap(): Record<string, number>;
    getRestoreMap(): Record<string, number>;
    getVariable(name: string): string;
    getVariables(): string[];
    incrementLineIndex(): number;
    nextIndentAdd(num: number): void;
    setIndent(indent: number): void;
    setDeg(isDeg: boolean): void;
    getDeg(): boolean;
    setDefContext(isDef: boolean): void;
}

export interface ICore {
    getDefaultConfigMap(): ConfigType;
    getConfigMap(): ConfigType;
    initDatabaseMap(): DatabaseMapType;
    getDatabaseMap(): DatabaseMapType;
    getDatabase(): DatabaseType;
    getExampleMap(): ExampleMapType;
    setExampleMap(exampleMap: ExampleMapType): void;
    getExample(name: string): ExampleType;
    getSemanticsHelper(): ISemanticsHelper;
    compileScript(script: string): string;
    executeScript(compiledScript: string, vm: IVmAdmin): Promise<string>;
    setOnCheckSyntax(fn: (s: string) => Promise<string>): void;
    addIndex: (dir: string, input: Record<string, ExampleType[]> | (() => void)) => void;
    addItem(key: string, input: string | (() => void)): void;
    parseArgs(args: string[], config: Record<string, ConfigEntryType>): void;
}

export interface INodeParts {
    getEscape(): boolean;
    getKeyFromBuffer(): string;
}

export interface IUI {
    getCurrentDataKey() : string;
    onWindowLoadContinue(core: ICore, vm: IVmAdmin): void;
    getEscape(): boolean;
    addOutputText(value: string): void;
    setOutputText(value: string): void;
    getColor(color: string, background: boolean): string;
    checkSyntax(str: string): Promise<string>;
    prompt(msg: string): string | null;
    speak(text: string, pitch: number): Promise<void>;
    getKeyFromBuffer(): string;
}
