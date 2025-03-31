const strokeWidthForMode = [4, 2, 1, 1];
export class BasicVmCore {
    constructor() {
        this.output = "";
        this.currPaper = -1;
        this.currPen = -1;
        this.currMode = 2;
        this.graphicsBuffer = [];
        this.graphicsPathBuffer = [];
        this.currGraphicsPen = -1;
        this.originX = 0;
        this.originY = 0;
        this.graphicsX = 0;
        this.graphicsY = 399;
        this.colorsForPens = [];
        this.backgroundColor = "";
        this.isTag = false; // text at graphics
        this.cpcColors = [
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
        this.defaultColorsForPens = [
            1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16, 1
        ];
        this.resetColors();
    }
    fnOnCls() {
        // override
    }
    async fnOnInput(_msg) {
        // override
        return "";
    }
    fnOnPrint(_msg) {
        // override
    }
    fnGetPenColor(_num) {
        // override
        return "";
    }
    fnGetPaperColor(_num) {
        // override
        return "";
    }
    resetColors() {
        this.colorsForPens = [...this.defaultColorsForPens];
        this.backgroundColor = "";
        this.originX = 0;
        this.originY = 0;
    }
    cls() {
        this.output = "";
        this.isTag = false;
        this.currPaper = -1;
        this.currPen = -1;
        this.graphicsBuffer.length = 0;
        this.graphicsPathBuffer.length = 0;
        this.currGraphicsPen = -1;
        this.graphicsX = 0;
        this.graphicsY = 399;
        this.fnOnCls();
    }
    drawMovePlot(type, x, y) {
        x = Math.round(x);
        y = Math.round(y);
        const isAbsolute = type === type.toUpperCase();
        x = isAbsolute ? x + this.originX : x;
        y = isAbsolute ? 399 - y - this.originY : -y;
        const isPlot = type.toLowerCase() === "p";
        const svgPathCmd = isPlot
            ? `${isAbsolute ? "M" : "m"}${x} ${y}h1v1h-1v-1`
            : `${type}${x} ${y}`;
        if (!this.graphicsPathBuffer.length && svgPathCmd[0] !== "M") { // path must start with a absolute move
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
            let strokeStr = "";
            if (this.currGraphicsPen > 0) {
                const color = this.cpcColors[this.colorsForPens[this.currGraphicsPen]];
                strokeStr = `stroke="${color}" `;
            }
            this.graphicsBuffer.push(`<path ${strokeStr}d="${this.graphicsPathBuffer.join("")}" />`);
            this.graphicsPathBuffer.length = 0;
        }
    }
    flush() {
        this.flushGraphicsPath();
        if (this.output) {
            this.fnOnPrint(this.output);
            this.output = "";
        }
        if (this.graphicsBuffer.length) {
            // separate print for svg graphics (we are checking for output starting with svg to enable export SVG button)ays 0
            const backgroundColorStr = this.backgroundColor !== "" ? ` style="background-color:${this.backgroundColor}"` : '';
            this.fnOnPrint(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" stroke-width="${strokeWidthForMode[this.currMode]}px" stroke="currentColor"${backgroundColorStr}>\n${this.graphicsBuffer.join("\n")}"\n</svg>\n`);
            this.graphicsBuffer.length = 0;
        }
    }
    graphicsPen(num) {
        if (num === this.currGraphicsPen) {
            return;
        }
        this.flushGraphicsPath();
        this.currGraphicsPen = num;
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
            this.backgroundColor = this.cpcColors[this.colorsForPens[0]];
        }
    }
    inkey$() {
        return Promise.resolve("");
    }
    input(msg) {
        this.flush();
        return this.fnOnInput(msg);
    }
    mode(num) {
        this.currMode = num;
        this.cls();
    }
    origin(x, y) {
        this.originX = x;
        this.originY = y;
    }
    paper(n) {
        if (n !== this.currPaper) {
            this.output += this.fnGetPaperColor(this.colorsForPens[n]);
            this.currPaper = n;
        }
    }
    pen(n) {
        if (n !== this.currPen) {
            this.output += this.fnGetPenColor(this.colorsForPens[n]);
            this.currPen = n;
        }
    }
    printGraphicsText(text) {
        const yOffset = 16;
        let styleStr = "";
        if (this.currGraphicsPen >= 0) { // TTT or >?
            const color = this.cpcColors[this.colorsForPens[this.currGraphicsPen]];
            styleStr = ` style="color: ${color}"`;
        }
        this.flushGraphicsPath(); // maybe a path is open
        this.graphicsBuffer.push(`<text x="${this.graphicsX}" y="${this.graphicsY + yOffset}"${styleStr}>${text}</text>`);
    }
    print(...args) {
        const text = args.join('');
        if (this.isTag) {
            this.printGraphicsText(text);
        }
        else {
            this.output += text;
        }
    }
    static getRsxNumArgs(args, count) {
        if (args.length !== count) {
            console.warn(`getRsxNumArgs: Wrong number of arguments. Expected ${count}, got ${args.length}`);
        }
        // pad with 0 if less than count
        return Array.from({ length: count }, (_, i) => {
            const p = args[i];
            return typeof p === "number" ? Math.round(p) : 0;
        });
    }
    rsxCircle(args) {
        const [x, y, radius] = BasicVmCore.getRsxNumArgs(args, 3);
        let strokeStr = "";
        if (this.currGraphicsPen >= 0) { // TTT or >?
            const color = this.cpcColors[this.colorsForPens[this.currGraphicsPen]];
            strokeStr = ` stroke="${color}"`;
        }
        this.flushGraphicsPath(); // maybe a path is open
        // if we want origin: x + this.originX, 399 - y - this.originY
        this.graphicsBuffer.push(`<circle cx="${x}" cy="${399 - y}" r="${radius}"${strokeStr} />`);
    }
    rsxRect(args) {
        // Extract and round arguments
        const [x1, y1, x2, y2] = BasicVmCore.getRsxNumArgs(args, 4);
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
    rsx(cmd, args) {
        if (cmd === "circle") {
            this.rsxCircle(args);
        }
        else if (cmd === "rect") {
            this.rsxRect(args);
        }
        else {
            throw new Error(`Unknown RSX command: |${cmd}`);
        }
    }
    tag(active) {
        this.isTag = active;
    }
    getEscape() {
        return false;
    }
    getOutput() {
        this.resetColors();
        return this.output;
    }
    setOutput(str) {
        this.output = str;
    }
}
//# sourceMappingURL=BasicVmCore.js.map