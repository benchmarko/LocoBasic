// BasicVmCore.ts
const colorsForPens = [
    "#000080", "#FFFF00", "#00FFFF", "#FF0000", "#FFFFFF", "#000000", "#0000FF", "#FF00FF",
    "#008080", "#808000", "#8080FF", "#FF8080", "#00FF00", "#80FF80", "#000080", "#FF8080", "#000080"
];
const strokeWidthForMode = [4, 2, 1, 1];
export class BasicVmCore {
    constructor() {
        this.output = "";
        this.currPaper = -1;
        this.currPen = -1;
        this.currMode = 2;
        this.graphicsBuffer = [];
        this.graphicsPathBuffer = [];
        this.currGraphicsPen = 1;
        this.graphicsX = 0;
        this.graphicsY = 0;
    }
    fnOnCls() {
        // override
    }
    fnOnPrint(_msg) {
        // override
    }
    fnOnPrompt(_msg) {
        // override
        return "";
    }
    fnGetPenColor(_num) {
        // override
        return "";
    }
    fnGetPaperColor(_num) {
        // override
        return "";
    }
    getColorsForPens() {
        return colorsForPens;
    }
    cls() {
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
    drawMovePlot(type, x, y) {
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
        }
        else {
            this.graphicsX += x;
            this.graphicsY += y;
        }
    }
    flushGraphicsPath() {
        if (this.graphicsPathBuffer.length) {
            this.graphicsBuffer.push(`<path stroke="${colorsForPens[this.currGraphicsPen]}" d="${this.graphicsPathBuffer.join("")}" />`);
            this.graphicsPathBuffer.length = 0;
        }
    }
    flush() {
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
    graphicsPen(num) {
        if (num === this.currGraphicsPen) {
            return;
        }
        this.flushGraphicsPath();
        this.currGraphicsPen = num;
    }
    mode(num) {
        this.currMode = num;
        this.cls();
    }
    paper(n) {
        if (n !== this.currPaper) {
            this.output += this.fnGetPaperColor(n);
            this.currPaper = n;
        }
    }
    ;
    pen(n) {
        if (n !== this.currPen) {
            this.output += this.fnGetPenColor(n);
            this.currPen = n;
        }
    }
    print(...args) {
        this.output += args.join('');
    }
    prompt(msg) {
        this.flush();
        return this.fnOnPrompt(msg);
    }
    ;
    getOutput() {
        return this.output;
    }
    setOutput(str) {
        this.output = str;
    }
}
//# sourceMappingURL=BasicVmCore.js.map