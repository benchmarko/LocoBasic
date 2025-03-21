import type { ICore, IUI, IVmAdmin } from "../Interfaces";
export declare class UI implements IUI {
    private core?;
    private vm?;
    private basicCm?;
    private compiledCm?;
    private readonly keyBuffer;
    private escape;
    private fnOnKeyPressHandler;
    private static getErrorEvent?;
    constructor();
    private debounce;
    private static asyncDelay;
    private getCore;
    getEscape(): boolean;
    private fnLoadScriptOrStyle;
    private loadScript;
    getCurrentDataKey(): string;
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
    private updateConfigParameter;
    private setButtonDisabled;
    private setSelectDisabled;
    private toggleAreaHidden;
    private setClearLeft;
    private onBasicAreaButtonClick;
    private onCompiledAreaButtonClick;
    private onOutputAreaButtonClick;
    private onExecuteButtonClick;
    private onCompiledTextChange;
    private onCompileButtonClick;
    private onStopButtonClick;
    private onBasicTextChange;
    private getExampleScript;
    private onExampleSelectChange;
    private setExampleSelectOptions;
    private getExampleMap;
    private onDatabaseSelectChange;
    private setDatabaseSelectOptions;
    private onHelpButtonClick;
    getKeyFromBuffer(): string;
    private putKeyInBuffer;
    private onOutputTextKeydown;
    private static getErrorEventFn;
    private static describeError;
    checkSyntax(str: string): Promise<string>;
    private fnDecodeUri;
    private parseUri;
    onWindowLoadContinue(core: ICore, vm: IVmAdmin): void;
}
//# sourceMappingURL=UI.d.ts.map