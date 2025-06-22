import type { ICore, IUI } from "../Interfaces";
export declare class UI implements IUI {
    private core?;
    private vmMain?;
    private basicCm?;
    private compiledCm?;
    private compiledMessages;
    private initialUserAction;
    private fnOnKeyPressHandler;
    private fnOnClickHandler;
    private fnOnUserKeyClickHandler;
    private speechSynthesisUtterance?;
    constructor();
    private debounce;
    private static asyncDelay;
    private getCore;
    private cancelSpeech;
    private toggleElementHidden;
    private setElementHidden;
    private setButtonOrSelectDisabled;
    private fnLoadScriptOrStyle;
    private loadScript;
    getCurrentDataKey(): string;
    private scrollToBottom;
    addOutputText(value: string, hasGraphics?: boolean): void;
    setOutputText(value: string): void;
    private onUserKeyClick;
    private onSetUiKeys;
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
    private onGeolocation;
    private onSpeak;
    private updateConfigParameter;
    private hasCompiledError;
    private updateButtonStates;
    private beforeExecute;
    private afterExecute;
    private onExecuteButtonClick;
    private onCompiledTextChange;
    private onCompileButtonClick;
    private onEnterButtonClick;
    private onAutoCompileInputChange;
    private onAutoExecuteInputChange;
    private onShowOutputInputChange;
    private onShowBasicInputChange;
    private onShowCompiledInputChange;
    private clickStartSpeechButton;
    private onStopButtonClick;
    private onResetButtonClick;
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
    private putKeysInBuffer;
    private onOutputTextKeydown;
    private getClickedKey;
    private onOutputTextClick;
    private fnDecodeUri;
    private parseUri;
    private initializeEditor;
    private syncInputState;
    onWindowLoadContinue(core: ICore, workerFn: () => unknown): void;
}
//# sourceMappingURL=UI.d.ts.map