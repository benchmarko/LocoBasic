import type { ActionDict } from "ohm-js";
export declare class Semantics {
    private lineIndex;
    private indent;
    private indentAdd;
    private readonly variables;
    private readonly definedLabels;
    private readonly gosubLabels;
    private readonly dataList;
    private dataIndex;
    private readonly restoreMap;
    private static readonly reJsKeyword;
    private readonly instrMap;
    private addIndent;
    private setIndent;
    private getIndent;
    private getIndentStr;
    private applyNextIndent;
    private nextIndentAdd;
    private addDataIndex;
    private getDataIndex;
    private addDefinedLabel;
    private getDefinedLabels;
    private addGosubLabel;
    private getGosubLabels;
    private getInstrKeys;
    private addInstr;
    private getVariables;
    private getVariable;
    private static deleteAllItems;
    private incrementLineIndex;
    private getRestoreMap;
    private addRestoreLabel;
    private getDataList;
    resetParser(): void;
    getSemantics(): ActionDict<string | string[]>;
}
//# sourceMappingURL=Semantics.d.ts.map