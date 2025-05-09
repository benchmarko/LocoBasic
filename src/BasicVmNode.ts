import { INodeParts, IVmAdmin, TimerMapType } from "./Interfaces";
import { BasicVmCore } from "./BasicVmCore";

function getAnsiColors(background: boolean): string[] {
    const colorCodes = [
        30, //  0 Black
        34, //  1 Blue 
        94, //  2 Bright Blue
        31, //  3 Red
        35, //  4 Magenta (Purple?)
        35, //  5 Mauve ???
        91, //  6 Bright Red
        35, //  7 Purple
        95, //  8 Bright Magenta ?
        32, //  9 Green
        36, // 10 Cyan
        94, // 11 Sky Blue ?
        33, // 12 Yellow
        37, // 13 White
        94, // 14 Pastel Blue ?
        91, // 15 Orange ?
        95, // 16 Pink (Bright Magenta?)
        95, // 17 Pastel Magenta?
        92, // 18 Bright Green
        92, // 19 Sea Green
        96, // 20 Bright Cyan
        96, // 21 Lime ?
        92, // 22 Pastel Green (Bright Green)
        96, // 23 Pastel Cyan ?
        93, // 24 Bright Yellow
        93, // 25 Pastel Yellow
        37, // 26 Bright White
        37, // 27 White (same as 13)
        95, // 28 Bright Magenta (same as 8)
        93, // 29 Pastel Yellow (same as 25)
        34, // 30 Blue (same as 1)
        92 //  31 Sea Green (same as 19)
    ];
    const add = background ? 10 : 0;

    return colorCodes.map((code: number) => `\x1b[${code + add}m`); // e.g. Navy: pen: "\x1b[34m" or paper: "\x1b[44m"
}

export class BasicVmNode implements IVmAdmin {
    private readonly vmCore: BasicVmCore;
    private readonly nodeParts: INodeParts;

    constructor(nodeParts: INodeParts) {
        this.nodeParts = nodeParts;
        const penColors = getAnsiColors(false);
        const paperColors = getAnsiColors(true);
        this.vmCore = new BasicVmCore(penColors, paperColors);
    }

    public cls(): void {
        this.vmCore.cls();
        console.clear();
    }

    public drawMovePlot(type: string, x: number, y: number): void {
        this.vmCore.drawMovePlot(type, x, y);
    }

    private static fnOnPrint(msg: string): void {
        console.log(msg.replace(/\n$/, ""));
    }

    public flush(): void {
        const textOutput = this.vmCore.flushText();
        if (textOutput) {
            BasicVmNode.fnOnPrint(textOutput);
        }
        const graphicsOutput = this.vmCore.flushGraphics();
        if (graphicsOutput) {
            BasicVmNode.fnOnPrint(graphicsOutput);
        }
    }

    public graphicsPen(num: number): void {
        this.vmCore.graphicsPen(num);
    }

    public ink(num: number, col: number) {
        this.vmCore.ink(num, col);
    }
    
    public inkey$(): Promise<string> {
        const key = this.nodeParts.getKeyFromBuffer();
        return Promise.resolve(key);
    }

    private async fnOnInput(msg: string): Promise<string> {
        console.log(msg);
        return Promise.resolve("");
    }

    public input(msg: string): Promise<string | null> {
        this.flush();
        return this.fnOnInput(msg);
    }

    public mode(num: number): void {
        this.vmCore.mode(num);
    }

    public origin(x: number, y: number): void {
        this.vmCore.origin(x, y);
    }

    public paper(n: number): void {
        this.vmCore.paper(n);
    }

    public pen(n: number): void {
        this.vmCore.pen(n);
    }

    public print(...args: string[]): void {
        this.vmCore.print(...args);
    }

    public async rsx(cmd: string, args: (number | string)[]): Promise<(number | string)[]> {
        return this.vmCore.rsx(cmd, args);
    }

    public tag(active: boolean): void {
        this.vmCore.tag(active);
    }

    public xpos(): number {
        return this.vmCore.xpos();
    }

    public ypos(): number {
        return this.vmCore.ypos();
    }

    public getEscape(): boolean {
        return this.nodeParts.getEscape();
    }

    public getTimerMap(): TimerMapType {
        return this.vmCore.getTimerMap();
    }

    public getOutput(): string {
        return this.vmCore.getOutput();
    }
    public setOutput(str: string): void {
        this.vmCore.setOutput(str);
    }
}
