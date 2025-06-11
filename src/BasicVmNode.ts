import type { INodeParts, IVmAdmin, SnippetDataType } from "./Interfaces";
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
    private readonly penColors: string[];
    private readonly paperColors: string[];

    public reset: () => void;
    public drawMovePlot: (type: string, x: number, y: number, pen?: number) => void;
    public graphicsPen: (num: number) => void;
    public ink: (num: number, col: number) => void;
    public origin: (x: number, y: number) => void;
    public printGraphicsText: (text: string) => void;
    public rsx: (cmd: string, args: (number | string)[]) => Promise<(number | string)[]>;
    public xpos: () => number;
    public ypos: () => number;
    public getSnippetData: () => SnippetDataType;

    constructor(nodeParts: INodeParts) {
        this.nodeParts = nodeParts;
        this.penColors = getAnsiColors(false);
        this.paperColors = getAnsiColors(true);
        this.vmCore = new BasicVmCore();

        this.reset = this.vmCore.reset.bind(this.vmCore);
        this.drawMovePlot = this.vmCore.drawMovePlot.bind(this.vmCore);
        this.graphicsPen = this.vmCore.graphicsPen.bind(this.vmCore);
        this.ink = this.vmCore.ink.bind(this.vmCore);
        this.origin = this.vmCore.origin.bind(this.vmCore);
        this.printGraphicsText = this.vmCore.printGraphicsText.bind(this.vmCore);
        this.rsx = this.vmCore.rsx.bind(this.vmCore);
        this.xpos = this.vmCore.xpos.bind(this.vmCore);
        this.ypos = this.vmCore.ypos.bind(this.vmCore);
        this.getSnippetData = this.vmCore.getSnippetData.bind(this.vmCore);
    }

    public cls(): void {
        this.vmCore.cls();
        this.nodeParts.consoleClear();
    }

    public escapeText(str: string, isGraphics?: boolean): string {
        // for node we need to escape only graphics text
        return isGraphics ? str.replace(/&/g, "&amp;").replace(/</g, "&lt;") : str;
    }

    public flush(): void {
        const textOutput = this.vmCore.flushText().replace(/\n$/, "");
        const graphicsOutput = this.vmCore.flushGraphics().replace(/\n$/, "");
        const outputGraphicsIndex = this.vmCore.getOutputGraphicsIndex();
        const output = outputGraphicsIndex >= 0 ? textOutput.substring(0, outputGraphicsIndex) + graphicsOutput + textOutput.substring(outputGraphicsIndex) : textOutput;
        if (output !== "") {
            this.nodeParts.consolePrint(output);
        }
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

    public keyDef(_num: number, _repeat: number, ..._codes: number[]): void { // eslint-disable-line @typescript-eslint/no-unused-vars
        // empty
    }

    public mode(num: number): void {
        this.vmCore.mode(num);
    }

    public paper(n: number): void {
        const snippetData = this.vmCore.getSnippetData();
        if (n !== snippetData.paperValue) {
            snippetData.paperValue = n;
            snippetData.output += this.paperColors[this.vmCore.getColorForPen(n)];
        }
    }

    public pen(n: number): void {
        const snippetData = this.vmCore.getSnippetData();
        if (n !== snippetData.penValue) {
            snippetData.penValue = n;
            snippetData.output += this.penColors[this.vmCore.getColorForPen(n)];
        }
    }

    public getEscape(): boolean {
        return this.nodeParts.getEscape();
    }
}
