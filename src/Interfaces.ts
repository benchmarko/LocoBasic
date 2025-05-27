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

export type SnippetDataType = {
    data: (string | number)[];
    dataPtr: number;
    restoreMap: Record<string, number>;
    startTime: number;
    timerMap: Record<number, number | NodeJS.Timeout | undefined>;
    output: string;
    paper: number;
    pen: number;
    pos: number;
    tag: boolean;
    vpos: number;
    zone: number;
}

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
    printGraphicsText(text: string): void;
    rsx(cmd: string, args: (string | number)[]): Promise<(number | string)[]>;
    xpos(): number;
    ypos(): number;
    getEscape(): boolean;
    getSnippetData(): SnippetDataType;
    getColorForPen(n: number, isPaper?: boolean): string;
}

export interface IVmAdmin extends IVm {
    reset(): void;
}

export interface IVmRsxApi {
    addGraphicsElement(element: string): void;
    getGraphicsPen(): number;
    getRgbColorStringForPen(pen: number): string;
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

export interface ISemantics {
    getUsedLabels(): Record<string, Record<string, UsedLabelEntryType>>;
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
    getSemantics(): ISemantics;
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
    consoleClear(): void;
    consolePrint(msg: string): void;
}

export interface IUI {
    addOutputText(value: string): void;
    checkSyntax(str: string): Promise<string>;
    getColor(color: string, background: boolean): string;
    getCurrentDataKey(): string;
    getEscape(): boolean;
    getKeyFromBuffer(): string;
    onWindowLoadContinue(core: ICore, vm: IVmAdmin): void;
    setOutputText(value: string): void;
    prompt(msg: string): string | null;
    speak(text: string, pitch: number): Promise<void>;
}
