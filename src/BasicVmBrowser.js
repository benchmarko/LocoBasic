import { BasicVmCore } from "./BasicVmCore";
export class BasicVmBrowser {
    constructor(ui) {
        this.ui = ui;
        this.vmCore = new BasicVmCore();
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
        await new Promise(resolve => setTimeout(resolve, 50)); // 50 ms delay to allow UI to update
        const input = this.ui.prompt(msg);
        return Promise.resolve(input);
    }
    async input(msg) {
        this.flush();
        return this.fnOnInput(msg);
    }
    keyDef(num, repeat, ...codes) {
        if (num === 78 && repeat === 1) {
            this.ui.setUiKeys(codes);
        }
    }
    mode(num) {
        this.vmCore.mode(num);
    }
    // Use a virtual stack to handle paper and pen spans
    paper(n) {
        const snippetData = this.vmCore.getSnippetData();
        if (n !== snippetData.paperValue) {
            // close open paper first
            if (snippetData.paperSpanPos >= 0) {
                if (snippetData.penSpanPos > snippetData.paperSpanPos) { // if pen inside paper is open, close it
                    snippetData.output += "</span>";
                    snippetData.penSpanPos = -1;
                }
                snippetData.output += "</span>";
                snippetData.paperSpanPos = -1;
            }
            // Open new paper span
            snippetData.paperValue = n;
            snippetData.paperSpanPos = snippetData.penSpanPos + 1;
            const cpcColors = BasicVmCore.getCpcColors();
            snippetData.output += `<span style="background-color: ${cpcColors[this.vmCore.getColorForPen(n)]}">`;
            // If pen was open before, reopen it inside
            if (snippetData.penValue >= 0 && snippetData.penSpanPos === -1) {
                snippetData.penSpanPos = snippetData.paperSpanPos + 1;
                snippetData.output += `<span style="color: ${cpcColors[this.vmCore.getColorForPen(snippetData.penValue)]}">`;
            }
        }
    }
    pen(n) {
        const snippetData = this.vmCore.getSnippetData();
        if (n !== snippetData.penValue) {
            // close open pen first
            if (snippetData.penSpanPos >= 0) {
                if (snippetData.paperSpanPos > snippetData.penSpanPos) { // if paper inside pen is open, close it
                    snippetData.output += "</span>";
                    snippetData.paperSpanPos = -1;
                }
                snippetData.output += "</span>";
                snippetData.penSpanPos = -1;
            }
            // Open new pen span
            snippetData.penValue = n;
            snippetData.penSpanPos = snippetData.paperSpanPos + 1;
            const cpcColors = BasicVmCore.getCpcColors();
            snippetData.output += `<span style="color: ${cpcColors[this.vmCore.getColorForPen(n)]}">`;
            // If paper was open before, reopen it inside
            if (snippetData.paperValue >= 0 && snippetData.paperSpanPos === -1) {
                snippetData.paperSpanPos = snippetData.penSpanPos + 1;
                snippetData.output += `<span style="background-color: ${cpcColors[this.vmCore.getColorForPen(snippetData.paperValue)]}">`;
            }
        }
    }
    async fnOnSpeak(text, pitch) {
        return this.ui.speak(text, pitch);
    }
    getEscape() {
        return this.ui.getEscape();
    }
}
//# sourceMappingURL=BasicVmBrowser.js.map