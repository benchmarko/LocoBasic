import { INodeParts } from "./Interfaces";
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

export class BasicVmNode extends BasicVmCore {
    private readonly penColors: string[] = getAnsiColors(false);
    private readonly paperColors: string[] = getAnsiColors(true);
    private readonly nodeParts: INodeParts;

    constructor(nodeParts: INodeParts) {
        super();
        this.nodeParts = nodeParts;
    }

    public fnOnCls(): void {
        console.clear();
    }

    public fnOnPrint(msg: string): void {
        console.log(msg.replace(/\n$/, ""));
    }

    public async fnOnInput(msg: string): Promise<string> {
        console.log(msg);
        return Promise.resolve("");
    }

    public fnGetPenColor(num: number): string {
        if (num < 0 || num >= this.penColors.length) {
            throw new Error("Invalid pen color index");
        }
        return this.penColors[num];
    }

    public fnGetPaperColor(num: number): string {
        if (num < 0 || num >= this.paperColors.length) {
            throw new Error("Invalid paper color index");
        }
        return this.paperColors[num];
    }

    public inkey$(): Promise<string> {
        const key = this.nodeParts.getKeyFromBuffer();
        return Promise.resolve(key);
    }

    public getEscape(): boolean {
        return this.nodeParts.getEscape();
    }
}
