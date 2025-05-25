import type { INodeParts, IVmAdmin, SnippetDataType } from "./Interfaces";
export declare class BasicVmNode implements IVmAdmin {
    private readonly vmCore;
    private readonly nodeParts;
    constructor(nodeParts: INodeParts);
    reset(): void;
    cls(): void;
    drawMovePlot(type: string, x: number, y: number): void;
    flush(): void;
    graphicsPen(num: number): void;
    ink(num: number, col: number): void;
    inkey$(): Promise<string>;
    private fnOnInput;
    input(msg: string): Promise<string | null>;
    mode(num: number): void;
    origin(x: number, y: number): void;
    paper(n: number): void;
    pen(n: number): void;
    pos(): number;
    print(...args: string[]): void;
    rsx(cmd: string, args: (number | string)[]): Promise<(number | string)[]>;
    tag(active: boolean): void;
    vpos(): number;
    xpos(): number;
    ypos(): number;
    zone(num: number): void;
    getEscape(): boolean;
    getSnippetData(): SnippetDataType;
    getOutput(): string;
}
//# sourceMappingURL=BasicVmNode.d.ts.map