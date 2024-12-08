// Interfaces.ts

export type ConfigEntryType = string | number | boolean;
export type ConfigType = Record<string, ConfigEntryType>;

export type ExampleType = Record<string, string>;

export interface ICore {
	getConfigObject(): ConfigType,
	getConfig(name: string): ConfigEntryType,
	getExampleObject(): ExampleType,
	getExample(name: string): string,
	setExample(key: string, script: string): void,
	compileScript(script: string): string,
	executeScript(compiledScript: string): Promise<string>,
	setOnCls(fn: () => void): void
	setOnCheckSyntax(fn: (s: string) => Promise<string>): void
}

export interface IUi {
	parseUri(urlQuery: string, config: ConfigType): string[],
	onWindowLoad(event: Event): void,
	setOutputText(value: string): void,
	checkSyntax(str: string): Promise<string>
}
