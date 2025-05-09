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
    }
    cls() {
        this.vmCore.cls();
        console.clear();
    }
    drawMovePlot(type, x, y) {
        this.vmCore.drawMovePlot(type, x, y);
    }
    static fnOnPrint(msg) {
        console.log(msg.replace(/\n$/, ""));
    }
    flush() {
        const textOutput = this.vmCore.flushText();
        if (textOutput) {
            BasicVmNode.fnOnPrint(textOutput);
        }
        const graphicsOutput = this.vmCore.flushGraphics();
        if (graphicsOutput) {
            BasicVmNode.fnOnPrint(graphicsOutput);
        }
    }
    graphicsPen(num) {
        this.vmCore.graphicsPen(num);
    }
    ink(num, col) {
        this.vmCore.ink(num, col);
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
    }
    origin(x, y) {
        this.vmCore.origin(x, y);
    }
    paper(n) {
        this.vmCore.paper(n);
    }
    pen(n) {
        this.vmCore.pen(n);
    }
    print(...args) {
        this.vmCore.print(...args);
    }
    async rsx(cmd, args) {
        return this.vmCore.rsx(cmd, args);
    }
    tag(active) {
        this.vmCore.tag(active);
    }
    xpos() {
        return this.vmCore.xpos();
    }
    ypos() {
        return this.vmCore.ypos();
    }
    getEscape() {
        return this.nodeParts.getEscape();
    }
    getTimerMap() {
        return this.vmCore.getTimerMap();
    }
    getOutput() {
        return this.vmCore.getOutput();
    }
    setOutput(str) {
        this.vmCore.setOutput(str);
    }
}
//# sourceMappingURL=BasicVmNode.js.map