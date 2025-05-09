import type { DefinedLabelEntryType, UsedLabelEntryType } from "./Interfaces";
export declare class SemanticsHelper {
    private lineIndex;
    private indent;
    private readonly variables;
    private readonly definedLabels;
    private readonly usedLabels;
    private readonly dataList;
    private dataIndex;
    private readonly restoreMap;
    private static readonly reJsKeyword;
    private readonly instrMap;
    private isDeg;
    private isDefContext;
    getDeg(): boolean;
    setDeg(isDeg: boolean): void;
    addIndent(num: number): number;
    setIndent(indent: number): void;
    getIndent(): number;
    getIndentStr(): string;
    addDataIndex(count: number): number;
    getDataIndex(): number;
    addDefinedLabel(label: string, line: number): void;
    getDefinedLabels(): DefinedLabelEntryType[];
    addUsedLabel(label: string, type: string): void;
    getUsedLabels(): Record<string, Record<string, UsedLabelEntryType>>;
    getInstrMap(): Record<string, number>;
    addInstr(name: string): number;
    getVariables(): string[];
    getVariable(name: string): string;
    setDefContext(isDef: boolean): void;
    private static deleteAllItems;
    incrementLineIndex(): number;
    getRestoreMap(): Record<string, number>;
    addRestoreLabel(label: string): void;
    getDataList(): (string | number)[];
    resetParser(): void;
}
//# sourceMappingURL=SemanticsHelper.d.ts.map