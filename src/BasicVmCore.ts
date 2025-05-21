import type { IVmRsxApi, SnippetDataType } from "./Interfaces";
import { BasicVmRsxHandler } from "./BasicVmRsxHandler";

const strokeWidthForMode: number[] = [4, 2, 1, 1];

export class BasicVmCore implements IVmRsxApi {
    private readonly penColors: string[];
    private readonly paperColors: string[];
    private output: string = "";
    private currPaper: number = -1;
    private currPen: number = -1;
    private currMode: number = 2;
    private readonly graphicsBuffer: string[] = [];
    private readonly graphicsPathBuffer: string[] = [];
    private currGraphicsPen: number = -1;
    private originX: number = 0;
    private originY: number = 0;
    private graphicsX: number = 0;
    private graphicsY: number = 0;
    private readonly colorsForPens: number[] = [];
    private backgroundColor = "";
    private isTag: boolean = false; // text at graphics
    private snippetData: SnippetDataType = {} as SnippetDataType;
    private rsxHandler: BasicVmRsxHandler;

    private static readonly cpcColors = [
        "#000000", //  0 Black
        "#000080", //  1 Blue
        "#0000FF", //  2 Bright Blue
        "#800000", //  3 Red
        "#800080", //  4 Magenta
        "#8000FF", //  5 Mauve
        "#FF0000", //  6 Bright Red
        "#FF0080", //  7 Purple
        "#FF00FF", //  8 Bright Magenta
        "#008000", //  9 Green
        "#008080", // 10 Cyan
        "#0080FF", // 11 Sky Blue
        "#808000", // 12 Yellow
        "#808080", // 13 White
        "#8080FF", // 14 Pastel Blue
        "#FF8000", // 15 Orange
        "#FF8080", // 16 Pink
        "#FF80FF", // 17 Pastel Magenta
        "#00FF00", // 18 Bright Green
        "#00FF80", // 19 Sea Green
        "#00FFFF", // 20 Bright Cyan
        "#80FF00", // 21 Lime
        "#80FF80", // 22 Pastel Green
        "#80FFFF", // 23 Pastel Cyan
        "#FFFF00", // 24 Bright Yellow
        "#FFFF80", // 25 Pastel Yellow
        "#FFFFFF", // 26 Bright White
        "#808080", // 27 White (same as 13)
        "#FF00FF", // 28 Bright Magenta (same as 8)
        "#FFFF80", // 29 Pastel Yellow (same as 25)
        "#000080", // 30 Blue (same as 1)
        "#00FF80" //  31 Sea Green (same as 19)
    ];

    private readonly defaultColorsForPens: number[] = [
        1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16, 1
    ];

    public constructor(penColors: string[], paperColors: string[]) {
        this.penColors = penColors;
        this.paperColors = paperColors;
        this.rsxHandler = new BasicVmRsxHandler(this);
        this.reset();
    }

    public static getCpcColors() {
        return BasicVmCore.cpcColors;
    }

    private static deleteAllItems(items: Record<string, unknown>): void {
        for (const name in items) {
            delete items[name];
        }
    }

    public reset(): void {
        this.colorsForPens.splice(0, this.colorsForPens.length, ...this.defaultColorsForPens);
        this.backgroundColor = "";
        this.mode(1);
        BasicVmCore.deleteAllItems(this.snippetData);
    }

    public cls(): void {
        this.output = "";
        this.isTag = false;
        this.currPaper = -1;
        this.currPen = -1;
        this.graphicsBuffer.length = 0;
        this.graphicsPathBuffer.length = 0;
        this.currGraphicsPen = -1;
        this.graphicsX = 0;
        this.graphicsY = 0;
    }

    public mode(num: number): void {
        this.currMode = num;
        this.cls();
        this.origin(0, 0);
    }

    // type: M | m | P | p | L | l
    public drawMovePlot(type: string, x: number, y: number): void {
        x = Math.round(x);
        y = Math.round(y);

        if (!this.graphicsPathBuffer.length && type !== "M" && type !== "P") { // path must start with an absolute move
            this.graphicsPathBuffer.push(`M${this.graphicsX + this.originX} ${399 - this.graphicsY - this.originY}`);
        }

        const isAbsolute = type === type.toUpperCase();
        if (isAbsolute) {
            this.graphicsX = x;
            this.graphicsY = y;
            x = this.graphicsX + this.originX;
            y = 399 - this.graphicsY - this.originY;
        } else {
            this.graphicsX += x;
            this.graphicsY += y;
            y = -y;
        }

        const svgPathCmd = (type === "P" || type === "p")
            ? `${isAbsolute ? "M" : "m"}${x} ${y}h1v1h-1v-1`
            : `${type}${x} ${y}`;

        this.graphicsPathBuffer.push(svgPathCmd);
    }

    public getGraphicsPen(): number {
        return this.currGraphicsPen;
    }

    public getRgbColorStringForPen(pen: number): string {
        return BasicVmCore.cpcColors[this.colorsForPens[pen]];
    }

    private flushGraphicsPath(): void {
        if (this.graphicsPathBuffer.length) {
            let strokeStr = "";
            if (this.currGraphicsPen >= 0) {
                strokeStr = `stroke="${this.getRgbColorStringForPen(this.currGraphicsPen)}" `;
            }
            this.graphicsBuffer.push(`<path ${strokeStr}d="${this.graphicsPathBuffer.join("")}" />`);
            this.graphicsPathBuffer.length = 0;
        }
    }

    public addGraphicsElement(element: string): void {
        this.flushGraphicsPath(); // maybe a path is open
        this.graphicsBuffer.push(element);
    }

    public static getTagInSvg(content: string, strokeWidth: string, backgroundColor: string) {
        const backgroundColorStr = backgroundColor !== "" ? ` style="background-color:${backgroundColor}"` : '';
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" shape-rendering="optimizeSpeed" stroke="currentColor" stroke-width="${strokeWidth}"${backgroundColorStr}>
${content}
</svg>
`;
    }

    public flushGraphics(): string {
        this.flushGraphicsPath();
        if (this.graphicsBuffer.length) {
            // separate print for svg graphics (we check in another module, if output starts with "<svg" to enable export SVG button)
            const graphicsBufferStr = this.graphicsBuffer.join("\n");
            const strokeWith = strokeWidthForMode[this.currMode] + "px";
            this.graphicsBuffer.length = 0;
            return BasicVmCore.getTagInSvg(graphicsBufferStr, strokeWith, this.backgroundColor);
        }
        return "";
    }

    public flushText(): string {
        const output = this.output;
        this.output = "";
        return output;
    }

    public graphicsPen(num: number): void {
        if (num === this.currGraphicsPen) {
            return;
        }
        this.flushGraphicsPath();
        this.currGraphicsPen = num;
    }

    public ink(num: number, col: number): void {
        this.colorsForPens[num] = col;
        // we modify inks, so set default pens and papers
        if (this.currGraphicsPen < 0) {
            this.graphicsPen(1);
        }

        if (this.currPen < 0) {
            this.pen(1);
        } else if (num === this.currPen) {
            this.currPen = -1;
            this.pen(num);
        }

        if (this.currPaper < 0) {
            this.paper(0);
        } else if (num === this.currPaper) {
            this.currPaper = -1;
            this.paper(num);
        }

        if (num === 0) {
            this.backgroundColor = this.getRgbColorStringForPen(0);
        }
    }

    public origin(x: number, y: number): void {
        this.originX = x;
        this.originY = y;
    }

    public paper(n: number): void {
        if (n !== this.currPaper) {
            if (n < 0 || n >= this.paperColors.length) {
                throw new Error("Invalid paper color index");
            }
            this.output += this.paperColors[this.colorsForPens[n]];
            this.currPaper = n;
        }
    }

    public pen(n: number): void {
        if (n !== this.currPen) {
            if (n < 0 || n >= this.penColors.length) {
                throw new Error("Invalid pen color index");
            }
            this.output += this.penColors[this.colorsForPens[n]];
            this.currPen = n;
        }
    }

    private printGraphicsText(text: string): void {
        const yOffset = 16;
        let styleStr = "";
        if (this.currGraphicsPen >= 0) {
            styleStr = ` style="color: ${this.getRgbColorStringForPen(this.currGraphicsPen)}"`;
        }
        this.addGraphicsElement(`<text x="${this.graphicsX + this.originX}" y="${399 - this.graphicsY - this.originY + yOffset}"${styleStr}>${text}</text>`)
    }

    public print(...args: string[]): void {
        const text = args.join('');
        if (this.isTag) {
            this.printGraphicsText(text);
        } else {
            this.output += text;
        }
    }

    public setOnSpeak(fnOnSpeak: (text: string, pitch: number) => Promise<void>) {
        this.rsxHandler.setOnSpeak(fnOnSpeak);
    }

    public async rsx(cmd: string, args: (number | string)[]): Promise<(number | string)[]> {
        return this.rsxHandler.rsx(cmd, args);
    }

    public tag(active: boolean): void {
        this.isTag = active;
    }

    public xpos(): number {
        return this.graphicsX;
    }

    public ypos(): number {
        return this.graphicsY;
    }

    public getSnippetData(): SnippetDataType {
        return this.snippetData;
    }

    public getOutput(): string {
        const output = this.output;
        return output;
    }
    public setOutput(str: string): void {
        this.output = str;
    }
}
