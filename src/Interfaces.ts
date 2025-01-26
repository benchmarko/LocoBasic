// Interfaces.ts

export type ConfigEntryType = string | number | boolean;
export type ConfigType = Record<string, ConfigEntryType>;

export type ExampleType = Record<string, string>;

export interface ICore {
	getConfigObject(): ConfigType,
	getConfig<T extends ConfigEntryType>(name: string): T,
	getExampleObject(): ExampleType,
	getExample(name: string): string,
	setExample(key: string, script: string): void,
	compileScript(script: string): string,
	executeScript(compiledScript: string): Promise<string>,
	putScriptInFrame(script: string): string,
	setOnCls(fn: () => void): void,
	setOnPrint(fn: (msg: string) => void): void,
	setOnPrompt(fn: (msg: string) => string): void,
	setOnCheckSyntax(fn: (s: string) => Promise<string>): void,
	setPaperColors(colors: string[]): void,
	setPenColors(colors: string[]): void
}

export interface IUI {
	parseUri(urlQuery: string, config: ConfigType): string[],
	onWindowLoad(event: Event): void,
	addOutputText(value: string): void,
	setOutputText(value: string): void,
	getPaperColors(): string[],
	getPenColors(): string[],
	checkSyntax(str: string): Promise<string>
}

export interface IVm {
	cls(): void,
	paper(color: number): void,
	pen(color: number): void,
	print(_msg: string): void,
	prompt(_msg: string): number|string 
}
