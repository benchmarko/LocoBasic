import type { ActionDict } from "ohm-js";
import type { ISemantics, UsedLabelEntryType } from "./Interfaces";
import { SemanticsHelper } from "./SemanticsHelper";
export declare class Semantics implements ISemantics {
    private readonly helper;
    constructor();
    resetParser(): void;
    getUsedLabels(): Record<string, Record<string, UsedLabelEntryType>>;
    getSemanticsActionDict(): ActionDict<string>;
    getHelper(): SemanticsHelper;
}
//# sourceMappingURL=Semantics.d.ts.map