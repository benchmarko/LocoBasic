import type { INodeParts, IVmAdmin, SnippetDataType } from "./Interfaces";
export declare class BasicVmNode implements IVmAdmin {
    private readonly vmCore;
    private readonly nodeParts;
    private readonly penColors;
    private readonly paperColors;
    reset: () => void;
    drawMovePlot: (type: string, x: number, y: number, pen?: number) => void;
    graphicsPen: (num: number) => void;
    ink: (num: number, col: number) => void;
    origin: (x: number, y: number) => void;
    printGraphicsText: (text: string) => void;
    rsx: (cmd: string, args: (number | string)[]) => Promise<(number | string)[]>;
    xpos: () => number;
    ypos: () => number;
    getSnippetData: () => SnippetDataType;
    constructor(nodeParts: INodeParts);
    cls(): void;
    escapeText(str: string, isGraphics?: boolean): string;
    flush(): void;
    inkey$(): Promise<string>;
    private fnOnInput;
    input(msg: string): Promise<string | null>;
    keyDef(_num: number, _repeat: number, ..._codes: number[]): void;
    mode(num: number): void;
    paper(n: number): void;
    pen(n: number): void;
    getEscape(): boolean;
}
//# sourceMappingURL=BasicVmNode.d.ts.map