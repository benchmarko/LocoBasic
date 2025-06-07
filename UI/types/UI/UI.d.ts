import type { ICore, IUI, IVmAdmin } from "../Interfaces";
export declare class UI implements IUI {
    private core?;
    private vm?;
    private basicCm?;
    private compiledCm?;
    private readonly keyBuffer;
    private escape;
    private initialUserAction;
    private fnOnKeyPressHandler;
    private fnOnClickHandler;
    private speechSynthesisUtterance?;
    private static getErrorEvent?;
    constructor();
    private debounce;
    private static asyncDelay;
    private getCore;
    getEscape(): boolean;
    setEscape(escape: boolean): void;
    private toggleElementHidden;
    private setElementHidden;
    private setButtonOrSelectDisabled;
    private fnLoadScriptOrStyle;
    private loadScript;
    getCurrentDataKey(): string;
    private scrollToBottom;
    addOutputText(value: string, hasGraphics?: boolean): void;
    setOutputText(value: string): void;
    getColor(color: string, background: boolean): string;
    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    prompt(msg: string): string | null;
    private waitForVoices;
    private waitForUserInteraction;
    private logVoiceDebugInfo;
    private getSpeechSynthesisUtterance;
    speak(text: string, pitch: number): Promise<void>;
    private updateConfigParameter;
    private hasCompiledError;
    private updateButtonStates;
    private onExecuteButtonClick;
    private onCompiledTextChange;
    private onCompileButtonClick;
    private onAutoCompileInputChange;
    private onAutoExecuteInputChange;
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
    private getClickedKey;
    private onOutputTextClick;
    private static getErrorEventFn;
    private static describeError;
    checkSyntax(str: string): Promise<string>;
    private fnDecodeUri;
    private parseUri;
    private initializeEditor;
    private syncInputState;
    onWindowLoadContinue(core: ICore, vm: IVmAdmin): void;
}
//# sourceMappingURL=UI.d.ts.map