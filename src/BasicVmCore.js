import { BasicVmRsxHandler } from "./BasicVmRsxHandler";
import { CommaOpChar, TabOpChar } from "./Semantics";
const strokeWidthForMode = [4, 2, 1, 1];
export class BasicVmCore {
    constructor(penColors, paperColors) {
        this.output = "";
        this.currPaper = -1;
        this.currPen = -1;
        this.hasPaperChanged = false;
        this.hasPenChanged = false;
        this.currMode = 2;
        this.currPos = 0;
        this.currVpos = 0;
        this.currZone = 13; // comma tab zone value
        this.graphicsBuffer = [];
        this.graphicsPathBuffer = [];
        this.currGraphicsPen = -1;
        this.originX = 0;
        this.originY = 0;
        this.graphicsX = 0;
        this.graphicsY = 0;
        this.colorsForPens = [];
        this.backgroundColor = "";
        this.isTag = false; // text at graphics
        this.snippetData = {};
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
        this.backgroundColor = "";
        this.mode(1);
        BasicVmCore.deleteAllItems(this.snippetData);
    }
    cls() {
        this.output = "";
        this.currPos = 0;
        this.currVpos = 0;
        this.currZone = 13;
        this.isTag = false;
        this.currPaper = -1;
        this.currPen = -1;
        this.hasPaperChanged = false;
        this.hasPenChanged = false;
        this.graphicsBuffer.length = 0;
        this.graphicsPathBuffer.length = 0;
        this.currGraphicsPen = -1;
        this.graphicsX = 0;
        this.graphicsY = 0;
    }
    mode(num) {
        this.currMode = num;
        this.cls();
        this.origin(0, 0);
    }
    // type: M | m | P | p | L | l
    drawMovePlot(type, x, y) {
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
            // separate print for svg graphics (we check in another module, if output starts with "<svg" to enable export SVG button)
            const graphicsBufferStr = this.graphicsBuffer.join("\n");
            const strokeWith = strokeWidthForMode[this.currMode] + "px";
            this.graphicsBuffer.length = 0;
            return BasicVmCore.getTagInSvg(graphicsBufferStr, strokeWith, this.backgroundColor);
        }
        return "";
    }
    flushText() {
        const output = this.output;
        this.output = "";
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
        if (this.currPen < 0) {
            this.pen(1);
        }
        else if (num === this.currPen) {
            this.currPen = -1;
            this.pen(num);
        }
        if (this.currPaper < 0) {
            this.paper(0);
        }
        else if (num === this.currPaper) {
            this.currPaper = -1;
            this.paper(num);
        }
        if (num === 0) {
            this.backgroundColor = this.getRgbColorStringForPen(0);
        }
    }
    origin(x, y) {
        this.originX = x;
        this.originY = y;
    }
    paper(n) {
        if (n !== this.currPaper) {
            if (n < 0 || n >= this.paperColors.length) {
                throw new Error("Invalid paper color index");
            }
            this.currPaper = n;
            this.hasPaperChanged = true;
        }
    }
    pen(n) {
        if (n !== this.currPen) {
            if (n < 0 || n >= this.penColors.length) {
                throw new Error("Invalid pen color index");
            }
            this.currPen = n;
            this.hasPenChanged = true;
        }
    }
    pos() {
        return this.currPos;
    }
    printGraphicsText(text) {
        const yOffset = 16;
        const styleStr = this.currGraphicsPen >= 0 ? ` style="color: ${this.getRgbColorStringForPen(this.currGraphicsPen)}"` : "";
        this.addGraphicsElement(`<text x="${this.graphicsX + this.originX}" y="${399 - this.graphicsY - this.originY + yOffset}"${styleStr}>${text}</text>`);
    }
    printText(text) {
        this.output += text;
        const lines = text.split("\n");
        if (lines.length > 1) {
            this.currVpos += lines.length - 1;
            this.currPos = lines[lines.length - 1].length;
        }
        else {
            this.currPos += text.length;
        }
    }
    print(...args) {
        if (this.isTag) {
            return this.printGraphicsText(args.join(''));
        }
        if (this.hasPaperChanged) {
            this.hasPaperChanged = false;
            this.output += this.paperColors[this.colorsForPens[this.currPaper]];
        }
        if (this.hasPenChanged) {
            this.hasPenChanged = false;
            this.output += this.penColors[this.colorsForPens[this.currPen]];
        }
        for (const text of args) {
            if (text === CommaOpChar) {
                this.printText(" ".repeat(this.currZone - (this.currPos % this.currZone)));
            }
            else if (text.charAt(0) === TabOpChar) {
                this.printText(" ".repeat(Number(text.substring(1)) - 1 - this.currPos));
            }
            else {
                this.printText(text);
            }
        }
    }
    setOnSpeak(fnOnSpeak) {
        this.rsxHandler.setOnSpeak(fnOnSpeak);
    }
    async rsx(cmd, args) {
        return this.rsxHandler.rsx(cmd, args);
    }
    tag(active) {
        this.isTag = active;
    }
    vpos() {
        return this.currVpos;
    }
    xpos() {
        return this.graphicsX;
    }
    ypos() {
        return this.graphicsY;
    }
    zone(num) {
        this.currZone = num;
    }
    getSnippetData() {
        return this.snippetData;
    }
    getOutput() {
        const output = this.output;
        return output;
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