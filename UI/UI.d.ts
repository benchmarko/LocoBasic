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
    getColor(color: string, background: boolean): string;
    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    prompt(msg: string): string | null;
    private updateConfigParameter;
    private setButtonDisabled;
    private setSelectDisabled;
    private hasCompiledError;
    private onExecuteButtonClick;
    private onCompiledTextChange;
    private onCompileButtonClick;
    private onAutoCompileInputChange;
    private onAutoExecuteInputChange;
    private toggleAreaHidden;
    private setAreaHidden;
    private onShowOutputInputChange;
    private onShowBasicInputChange;
    private onShowCompiledInputChange;
    private onStopButtonClick;
    private onConvertButtonClick;
    private static addLabels;
    private static removeUnusedLabels;
    private onLabelAddButtonClick;
    private onLabelRemoveButtonClick;
    private onBasicTextChange;
    private getExampleScript;
    private onExampleSelectChange;
    private setExampleSelectOptions;
    private getExampleMap;
    private onDatabaseSelectChange;
    private setDatabaseSelectOptions;
    private onHelpButtonClick;
    private static fnDownloadBlob;
    private getExampleName;
    private onExportSvgButtonClick;
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