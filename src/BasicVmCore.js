import { BasicVmRsxHandler } from "./BasicVmRsxHandler";
const strokeWidthForMode = [4, 2, 1, 1];
export class BasicVmCore {
    constructor(penColors, paperColors) {
        this.currMode = 2;
        this.graphicsBuffer = [];
        this.graphicsPathBuffer = [];
        this.currGraphicsPen = -1;
        this.originX = 0;
        this.originY = 0;
        this.graphicsX = 0;
        this.graphicsY = 0;
        this.colorsForPens = [];
        this.backgroundColor = "";
        this.snippetData = {};
        this.outputGraphicsIndex = -1;
        this.defaultColorsForPens = [
            1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16, 1
        ];
        this.penColors = penColors;
        this.paperColors = paperColors;
        this.rsxHandler = new BasicVmRsxHandler(this);
        this.reset();
    }
    static getCpcColors() {
        return BasicVmCore.cpcColors;
    }
    static deleteAllItems(items) {
        Object.keys(items).forEach(key => delete items[key]);
    }
    reset() {
        this.colorsForPens.splice(0, this.colorsForPens.length, ...this.defaultColorsForPens);
        BasicVmCore.deleteAllItems(this.snippetData);
        this.snippetData.output = "";
        this.backgroundColor = "";
        this.mode(1);
        this.cls();
    }
    cls() {
        this.graphicsBuffer.length = 0;
        this.graphicsPathBuffer.length = 0;
        this.currGraphicsPen = -1;
        this.graphicsX = 0;
        this.graphicsY = 0;
        this.outputGraphicsIndex = -1;
    }
    mode(num) {
        this.currMode = num;
        this.origin(0, 0);
    }
    setOutputGraphicsIndex() {
        if (this.outputGraphicsIndex < 0) {
            this.outputGraphicsIndex = this.getSnippetData().output.length;
        }
    }
    getOutputGraphicsIndex() {
        return this.outputGraphicsIndex;
    }
    // type: M | m | P | p | L | l
    drawMovePlot(type, x, y, pen) {
        this.setOutputGraphicsIndex();
        if (pen !== undefined) {
            this.graphicsPen(pen);
        }
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
        }
        else {
            this.graphicsX += x;
            this.graphicsY += y;
            y = -y;
        }
        const svgPathCmd = (type === "P" || type === "p")
            ? `${isAbsolute ? "M" : "m"}${x} ${y}h1v1h-1v-1`
            : `${type}${x} ${y}`;
        this.graphicsPathBuffer.push(svgPathCmd);
    }
    getGraphicsPen() {
        return this.currGraphicsPen;
    }
    getRgbColorStringForPen(pen) {
        return BasicVmCore.cpcColors[this.colorsForPens[pen]];
    }
    flushGraphicsPath() {
        if (this.graphicsPathBuffer.length) {
            const strokeStr = this.currGraphicsPen >= 0 ? `stroke="${this.getRgbColorStringForPen(this.currGraphicsPen)}" ` : "";
            this.graphicsBuffer.push(`<path ${strokeStr}d="${this.graphicsPathBuffer.join("")}" />`);
            this.graphicsPathBuffer.length = 0;
        }
    }
    addGraphicsElement(element) {
        this.setOutputGraphicsIndex();
        this.flushGraphicsPath(); // maybe a path is open
        this.graphicsBuffer.push(element);
    }
    static getTagInSvg(content, strokeWidth, backgroundColor) {
        const backgroundColorStr = backgroundColor !== "" ? ` style="background-color:${backgroundColor}"` : '';
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" shape-rendering="optimizeSpeed" stroke="currentColor" stroke-width="${strokeWidth}"${backgroundColorStr}>
${content}
</svg>
`;
    }
    flushGraphics() {
        this.flushGraphicsPath();
        if (this.graphicsBuffer.length) {
            const graphicsBufferStr = this.graphicsBuffer.join("\n");
            const strokeWith = strokeWidthForMode[this.currMode] + "px";
            this.graphicsBuffer.length = 0;
            return BasicVmCore.getTagInSvg(graphicsBufferStr, strokeWith, this.backgroundColor);
        }
        return "";
    }
    flushText() {
        const snippetData = this.getSnippetData();
        const output = snippetData.output; // text output
        snippetData.output = "";
        return output;
    }
    graphicsPen(num) {
        if (num !== this.currGraphicsPen) {
            this.flushGraphicsPath();
            this.currGraphicsPen = num;
        }
    }
    ink(num, col) {
        this.colorsForPens[num] = col;
        // we modify inks, so set default pens and papers
        if (this.currGraphicsPen < 0) {
            this.graphicsPen(1);
        }
        if (num === 0) {
            this.backgroundColor = this.getRgbColorStringForPen(0);
        }
    }
    origin(x, y) {
        this.originX = x;
        this.originY = y;
    }
    getColorForPen(n, isPaper) {
        return isPaper ? this.paperColors[this.colorsForPens[n]] : this.penColors[this.colorsForPens[n]];
    }
    printGraphicsText(text) {
        const yOffset = 16;
        const colorStyleStr = this.currGraphicsPen >= 0 ? `; color: ${this.getRgbColorStringForPen(this.currGraphicsPen)}` : "";
        this.addGraphicsElement(`<text x="${this.graphicsX + this.originX}" y="${399 - this.graphicsY - this.originY + yOffset}" style="white-space: pre${colorStyleStr}">${text}</text>`);
        this.graphicsX += text.length * 8; // assuming 8px width per character
    }
    setOnSpeak(fnOnSpeak) {
        this.rsxHandler.setOnSpeak(fnOnSpeak);
    }
    async rsx(cmd, args) {
        return this.rsxHandler.rsx(cmd, args);
    }
    xpos() {
        return this.graphicsX;
    }
    ypos() {
        return this.graphicsY;
    }
    getSnippetData() {
        return this.snippetData;
    }
}
BasicVmCore.cpcColors = [
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
//# sourceMappingURL=BasicVmCore.js.map