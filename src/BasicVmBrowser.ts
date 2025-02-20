import { IUI } from "./Interfaces";
import { BasicVmCore } from "./BasicVmCore";

export class BasicVmBrowser extends BasicVmCore {
    private readonly ui: IUI;
    private readonly penColors: string[];
    private readonly paperColors: string[];

    constructor(ui: IUI) {
        super();
        this.ui = ui;
        const colorsForPens = this.getColorsForPens();
        this.penColors = ui.getPenColors(colorsForPens);
        this.paperColors = ui.getPaperColors(colorsForPens);
    }

    /**
     * Clears the output text.
     */
    public fnOnCls(): void {
        this.ui.setOutputText("");
    }

    /**
     * Adds a message to the output text.
     * @param msg - The message to print.
     */
    public fnOnPrint(msg: string): void {
        this.ui.addOutputText(msg);
    }

    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    public async fnOnPrompt(msg: string): Promise<string | null> {
        const input = this.ui.prompt(msg);
        return Promise.resolve(input);
    }

    /**
     * Gets the pen color by index.
     * @param num - The index of the pen color.
     * @returns The pen color.
     * @throws Will throw an error if the index is out of bounds.
     */
    public fnGetPenColor(num: number): string {
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
    public fnGetPaperColor(num: number): string {
        if (num < 0 || num >= this.paperColors.length) {
            throw new Error("Paper color index out of bounds");
        }
        return this.paperColors[num];
    }

    public inkey$(): Promise<string> {
        const key = this.ui.getKeyFromBuffer();
        return Promise.resolve(key);
    }
}
