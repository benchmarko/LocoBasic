import type { ConfigEntryType, ICore, IUI } from "../Interfaces";
export declare class UI implements IUI {
    private core;
    private basicCm?;
    private compiledCm?;
    private static getErrorEvent?;
    constructor(core: ICore);
    private debounce;
    private static asyncDelay;
    addOutputText(value: string): void;
    setOutputText(value: string): void;
    getPaperColors(colorsForPens: string[]): string[];
    getPenColors(colorsForPens: string[]): string[];
    prompt(msg: string): string | null;
    private onExecuteButtonClick;
    private onCompiledTextChange;
    private onCompileButtonClick;
    private onbasicTextChange;
    private setExampleSelect;
    private onExampleSelectChange;
    private setExampleSelectOptions;
    private onHelpButtonClick;
    private static getErrorEventFn;
    private static describeError;
    checkSyntax(str: string): Promise<string>;
    private fnDecodeUri;
    parseUri(urlQuery: string, config: Record<string, ConfigEntryType>): string[];
    onWindowLoad(_event: Event): void;
}
//# sourceMappingURL=UI.d.ts.map