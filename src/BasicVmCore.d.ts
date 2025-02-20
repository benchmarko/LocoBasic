import type { IVmAdmin } from "./Interfaces";
export declare class BasicVmCore implements IVmAdmin {
    private output;
    private currPaper;
    private currPen;
    private currMode;
    private readonly graphicsBuffer;
    private readonly graphicsPathBuffer;
    private currGraphicsPen;
    private graphicsX;
    private graphicsY;
    protected fnOnCls(): void;
    protected fnOnInput(_msg: string): Promise<string | null>;
    protected fnOnPrint(_msg: string): void;
    protected fnGetPenColor(_num: number): string;
    protected fnGetPaperColor(_num: number): string;
    protected getColorsForPens(): string[];
    cls(): void;
    drawMovePlot(type: string, x: number, y: number): void;
    private flushGraphicsPath;
    flush(): void;
    graphicsPen(num: number): void;
    inkey$(): Promise<string>;
    input(msg: string): Promise<string | null>;
    mode(num: number): void;
    paper(n: number): void;
    pen(n: number): void;
    print(...args: string[]): void;
    getEscape(): boolean;
    getOutput(): string;
    setOutput(str: string): void;
}
//# sourceMappingURL=BasicVmCore.d.ts.map