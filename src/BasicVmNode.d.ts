import { INodeParts } from "./Interfaces";
import { BasicVmCore } from "./BasicVmCore";
export declare class BasicVmNode extends BasicVmCore {
    private readonly penColors;
    private readonly paperColors;
    private readonly nodeParts;
    constructor(nodeParts: INodeParts);
    fnOnCls(): void;
    fnOnPrint(msg: string): void;
    fnOnInput(msg: string): Promise<string>;
    fnGetPenColor(num: number): string;
    fnGetPaperColor(num: number): string;
    inkey$(): Promise<string>;
    getEscape(): boolean;
}
//# sourceMappingURL=BasicVmNode.d.ts.map