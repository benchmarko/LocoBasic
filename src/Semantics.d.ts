import type { ActionDict } from "ohm-js";
type GosubLabelEntryType = {
    count: number;
};
export declare class Semantics {
    getSemantics(): ActionDict<string | string[]>;
    private readonly variables;
    private static readonly reJsKeyword;
    private getVariables;
    private getVariable;
    private deleteAllItems;
    private readonly definedLabels;
    private readonly gosubLabels;
    getGosubLabels(): Record<string, GosubLabelEntryType>;
    private lineIndex;
    private readonly dataList;
    private readonly restoreMap;
    private incrementLineIndex;
    private getDefinedLabels;
    private addDefinedLabel;
    private addGosubLabel;
    private getRestoreMap;
    private addRestoreLabel;
    private getDataList;
    resetParser(): void;
}
export {};
//# sourceMappingURL=Semantics.d.ts.map