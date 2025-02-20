import type { ICore, IUI } from "../Interfaces";
export declare class UI implements IUI {
    private core?;
    private basicCm?;
    private compiledCm?;
    private readonly keyBuffer;
    private escape;
    private static getErrorEvent?;
    private debounce;
    private static asyncDelay;
    getEscape(): boolean;
    addOutputText(value: string): void;
    setOutputText(value: string): void;
    getPaperColors(colorsForPens: string[]): string[];
    getPenColors(colorsForPens: string[]): string[];
    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    prompt(msg: string): string | null;
    private setButtonDisabled;
    private onExecuteButtonClick;
    private onCompiledTextChange;
    private onCompileButtonClick;
    private onStopButtonClick;
    private onbasicTextChange;
    private setExampleSelect;
    private onExampleSelectChange;
    private setExampleSelectOptions;
    private onHelpButtonClick;
    getKeyFromBuffer(): string;
    private putKeyInBuffer;
    private onOutputTextKeydown;
    private static getErrorEventFn;
    private static describeError;
    checkSyntax(str: string): Promise<string>;
    private fnDecodeUri;
    private parseUri;
    onWindowLoadContinue(core: ICore): void;
}
//# sourceMappingURL=UI.d.ts.map