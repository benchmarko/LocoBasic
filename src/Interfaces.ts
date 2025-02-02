// Interfaces.ts

export type ConfigEntryType = string | number | boolean;
export type ExampleType = Record<string, string>;

export type  ConfigType = {
	action: string, //"compile,run",
	debug: number,
	example: string,
	fileName: string,
	grammar: string, //"basic", // basic or strict
	input: string,
	debounceCompile: number,
	debounceExecute: number
}

export interface IVm {
	cls(): void,
	drawMovePlot(type: string, x: number, y: number): void,
	flush(): void,
	graphicsPen(num: number): void,
	mode(num: number): void,
	paper(color: number): void,
	pen(color: number): void,
	print(_msg: string): void,
	prompt(_msg: string): string | null
}

export interface IVmAdmin extends IVm {
	getOutput(): string,
	setOutput(str: string): void,
}
export interface ICore {
	setVm(vm: IVmAdmin): void,
	getConfigObject(): ConfigType
	getExampleObject(): ExampleType,
	getExample(name: string): string,
	setExample(key: string, script: string): void,
	compileScript(script: string): string,
	executeScript(compiledScript: string): Promise<string>,
	setOnCheckSyntax(fn: (s: string) => Promise<string>): void,
	addItem(key: string, input: string | (() => void)): void,
	parseArgs(args: string[], config: Record<string, ConfigEntryType>): void
}

export interface IUI {
	parseUri(urlQuery: string, config: Record<string, ConfigEntryType>): string[],
	onWindowLoad(event: Event): void,
	addOutputText(value: string): void,
	setOutputText(value: string): void,
	getPaperColors(colorsForPens: string[]): string[],
	getPenColors(colorsForPens: string[]): string[],
	checkSyntax(str: string): Promise<string>,
	prompt(msg: string): string | null
}
