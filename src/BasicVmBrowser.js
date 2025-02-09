import { BasicVmCore } from "./BasicVmCore";
export class BasicVmBrowser extends BasicVmCore {
    constructor(ui) {
        super();
        this.ui = ui;
        const colorsForPens = this.getColorsForPens();
        this.penColors = ui.getPenColors(colorsForPens);
        this.paperColors = ui.getPaperColors(colorsForPens);
    }
    /**
     * Clears the output text.
     */
    fnOnCls() {
        this.ui.setOutputText("");
    }
    /**
     * Adds a message to the output text.
     * @param msg - The message to print.
     */
    fnOnPrint(msg) {
        this.ui.addOutputText(msg);
    }
    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    async fnOnPrompt(msg) {
        const input = this.ui.prompt(msg);
        return Promise.resolve(input);
    }
    /**
     * Gets the pen color by index.
     * @param num - The index of the pen color.
     * @returns The pen color.
     * @throws Will throw an error if the index is out of bounds.
     */
    fnGetPenColor(num) {
        if (num < 0 || num >= this.penColors.length) {
            throw new Error("Pen color index out of bounds");
        }
        return this.penColors[num];
    }
    /**
     * Gets the paper color by index.
     * @param num - The index of the paper color.
     * @returns The paper color.
     * @throws Will throw an error if the index is out of bounds.
     */
    fnGetPaperColor(num) {
        if (num < 0 || num >= this.paperColors.length) {
            throw new Error("Paper color index out of bounds");
        }
        return this.paperColors[num];
    }
}
//# sourceMappingURL=BasicVmBrowser.js.map