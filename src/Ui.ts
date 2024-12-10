// Ui.ts

import { ICore, IUi, ConfigType } from "./Interfaces";

// Worker:
type PlainErrorEventType = {
	lineno: number,
	colno: number,
	message: string
};

type ProcessingQueueType = {
	resolve: (value: PlainErrorEventType) => void,
	jsText: string
};

// based on: https://stackoverflow.com/questions/35252731/find-details-of-syntaxerror-thrown-by-javascript-new-function-constructor
// https://stackoverflow.com/a/55555357
const workerFn = () => {
	const doEvalAndReply = (jsText: string) => {
		self.addEventListener(
			'error',
			(errorEvent) => {
				// Don't pollute the browser console:
				errorEvent.preventDefault();
				// The properties we want are actually getters on the prototype;
				// they won't be retrieved when just stringifying so, extract them manually, and put them into a new object:
				const { lineno, colno, message } = errorEvent;
				const plainErrorEventObj: PlainErrorEventType = { lineno, colno, message };
				self.postMessage(JSON.stringify(plainErrorEventObj));
			},
			{ once: true }
		);
		/* const fn = */ new Function("_o", jsText);
		const plainErrorEventObj: PlainErrorEventType = {
			lineno: -1,
			colno: -1,
			message: 'No Error: Parsing successful!'
		};
		self.postMessage(JSON.stringify(plainErrorEventObj));
	};
	self.addEventListener('message', (e) => {
		doEvalAndReply(e.data);
	});
};


export class Ui implements IUi {
	private readonly core: ICore;
	private basicCm: any;
	private compiledCm: any;
	//private static worker?: Worker;
	private static getErrorEvent?: (s: string) => Promise<PlainErrorEventType>;

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

		this.setOutputText(this.getOutputText() + output + (output.endsWith("\n") ? "" : "\n"));
	}

	private onCompiledTextChange(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
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

	private static getErrorEventFn() {
		if (Ui.getErrorEvent) {
			return Ui.getErrorEvent;
		}

		const blob = new Blob(
			[`(${workerFn})();`],
			{ type: "text/javascript" }
		);

		const worker = new Worker(window.URL.createObjectURL(blob));
		// Use a queue to ensure processNext only calls the worker once the worker is idle
		const processingQueue: ProcessingQueueType[] = [];
		let processing = false;

		const processNext = () => {
			processing = true;
			const { resolve, jsText } = processingQueue.shift() as ProcessingQueueType;
			worker.addEventListener(
				'message',
				({ data }) => {
					resolve(JSON.parse(data));
					if (processingQueue.length) {
						processNext();
					} else {
						processing = false;
					}
				},
				{ once: true }
			);
			worker.postMessage(jsText);
		};

		const getErrorEvent = (jsText: string) => new Promise<PlainErrorEventType>((resolve) => {
			processingQueue.push({ resolve, jsText });
			if (!processing) {
				processNext();
			}
		});

		Ui.getErrorEvent = getErrorEvent;
		return getErrorEvent;
	}

	private static describeError(stringToEval: string, lineno: number, colno: number) {
		const lines = stringToEval.split('\n');
		const line = lines[lineno - 1];
		return `${line}\n${' '.repeat(colno - 1) + '^'}`;
	}

	public async checkSyntax(str: string) {
		const getErrorEvent = Ui.getErrorEventFn();

		let output = "";
		const { lineno, colno, message } = await getErrorEvent(str);
		if (message === 'No Error: Parsing successful!') {
			return "";
		}
		output += `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`; // lineNo -2 because of anonymous function added by new Function() constructor
		output += Ui.describeError(str, lineno - 2, colno);
		return output;
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
		compiledText.addEventListener('change', (event) => this.onCompiledTextChange(event));

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
			this.compiledCm.on('changes', this.debounce((event: Event) => this.onCompiledTextChange(event), "debounceExecute"));
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