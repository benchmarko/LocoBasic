import type { ICore, IUI, ConfigType } from "../Interfaces";
export declare class UI implements IUI {
    private readonly core;
    private basicCm?;
    private compiledCm?;
    private static getErrorEvent?;
    constructor(core: ICore);
    private debounce;
    private static asyncDelay;
    addOutputText(value: string): void;
    setOutputText(value: string): void;
    private onExecuteButtonClick;
    private onCompiledTextChange;
    private onCompileButtonClick;
    private onbasicTextChange;
    private setExampleSelect;
    private onExampleSelectChange;
    private setExampleSelectOptions;
    private static getErrorEventFn;
    private static describeError;
    checkSyntax(str: string): Promise<string>;
    private fnDecodeUri;
    parseUri(urlQuery: string, config: ConfigType): string[];
    onWindowLoad(_event: Event): void;
}
//# sourceMappingURL=UI.d.ts.map