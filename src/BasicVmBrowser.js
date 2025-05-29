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
        this.printGraphicsText = this.vmCore.printGraphicsText.bind(this.vmCore);
        this.rsx = this.vmCore.rsx.bind(this.vmCore);
        this.xpos = this.vmCore.xpos.bind(this.vmCore);
        this.ypos = this.vmCore.ypos.bind(this.vmCore);
        this.getSnippetData = this.vmCore.getSnippetData.bind(this.vmCore);
        this.getColorForPen = this.vmCore.getColorForPen.bind(this.vmCore);
    }
    cls() {
        this.vmCore.cls();
        this.ui.setOutputText("");
    }
    escapeText(str, _isGraphics) {
        // for a browser, we need to escape text and graphics text
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    }
    flush() {
        const textOutput = this.vmCore.flushText();
        const graphicsOutput = this.vmCore.flushGraphics();
        const outputGraphicsIndex = this.vmCore.getOutputGraphicsIndex();
        const hasGraphics = outputGraphicsIndex >= 0;
        const output = hasGraphics ? textOutput.substring(0, outputGraphicsIndex) + graphicsOutput + textOutput.substring(outputGraphicsIndex) : textOutput;
        if (output !== "") {
            this.ui.addOutputText(output, hasGraphics);
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
        //this.ui.setOutputText("");
    }
    async fnOnSpeak(text, pitch) {
        return this.ui.speak(text, pitch);
    }
    getEscape() {
        return this.ui.getEscape();
    }
}
//# sourceMappingURL=BasicVmBrowser.js.map