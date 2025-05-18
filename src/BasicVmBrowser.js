import { BasicVmCore } from "./BasicVmCore";
export class BasicVmBrowser {
    constructor(ui) {
        this.ui = ui;
        const cpcColors = BasicVmCore.getCpcColors();
        const penColors = cpcColors.map((color) => ui.getColor(color, false));
        const paperColors = cpcColors.map((color) => ui.getColor(color, true));
        this.vmCore = new BasicVmCore(penColors, paperColors);
        this.vmCore.setOnSpeak(this.fnOnSpeak.bind(this));
    }
    reset() {
        this.vmCore.reset();
    }
    cls() {
        this.vmCore.cls();
        this.ui.setOutputText("");
    }
    drawMovePlot(type, x, y) {
        this.vmCore.drawMovePlot(type, x, y);
    }
    fnOnPrint(msg) {
        this.ui.addOutputText(msg);
    }
    flush() {
        const textOutput = this.vmCore.flushText();
        if (textOutput) {
            this.fnOnPrint(textOutput);
        }
        const graphicsOutput = this.vmCore.flushGraphics();
        if (graphicsOutput) {
            this.fnOnPrint(graphicsOutput);
        }
    }
    graphicsPen(num) {
        this.vmCore.graphicsPen(num);
    }
    ink(num, col) {
        this.vmCore.ink(num, col);
    }
    inkey$() {
        const key = this.ui.getKeyFromBuffer();
        return Promise.resolve(key);
    }
    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    async fnOnInput(msg) {
        const input = this.ui.prompt(msg);
        return Promise.resolve(input);
    }
    input(msg) {
        this.flush();
        return this.fnOnInput(msg);
    }
    mode(num) {
        this.vmCore.mode(num);
        this.ui.setOutputText("");
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
    async fnOnSpeak(text, pitch) {
        return this.ui.speak(text, pitch);
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
        return this.ui.getEscape();
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
//# sourceMappingURL=BasicVmBrowser.js.map