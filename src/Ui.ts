// Ui.ts

import { ICore, IUi, ConfigType } from "./Interfaces";

export class Ui implements IUi {
	private readonly core: ICore;
	private basicCm: any;
	private compiledCm: any;

	constructor(core: ICore) {
		this.core = core;
	}

	private debounce<T extends (...args: any[]) => void>(func: T, delayPara: string): (...args: any[]) => void {
		let timeoutId: ReturnType<typeof setTimeout>;
		const core = this.core;
		return function (this: any, ...args: any[]) {
			const context = this;
			const delay = core.getConfig(delayPara) as number;
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				func.apply(context, args);
			}, delay);
		};
	}

	private static asyncDelay(fn: () => void, timeout: number) {
		return (async () => {
			const timerId = setTimeout(fn, timeout);
			return timerId;
		})();
	}


	private getOutputText() {
		const outputText = document.getElementById("outputText") as HTMLTextAreaElement;
		return outputText.value;
	}

	public setOutputText(value: string) {
		const outputText = document.getElementById("outputText") as HTMLTextAreaElement;
		outputText.value = value;
	}

	private async onExecuteButtonClick(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const compiledText = document.getElementById("compiledText") as HTMLTextAreaElement;

		const compiledScript = this.compiledCm ? this.compiledCm.getValue() as string : compiledText.value;

		const output = await this.core.executeScript(compiledScript);

		this.setOutputText(this.getOutputText() + output);
	}

	private oncompiledTextChange(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const autoExecuteInput = document.getElementById("autoExecuteInput") as HTMLInputElement;
		if (autoExecuteInput.checked) {
			const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
			executeButton.dispatchEvent(new Event('click'));
		}
	}

	private onCompileButtonClick(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const basicText = document.getElementById("basicText") as HTMLTextAreaElement;
		const compiledText = document.getElementById("compiledText") as HTMLTextAreaElement;
		const input = this.compiledCm ? this.basicCm.getValue() : basicText.value;
		const compiledScript = this.core.compileScript(input);

		if (this.compiledCm) {
			this.compiledCm.setValue(compiledScript);
		} else {
			compiledText.value = compiledScript;
			const autoExecuteInput = document.getElementById("autoExecuteInput") as HTMLInputElement;
			if (autoExecuteInput.checked) {
				const newEvent = new Event('change');
				compiledText.dispatchEvent(newEvent);
			}
		}
	}

	private async onbasicTextChange(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const autoCompileInput = document.getElementById("autoCompileInput") as HTMLInputElement;
		if (autoCompileInput.checked) {
			const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
			compileButton.dispatchEvent(new Event('click'));
		}
	}

	private setExampleSelect(name: string) {
		const exampleSelect = document.getElementById("exampleSelect") as HTMLSelectElement;
		exampleSelect.value = name;
	}

	private onExampleSelectChange(event: Event) {
		const exampleSelect = event.target as HTMLSelectElement;

		const basicText = document.getElementById("basicText") as HTMLTextAreaElement;
		const value = this.core.getExample(exampleSelect.value);

		this.setOutputText("");

		if (this.basicCm) {
			this.basicCm.setValue(value);
		} else {
			basicText.value = value;
			basicText.dispatchEvent(new Event('change'));
		}
	}


	private setExampleSelectOptions(examples: Record<string, string>) {
		const exampleSelect = document.getElementById("exampleSelect") as HTMLSelectElement;

		for (const key of Object.keys(examples)) {
			const script = examples[key];
			const firstLine = script.slice(0, script.indexOf("\n"));

			const option = window.document.createElement("option");
			option.value = key;
			option.text = key;
			option.title = firstLine;
			option.selected = false;
			exampleSelect.add(option);
		}
	}

	private fnDecodeUri(s: string) {
		let decoded = "";

		try {
			decoded = decodeURIComponent(s.replace(/\+/g, " "));
		} catch (err) {
			if (err instanceof Error) {
				err.message += ": " + s;
			}
			console.error(err);
		}
		return decoded;
	}

	// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	public parseUri(urlQuery: string, config: ConfigType): string[] {
		const rSearch = /([^&=]+)=?([^&]*)/g,
			args: string[] = [];

		let match: RegExpExecArray | null;

		while ((match = rSearch.exec(urlQuery)) !== null) {
			const name = this.fnDecodeUri(match[1]),
				value = this.fnDecodeUri(match[2]);

			if (value !== null && config[name] !== undefined) {
				args.push(name + "=" + value);
			}
		}
		return args;
	}

	public onWindowLoad(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const basicText = window.document.getElementById("basicText") as HTMLTextAreaElement;
		basicText.addEventListener('change', (event) => this.onbasicTextChange(event));

		const compiledText = window.document.getElementById("compiledText") as HTMLTextAreaElement;
		compiledText.addEventListener('change', (event) => this.oncompiledTextChange(event));

		const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
		compileButton.addEventListener('click', (event) => this.onCompileButtonClick(event), false);

		const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
		executeButton.addEventListener('click', (event) => this.onExecuteButtonClick(event), false);

		const exampleSelect = window.document.getElementById("exampleSelect") as HTMLSelectElement;
		exampleSelect.addEventListener('change', (event) => this.onExampleSelectChange(event));

		const WinCodeMirror = (window as any).CodeMirror;
		if (WinCodeMirror) {
			this.basicCm = WinCodeMirror.fromTextArea(basicText, {
				lineNumbers: true,
				mode: 'javascript'
			});
			this.basicCm.on('changes', this.debounce((event: Event) => this.onbasicTextChange(event), "debounceCompile"));

			this.compiledCm = WinCodeMirror.fromTextArea(compiledText, {
				lineNumbers: true,
				mode: 'javascript'
			});
			this.compiledCm.on('changes', this.debounce((event: Event) => this.oncompiledTextChange(event), "debounceExecute"));
		}

		Ui.asyncDelay(() => {
			const core = this.core;
			this.setExampleSelectOptions(core.getExampleObject());

			const example = this.core.getConfig("example");
			if (example) {
				this.setExampleSelect(example as string);
			}
			exampleSelect.dispatchEvent(new Event('change'));
		}, 10);
	}

}