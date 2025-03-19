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
    databaseDirs: string;
    database: string;
    debug: number;
    example: string;
    fileName: string;
    grammar: string;
    input: string;
    debounceCompile: number;
    debounceExecute: number;
};
export interface IVm {
    cls(): void;
    drawMovePlot(type: string, x: number, y: number): void;
    flush(): void;
    graphicsPen(num: number): void;
    inkey$(): Promise<string>;
    input(_msg: string): Promise<string | null>;
    mode(num: number): void;
    paper(color: number): void;
    pen(color: number): void;
    print(_msg: string): void;
    getEscape(): boolean;
}
export interface IVmAdmin extends IVm {
    getOutput(): string;
    setOutput(str: string): void;
}
export interface ICore {
    getConfigObject(): ConfigType;
    initDatabaseMap(): DatabaseMapType;
    getDatabaseMap(): DatabaseMapType;
    getDatabase(): DatabaseType;
    getExampleMap(): ExampleMapType;
    setExampleMap(exampleMap: ExampleMapType): void;
    getExample(name: string): ExampleType;
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
    getCurrentDataKey(): string;
    onWindowLoadContinue(core: ICore, vm: IVmAdmin): void;
    getEscape(): boolean;
    addOutputText(value: string): void;
    setOutputText(value: string): void;
    getPaperColors(colorsForPens: string[]): string[];
    getPenColors(colorsForPens: string[]): string[];
    checkSyntax(str: string): Promise<string>;
    prompt(msg: string): string | null;
    getKeyFromBuffer(): string;
}
export type DefinedLabelEntryType = {
    label: string;
    first: number;
    last: number;
    dataIndex: number;
};
export type GosubLabelEntryType = {
    count: number;
};
export interface ISemanticsHelper {
    addDataIndex(count: number): void;
    addDefinedLabel(label: string, line: number): void;
    addGosubLabel(label: string): void;
    addIndent(num: number): number;
    addInstr(name: string): number;
    addRestoreLabel(label: string): void;
    applyNextIndent(): void;
    getDataIndex(): number;
    getDataList(): (string | number)[];
    getDefinedLabels(): DefinedLabelEntryType[];
    getGosubLabels(): Record<string, GosubLabelEntryType>;
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
//# sourceMappingURL=Interfaces.d.ts.map