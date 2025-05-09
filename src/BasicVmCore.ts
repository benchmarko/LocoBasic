import type { TimerMapType } from "./Interfaces";

type RsxMapType = Record<string, {
    argTypes: string[];
    fn: (args: (number | string)[]) => Promise<(number | string)[]> | void;
}>;

const strokeWidthForMode: number[] = [4, 2, 1, 1];

export class BasicVmCore {
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
    private timerMap: TimerMapType = {};
    private pitch: number = 1;
    private fnOnSpeak: (text: string, pitch: number) => Promise<void> = () => Promise.resolve();

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
        this.reset();
    }

    public static getCpcColors() {
        return BasicVmCore.cpcColors;
    }

    private reset(): void {
        this.colorsForPens.splice(0, this.colorsForPens.length, ...this.defaultColorsForPens);
        this.backgroundColor = "";
        this.originX = 0;
        this.originY = 0;
        this.pitch = 1;
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

    private flushGraphicsPath(): void {
        if (this.graphicsPathBuffer.length) {
            let strokeStr = "";
            if (this.currGraphicsPen >= 0) {
                const color = BasicVmCore.cpcColors[this.colorsForPens[this.currGraphicsPen]];
                strokeStr = `stroke="${color}" `;
            }
            this.graphicsBuffer.push(`<path ${strokeStr}d="${this.graphicsPathBuffer.join("")}" />`);
            this.graphicsPathBuffer.length = 0;
        }
    }

    public flushGraphics(): string {
        this.flushGraphicsPath();
        if (this.graphicsBuffer.length) {
            // separate print for svg graphics
            // in another module, we check if output starts with "<svg" to enable export SVG button
            const backgroundColorStr = this.backgroundColor !== "" ? ` style="background-color:${this.backgroundColor}"` : '';
            const graphicsBufferStr = this.graphicsBuffer.join("\n");
            this.graphicsBuffer.length = 0;
            return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" stroke-width="${strokeWidthForMode[this.currMode]}px" shape-rendering="optimizeSpeed" stroke="currentColor"${backgroundColorStr}>\n${graphicsBufferStr}"\n</svg>\n`;
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
            this.backgroundColor = BasicVmCore.cpcColors[this.colorsForPens[0]];
        }
    }

    public mode(num: number): void {
        this.currMode = num;
        this.cls();
        this.origin(0, 0);
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
            const color = BasicVmCore.cpcColors[this.colorsForPens[this.currGraphicsPen]];
            styleStr = ` style="color: ${color}"`;
        }
        this.flushGraphicsPath(); // maybe a path is open
        this.graphicsBuffer.push(`<text x="${this.graphicsX + this.originX}" y="${399 - this.graphicsY - this.originY + yOffset}"${styleStr}>${text}</text>`);
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
        this.fnOnSpeak = fnOnSpeak;
    }

    private getStrokeAndFillStr(fill: number): string {
        const cpcColors = BasicVmCore.cpcColors;
        const strokeStr = this.currGraphicsPen >= 0 ? ` stroke="${cpcColors[this.colorsForPens[this.currGraphicsPen]]}"` : "";
        const fillStr = fill >= 0 ? ` fill="${cpcColors[this.colorsForPens[fill]]}"` : "";
        return `${strokeStr}${fillStr}`;
    }

    private rsxArc = (args: (number | string)[]) => { // bound this
        const [x, y, rx, ry, rotx, long, sweep, endx, endy, fill] = args.map((p) => Math.round(p as number));

        this.flushGraphicsPath(); // maybe a path is open
        const strokeAndFillStr = this.getStrokeAndFillStr(fill);
        const svgPathCmd = `M${x} ${399 - y} A${rx} ${ry} ${rotx} ${long} ${sweep} ${endx} ${399 - endy}`;
        this.graphicsBuffer.push(`<path d="${svgPathCmd}"${strokeAndFillStr} />`);
    }

    private rsxCircle = (args: (number | string)[]) => { // bound this
        const [cx, cy, r, fill] = args.map((p) => Math.round(p as number));

        const strokeAndFillStr = this.getStrokeAndFillStr(fill);
        this.flushGraphicsPath(); // maybe a path is open
        // if we want origin: x + this.originX, 399 - y - this.originY
        this.graphicsBuffer.push(`<circle cx="${cx}" cy="${399 - cy}" r="${r}"${strokeAndFillStr} />`);
    }

    // returns a date string in the format "ww DD MM YY" with ww=day of week
    // see https://www.cpcwiki.eu/imgs/b/b4/DXS_RTC_-_User_Manual.pdf
    private rsxDate = async (args: (number | string)[]) => { // bound this
        const date = new Date();
        // Get the day of the week (0-6) and convert to 1-7
        const dayOfWeek = (date.getDay() + 1) % 7;
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are zero-based
        const year = date.getFullYear() % 100; // Get last two digits of the year
        const dateStr = `${String(dayOfWeek).padStart(2, '0')} ${String(day).padStart(2, '0')} ${String(month).padStart(2, '0')} ${String(year).padStart(2, '0')}`;
        args[0] = dateStr;
        return Promise.resolve(args);
    }

    private rsxEllipse = (args: (number | string)[]) => { // bound this
        const [cx, cy, rx, ry, fill] = args.map((p) => Math.round(p as number));

        const strokeAndFillStr = this.getStrokeAndFillStr(fill);
        this.flushGraphicsPath();
        this.graphicsBuffer.push(`<ellipse cx="${cx}" cy="${399 - cy}" rx="${rx}" ry="${ry}"${strokeAndFillStr} />`);
    }

    private rsxRect = (args: (number | string)[]) => { // bound this
        const [x1, y1, x2, y2, fill] = args.map((p) => Math.round(p as number));

        const x = Math.min(x1, x2);
        const y = Math.max(y1, y2); // y is inverted
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);

        const strokeAndFillStr = this.getStrokeAndFillStr(fill);
        this.flushGraphicsPath();
        this.graphicsBuffer.push(`<rect x="${x}" y="${399 - y}" width="${width}" height="${height}"${strokeAndFillStr} />`);
    }

    private rsxPitch = (args: (number | string)[]) => { // bound this
        this.pitch = (args[0] as number) / 10; // 0..20 => 0..2
    }

    private rsxSay = async (args: (number | string)[]) => { // bound this
        const text = args[0] as string;
        return this.fnOnSpeak(text, this.pitch).then(() => args);
    }

    // returns a time string in the format "HH MM SS"
    // see https://www.cpcwiki.eu/imgs/b/b4/DXS_RTC_-_User_Manual.pdf
    private rsxTime = async (args: (number | string)[]) => { // bound this
        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const timeStr = `${String(hours).padStart(2, '0')} ${String(minutes).padStart(2, '0')} ${String(seconds).padStart(2, '0')}`;
        args[0] = timeStr;
        return Promise.resolve(args);
    }

    private rsxMap: RsxMapType = {
        arc: {
            argTypes: ["number", "number", "number", "number", "number", "number", "number", "number", "number", "number?"],
            fn: this.rsxArc
        },
        circle: {
            argTypes: ["number", "number", "number", "number?"],
            fn: this.rsxCircle
        },
        date: {
            argTypes: ["string"],
            fn: this.rsxDate
        },
        ellipse: {
            argTypes: ["number", "number", "number", "number", "number?"],
            fn: this.rsxEllipse
        },
        pitch: {
            argTypes: ["number"],
            fn: this.rsxPitch
        },
        rect: {
            argTypes: ["number", "number", "number", "number", "number?"],
            fn: this.rsxRect
        },
        say: {
            argTypes: ["string"],
            fn: this.rsxSay
        },
        time: {
            argTypes: ["string"],
            fn: this.rsxTime
        }
    }

    public async rsx(cmd: string, args: (number | string)[]): Promise<(number | string)[]> {
        if (!this.rsxMap[cmd]) {
            throw new Error(`Unknown RSX command: |${cmd.toUpperCase()}`);
        }
        const rsxInfo = this.rsxMap[cmd];
        const expectedArgs = rsxInfo.argTypes.length;

        const optionalArgs = rsxInfo.argTypes.filter((type) => type.endsWith("?")).length;
        if (args.length < expectedArgs - optionalArgs) {
            throw new Error(`|${cmd.toUpperCase()}: Wrong number of arguments: ${args.length} < ${expectedArgs - optionalArgs}`);
        }

        if (args.length > expectedArgs) {
            throw new Error(`|${cmd.toUpperCase()}: Wrong number of arguments: ${args.length} > ${expectedArgs}`);
        }

        for (let i = 0; i < args.length; i += 1) {
            const expectedType = rsxInfo.argTypes[i].replace("?", "");
            const arg = args[i];
            if (typeof arg !== expectedType) {
                throw new Error(`|${cmd.toUpperCase()}: Wrong argument type (pos ${i}): ${typeof arg}`);
            }
        }

        const result = rsxInfo.fn(args);
        if (result instanceof Promise) {
            return result;
        } else {
            return args;
        }
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

    public getTimerMap(): TimerMapType {
        return this.timerMap;
    }

    public getOutput(): string {
        const output = this.output;
        this.reset();
        return output;
    }
    public setOutput(str: string): void {
        this.output = str;
    }
}
