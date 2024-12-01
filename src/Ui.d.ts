import { ICore, IUi, ConfigType } from "./Interfaces";
export declare class Ui implements IUi {
    private readonly core;
    private basicCm;
    private compiledCm;
    constructor(core: ICore);
    private debounce;
    private static asyncDelay;
    private getOutputText;
    setOutputText(value: string): void;
    private onExecuteButtonClick;
    private oncompiledTextChange;
    private onCompileButtonClick;
    private onbasicTextChange;
    private setExampleSelect;
    private onExampleSelectChange;
    private setExampleSelectOptions;
    private fnDecodeUri;
    parseUri(urlQuery: string, config: ConfigType): string[];
    onWindowLoad(_event: Event): void;
}
//# sourceMappingURL=Ui.d.ts.map