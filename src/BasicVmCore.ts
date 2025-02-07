import type { IVmAdmin } from "./Interfaces";

const colorsForPens: string[] = [
    "#000080", "#FFFF00", "#00FFFF", "#FF0000", "#FFFFFF", "#000000", "#0000FF", "#FF00FF",
    "#008080", "#808000", "#8080FF", "#FF8080", "#00FF00", "#80FF80", "#000080", "#FF8080", "#000080"
];
  
const strokeWidthForMode: number[] = [4, 2, 1, 1];

export class BasicVmCore implements IVmAdmin {
    private output: string = "";
    private currPaper: number = -1;
    private currPen: number = -1;
    private currMode: number = 2;
    private readonly graphicsBuffer: string[] = [];
    private readonly graphicsPathBuffer: string[] = [];
    private currGraphicsPen: number = 1;
    private graphicsX: number = 0;
    private graphicsY: number = 0;

    protected fnOnCls(): void {
        // override
    }

    protected fnOnPrint(_msg: string): void { // eslint-disable-line @typescript-eslint/no-unused-vars
        // override
    }

    protected fnOnPrompt(_msg: string): string | null { // eslint-disable-line @typescript-eslint/no-unused-vars
        // override
        return "";
    }

    protected fnGetPenColor(_num: number): string { // eslint-disable-line @typescript-eslint/no-unused-vars
        // override
        return "";
    }

    protected fnGetPaperColor(_num: number): string { // eslint-disable-line @typescript-eslint/no-unused-vars
        // override
        return "";
    }

    protected getColorsForPens(): string[] {
        return colorsForPens;
    }

    public cls(): void {
        this.output = "";
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
	
		const isAbsolute = type === type.toUpperCase();
			y = isAbsolute ? 399 - y : -y;

		const isPlot = type.toLowerCase() === "p";
		const svgPathCmd = isPlot
            ? `${isAbsolute ? "M" : "m"}${x} ${y}h1v1h-1v-1`
            : `${type}${x} ${y}`;
	
		if (!this.graphicsPathBuffer.length && svgPathCmd[0].toLowerCase() !== "m") {
			this.graphicsPathBuffer.push(`M${this.graphicsX} ${this.graphicsY}`);
		}
		this.graphicsPathBuffer.push(svgPathCmd);

		if (isAbsolute) {
			this.graphicsX = x;
			this.graphicsY = y;
		} else {
			this.graphicsX += x;
			this.graphicsY += y;
		}
	}

    private flushGraphicsPath(): void {
        if (this.graphicsPathBuffer.length) {
            this.graphicsBuffer.push(`<path stroke="${colorsForPens[this.currGraphicsPen]}" d="${this.graphicsPathBuffer.join("")}" />`);
            this.graphicsPathBuffer.length = 0;
        }
    }

    public flush(): void {
        this.flushGraphicsPath();
        if (this.graphicsBuffer.length) {
            this.output += `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" stroke-width="${strokeWidthForMode[this.currMode]}px" stroke="currentColor">\n${this.graphicsBuffer.join("\n")}"\n</svg>\n`;
            this.graphicsBuffer.length = 0;
        }
        if (this.output) {
            this.fnOnPrint(this.output);
            this.output = "";
        }
    }

    public graphicsPen(num: number): void {
        if (num === this.currGraphicsPen) {
            return;
        }
        this.flushGraphicsPath();
        this.currGraphicsPen = num;
    }

    public mode(num: number): void {
        this.currMode = num;
        this.cls();
    }

    public paper(n: number): void {
        if (n !== this.currPaper) {
            this.output += this.fnGetPaperColor(n);
            this.currPaper = n;
        }
    };

    public pen(n: number): void {
        if (n !== this.currPen) {
            this.output += this.fnGetPenColor(n);
            this.currPen = n;
        }
    }

    public print(...args: string[]): void {
        this.output += args.join('');
    }

    public prompt(msg: string): string | null {
        this.flush();
        return this.fnOnPrompt(msg);
    };

    public getOutput(): string {
		return this.output;
	}
    public setOutput(str: string): void {
		this.output = str;
	}
}
