import { IUI } from "./Interfaces";
import { BasicVmCore } from "./BasicVmCore";
export declare class BasicVmBrowser extends BasicVmCore {
    private readonly ui;
    private readonly penColors;
    private readonly paperColors;
    constructor(ui: IUI);
    /**
     * Clears the output text.
     */
    fnOnCls(): void;
    /**
     * Adds a message to the output text.
     * @param msg - The message to print.
     */
    fnOnPrint(msg: string): void;
    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    fnOnPrompt(msg: string): Promise<string | null>;
    /**
     * Gets the pen color by index.
     * @param num - The index of the pen color.
     * @returns The pen color.
     * @throws Will throw an error if the index is out of bounds.
     */
    fnGetPenColor(num: number): string;
    /**
     * Gets the paper color by index.
     * @param num - The index of the paper color.
     * @returns The paper color.
     * @throws Will throw an error if the index is out of bounds.
     */
    fnGetPaperColor(num: number): string;
}
//# sourceMappingURL=BasicVmBrowser.d.ts.map