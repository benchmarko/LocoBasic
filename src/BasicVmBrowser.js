import { BasicVmCore } from "./BasicVmCore";
export class BasicVmBrowser {
    constructor(ui) {
        this.ui = ui;
        const cpcColors = BasicVmCore.getCpcColors();
        const penColors = cpcColors.map((color) => ui.getColor(color, false));
        const paperColors = cpcColors.map((color) => ui.getColor(color, true));
        this.vmCore = new BasicVmCore(penColors, paperColors);
        this.vmCore.setOnSpeak(this.fnOnSpeak.bind(this));
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
        this.ui.setOutputText("");
    }
    flush() {
        const textOutput = this.vmCore.flushText();
        if (textOutput) {
            this.ui.addOutputText(textOutput);
        }
        const graphicsOutput = this.vmCore.flushGraphics();
        if (graphicsOutput) {
            this.ui.addOutputText(graphicsOutput);
        }
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
    async fnOnSpeak(text, pitch) {
        return this.ui.speak(text, pitch);
    }
    getEscape() {
        return this.ui.getEscape();
    }
}
//# sourceMappingURL=BasicVmBrowser.js.map