import type { IVmAdmin, TimerMapType } from "./Interfaces";

type RsxMapType = Record<string, {
    argTypes: string[];
    fn: (args: (number | string)[]) => Promise<(number | string)[]> | void;
}>;

const strokeWidthForMode: number[] = [4, 2, 1, 1];

export class BasicVmCore implements IVmAdmin {
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
    private graphicsY: number = 399;
    protected colorsForPens: number[] = [];
    private backgroundColor = "";
    private isTag: boolean = false; // text at graphics
    private timerMap: TimerMapType = {};
    private pitch: number = 1;

    protected readonly cpcColors = [
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

    protected readonly defaultColorsForPens: number[] = [
        1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16, 1
    ];

    public constructor() {
        this.reset();
    }

    protected fnOnCls(): void {
        // override
    }

    protected async fnOnInput(_msg: string): Promise<string | null> { // eslint-disable-line @typescript-eslint/no-unused-vars
        // override
        return "";
    }

    protected fnOnPrint(_msg: string): void { // eslint-disable-line @typescript-eslint/no-unused-vars
        // override
    }

    protected fnGetPenColor(_num: number): string { // eslint-disable-line @typescript-eslint/no-unused-vars
        // override
        return "";
    }

    protected fnGetPaperColor(_num: number): string { // eslint-disable-line @typescript-eslint/no-unused-vars
        // override
        return "";
    }

    protected fnOnSpeak(_text: string, _pitch: number): Promise<void> {  // eslint-disable-line @typescript-eslint/no-unused-vars
        // override
        return Promise.resolve();
    }

    private reset(): void {
        this.colorsForPens = [...this.defaultColorsForPens];
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
        this.fnOnCls();
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
                const color = this.cpcColors[this.colorsForPens[this.currGraphicsPen]];
                strokeStr = `stroke="${color}" `;
            }
            this.graphicsBuffer.push(`<path ${strokeStr}d="${this.graphicsPathBuffer.join("")}" />`);
            this.graphicsPathBuffer.length = 0;
        }
    }

    public flush(): void {
        this.flushGraphicsPath();
        if (this.output) {
            this.fnOnPrint(this.output);
            this.output = "";
        }
        if (this.graphicsBuffer.length) {
            // separate print for svg graphics (we are checking for output starting with svg to enable export SVG button)ays 0
            const backgroundColorStr = this.backgroundColor !== "" ? ` style="background-color:${this.backgroundColor}"` : '';
            this.fnOnPrint(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" stroke-width="${strokeWidthForMode[this.currMode]}px" shape-rendering="optimizeSpeed" stroke="currentColor"${backgroundColorStr}>\n${this.graphicsBuffer.join("\n")}"\n</svg>\n`);
            this.graphicsBuffer.length = 0;
        }
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
            this.backgroundColor = this.cpcColors[this.colorsForPens[0]];
        }
    }

    public inkey$(): Promise<string> {
        return Promise.resolve("");
    }

    public input(msg: string): Promise<string | null> {
        this.flush();
        return this.fnOnInput(msg);
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
            this.output += this.fnGetPaperColor(this.colorsForPens[n]);
            this.currPaper = n;
        }
    }

    public pen(n: number): void {
        if (n !== this.currPen) {
            this.output += this.fnGetPenColor(this.colorsForPens[n]);
            this.currPen = n;
        }
    }

    private printGraphicsText(text: string): void {
        const yOffset = 16;
        let styleStr = "";
        if (this.currGraphicsPen >= 0) {
            const color = this.cpcColors[this.colorsForPens[this.currGraphicsPen]];
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


    private rsxCircle(args: (number | string)[]) {
        const [x, y, radius] = args.map((p) => Math.round(p as number));
        let strokeStr = "";
        if (this.currGraphicsPen >= 0) {
            const color = this.cpcColors[this.colorsForPens[this.currGraphicsPen]];
            strokeStr = ` stroke="${color}"`;
        }
        this.flushGraphicsPath(); // maybe a path is open
        // if we want origin: x + this.originX, 399 - y - this.originY
        this.graphicsBuffer.push(`<circle cx="${x}" cy="${399 - y}" r="${radius}"${strokeStr} />`);
    }

    // returns a date string in the format "ww DD MM YY" with ww=day of week
    // see https://www.cpcwiki.eu/imgs/b/b4/DXS_RTC_-_User_Manual.pdf
    private async rsxDate(args: (number | string)[]) {
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

    private rsxRect(args: (number | string)[]) {
        // Extract and round arguments
        const [x1, y1, x2, y2] = args.map((p) => Math.round(p as number));
    
        // Calculate position and dimensions
        const x = Math.min(x1, x2);
        const y = Math.max(y1, y2); // y is inverted
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
    
        // Determine stroke color if a pen is active
        const strokeStr = this.currGraphicsPen >= 0 ? ` stroke="${this.cpcColors[this.colorsForPens[this.currGraphicsPen]]}"` : "";
    
        // Flush any open graphics path
        this.flushGraphicsPath();
    
        // Add the rectangle to the graphics buffer
        this.graphicsBuffer.push(`<rect x="${x}" y="${399 - y}" width="${width}" height="${height}"${strokeStr} />`);
    }

    private rsxPitch(args: (number | string)[]) {
        this.pitch = (args[0] as number) / 10; // 0..20 => 0..2
    }

    private async rsxSay(args: (number | string)[]) {
        const text = args[0] as string;
        return this.fnOnSpeak(text, this.pitch).then(() => args);
    }

    // returns a time string in the format "HH MM SS"
    // see https://www.cpcwiki.eu/imgs/b/b4/DXS_RTC_-_User_Manual.pdf
    private async rsxTime(args: (number | string)[]) {
        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const timeStr = `${String(hours).padStart(2, '0')} ${String(minutes).padStart(2, '0')} ${String(seconds).padStart(2, '0')}`;
        args[0] = timeStr;
        return Promise.resolve(args);
    }

    private rsxMap: RsxMapType = {
        circle: {
            argTypes: ["number", "number", "number"],
            fn: this.rsxCircle.bind(this)
        },
        date: {
            argTypes: ["string"],
            fn: this.rsxDate.bind(this)
        },
        pitch: {
            argTypes: ["number"],
            fn: this.rsxPitch.bind(this)
        },
        rect: {
            argTypes: ["number", "number", "number", "number"],
            fn: this.rsxRect.bind(this)
        },
        say: {
            argTypes: ["string"],
            fn: this.rsxSay.bind(this)
        },
        time: {
            argTypes: ["string"],
            fn: this.rsxTime.bind(this)
        }
    }

    public async rsx(cmd: string, args: (number | string)[]): Promise<(number | string)[]> {
        if (!this.rsxMap[cmd]) {
            throw new Error(`Unknown RSX command: |${cmd.toUpperCase()}`);
        }
        const rsxInfo = this.rsxMap[cmd];
        const expectedArgs = rsxInfo.argTypes.length;

        if (args.length !== expectedArgs) {
            throw new Error(`|${cmd.toUpperCase()}: Wrong number of arguments: ${args.length} <> ${expectedArgs}`);
        }

        for (let i = 0; i < args.length; i += 1) {
            const expectedType = rsxInfo.argTypes[i];
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

    public getEscape(): boolean {
        return false;
    }

    public getTimerMap(): TimerMapType {
        return this.timerMap;
    }

    public getOutput(): string {
        this.reset();
        return this.output;
    }
    public setOutput(str: string): void {
        this.output = str;
    }
}
