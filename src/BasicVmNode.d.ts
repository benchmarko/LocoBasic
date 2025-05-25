import type { INodeParts, IVmAdmin, SnippetDataType } from "./Interfaces";
export declare class BasicVmNode implements IVmAdmin {
    private readonly vmCore;
    private readonly nodeParts;
    reset: () => void;
    drawMovePlot: (type: string, x: number, y: number) => void;
    graphicsPen: (num: number) => void;
    ink: (num: number, col: number) => void;
    origin: (x: number, y: number) => void;
    paper: (n: number) => void;
    pen: (n: number) => void;
    pos: () => number;
    print: (...args: string[]) => void;
    rsx: (cmd: string, args: (number | string)[]) => Promise<(number | string)[]>;
    tag: (active: boolean) => void;
    vpos: () => number;
    xpos: () => number;
    ypos: () => number;
    zone: (num: number) => void;
    getSnippetData: () => SnippetDataType;
    getOutput: () => string;
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