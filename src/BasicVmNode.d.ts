import type { INodeParts, IVmAdmin, SnippetDataType } from "./Interfaces";
export declare class BasicVmNode implements IVmAdmin {
    private readonly vmCore;
    private readonly nodeParts;
    reset: () => void;
    drawMovePlot: (type: string, x: number, y: number) => void;
    graphicsPen: (num: number) => void;
    ink: (num: number, col: number) => void;
    origin: (x: number, y: number) => void;
    printGraphicsText: (text: string) => void;
    rsx: (cmd: string, args: (number | string)[]) => Promise<(number | string)[]>;
    xpos: () => number;
    ypos: () => number;
    getSnippetData: () => SnippetDataType;
    getColorForPen: (n: number, isPaper?: boolean) => string;
    constructor(nodeParts: INodeParts);
    cls(): void;
    flush(): void;
    inkey$(): Promise<string>;
    private fnOnInput;
    input(msg: string): Promise<string | null>;
    mode(num: number): void;
    getEscape(): boolean;
}
//# sourceMappingURL=BasicVmNode.d.ts.map