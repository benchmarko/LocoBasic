import { BasicVmCore } from "./BasicVmCore";
function getAnsiColors(background) {
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
    return colorCodes.map((code) => `\x1b[${code + add}m`); // e.g. Navy: pen: "\x1b[34m" or paper: "\x1b[44m"
}
export class BasicVmNode {
    constructor(nodeParts) {
        this.nodeParts = nodeParts;
        const penColors = getAnsiColors(false);
        const paperColors = getAnsiColors(true);
        this.vmCore = new BasicVmCore(penColors, paperColors);
        this.reset = this.vmCore.reset.bind(this.vmCore);
        this.drawMovePlot = this.vmCore.drawMovePlot.bind(this.vmCore);
        this.graphicsPen = this.vmCore.graphicsPen.bind(this.vmCore);
        this.ink = this.vmCore.ink.bind(this.vmCore);
        this.origin = this.vmCore.origin.bind(this.vmCore);
        this.paper = this.vmCore.paper.bind(this.vmCore);
        this.pen = this.vmCore.pen.bind(this.vmCore);
        this.print = this.vmCore.print.bind(this.vmCore);
        this.printGraphicsText = this.vmCore.printGraphicsText.bind(this.vmCore);
        this.rsx = this.vmCore.rsx.bind(this.vmCore);
        this.xpos = this.vmCore.xpos.bind(this.vmCore);
        this.ypos = this.vmCore.ypos.bind(this.vmCore);
        this.getSnippetData = this.vmCore.getSnippetData.bind(this.vmCore);
        this.getOutput = this.vmCore.getOutput.bind(this.vmCore);
    }
    cls() {
        this.vmCore.cls();
        this.nodeParts.consoleClear();
    }
    flush() {
        const textOutput = this.vmCore.flushText();
        if (textOutput) {
            this.nodeParts.consolePrint(textOutput.replace(/\n$/, ""));
        }
        const graphicsOutput = this.vmCore.flushGraphics();
        if (graphicsOutput) {
            this.nodeParts.consolePrint(graphicsOutput.replace(/\n$/, ""));
        }
    }
    inkey$() {
        const key = this.nodeParts.getKeyFromBuffer();
        return Promise.resolve(key);
    }
    async fnOnInput(msg) {
        console.log(msg);
        return Promise.resolve("");
    }
    input(msg) {
        this.flush();
        return this.fnOnInput(msg);
    }
    mode(num) {
        this.vmCore.mode(num);
        this.nodeParts.consoleClear();
    }
    getEscape() {
        return this.nodeParts.getEscape();
    }
}
//# sourceMappingURL=BasicVmNode.js.map