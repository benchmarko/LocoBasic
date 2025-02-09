import { BasicVmCore } from "./BasicVmCore";
export declare class BasicVmNode extends BasicVmCore {
    private readonly penColors;
    private readonly paperColors;
    constructor();
    fnOnCls(): void;
    fnOnPrint(msg: string): void;
    fnOnPrompt(msg: string): Promise<string>;
    fnGetPenColor(num: number): string;
    fnGetPaperColor(num: number): string;
}
//# sourceMappingURL=BasicVmNode.d.ts.map