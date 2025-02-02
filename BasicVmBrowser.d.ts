import { IUI } from "./Interfaces";
import { BasicVmCore } from "./BasicVmCore";
export declare class BasicVmBrowser extends BasicVmCore {
    private readonly ui;
    private readonly penColors;
    private readonly paperColors;
    constructor(ui: IUI);
    fnOnCls(): void;
    fnOnPrint(msg: string): void;
    fnOnPrompt(msg: string): string | null;
    fnGetPenColor(num: number): string;
    fnGetPaperColor(num: number): string;
}
//# sourceMappingURL=BasicVmBrowser.d.ts.map