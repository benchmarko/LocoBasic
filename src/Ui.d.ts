import { ICore, IUi, ConfigType } from "./Interfaces";
export declare class Ui implements IUi {
    private readonly core;
    private basicCm;
    private compiledCm;
    private static getErrorEvent?;
    constructor(core: ICore);
    private debounce;
    private static asyncDelay;
    private getOutputText;
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
//# sourceMappingURL=Ui.d.ts.map