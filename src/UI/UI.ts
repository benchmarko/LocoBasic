// UI.ts

import type { Editor } from 'codemirror';
import type { ICore, IUI, ConfigType } from "../Interfaces";

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


export class UI implements IUI {
	private readonly core: ICore;
	private basicCm?: Editor;
	private compiledCm?: Editor;
	private static getErrorEvent?: (s: string) => Promise<PlainErrorEventType>;

	constructor(core: ICore) {
		this.core = core;
	}

	private debounce<T extends (...args: unknown[]) => void | Promise<void>>(func: T, delayPara: string): (...args: Parameters<T>) => void {
		let timeoutId: ReturnType<typeof setTimeout>;
		const core = this.core;
		return function (this: unknown, ...args: Parameters<T>) {
			const context = this;
			const delay = core.getConfig<number>(delayPara);
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

	public addOutputText(value: string) {
		const outputText = document.getElementById("outputText") as HTMLPreElement;
		outputText.innerHTML += value;
	}

	public setOutputText(value: string) {
		const outputText = document.getElementById("outputText") as HTMLPreElement;
		outputText.innerText = value;
	}

	private static readonly colorsForPens: string[] = [
		"#000080", //  1 Navy
		"#FFFF00", // 24 Bright Yellow
		"#00FFFF", // 20 Bright Cyan
		"#FF0000", //  6 Bright Red
		"#FFFFFF", // 26 Bright White
		"#000000", //  0 Black
		"#0000FF", //  2 Bright Blue
		"#FF00FF", //  8 Bright Magenta
		"#008080", // 10 Cyan
		"#808000", // 12 Yellow
		"#8080FF", // 14 Pastel Blue
		"#FF8080", // 16 Pink
		"#00FF00", // 18 Bright Green
		"#80FF80", // 22 Pastel Green
		"#000080", //  1 Navy (repeated)
		"#FF8080", // 16 Pink (repeated)
		"#000080"  //  1 Navy (repeated)
	];

	public getPaperColors() {
		return UI.colorsForPens.map((color) => `<span style="background-color: ${color}">`);
	}

	public getPenColors() {
		return UI.colorsForPens.map((color) => `<span style="color: ${color}">`);
	}

	private async onExecuteButtonClick(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const compiledText = document.getElementById("compiledText") as HTMLTextAreaElement;

		const compiledScript = this.compiledCm ? this.compiledCm.getValue() as string : compiledText.value;

		const output = await this.core.executeScript(compiledScript);

		this.addOutputText(output + (output.endsWith("\n") ? "" : "\n"));
	}

	private onCompiledTextChange() {
		const autoExecuteInput = document.getElementById("autoExecuteInput") as HTMLInputElement;
		if (autoExecuteInput.checked) {
			const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
			executeButton.dispatchEvent(new Event('click'));
		}
	}

	private onCompileButtonClick(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const basicText = document.getElementById("basicText") as HTMLTextAreaElement;
		const compiledText = document.getElementById("compiledText") as HTMLTextAreaElement;
		const input = this.basicCm ? this.basicCm.getValue() : basicText.value;
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

	private async onbasicTextChange() {
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

	private onHelpButtonClick() {
		window.open("https://github.com/benchmarko/LocoBasic/#readme");
	}

	private static getErrorEventFn() {
		if (UI.getErrorEvent) {
			return UI.getErrorEvent;
		}

		const blob = new Blob(
			[`(${workerFn})();`],
			{ type: "text/javascript" }
		);

		const worker = new Worker(window.URL.createObjectURL(blob));
		// Use a queue to ensure processNext only calls the worker once the worker is idle
		const processingQueue: ProcessingQueueType[] = [];
		let isProcessing = false;

		const processNext = () => {
			isProcessing = true;
			const { resolve, jsText } = processingQueue.shift() as ProcessingQueueType;
			worker.addEventListener(
				'message',
				({ data }) => {
					resolve(JSON.parse(data));
					if (processingQueue.length) {
						processNext();
					} else {
						isProcessing = false;
					}
				},
				{ once: true }
			);
			worker.postMessage(jsText);
		};

		const getErrorEvent = (jsText: string): Promise<PlainErrorEventType> => {
			return new Promise<PlainErrorEventType>((resolve) => {
				processingQueue.push({ resolve, jsText });
				if (!isProcessing) {
					processNext();
				}
			});
		};

		UI.getErrorEvent = getErrorEvent;
		return getErrorEvent;
	}

	private static describeError(stringToEval: string, lineno: number, colno: number) {
		const lines = stringToEval.split('\n');
		const line = lines[lineno - 1];
		return `${line}\n${' '.repeat(colno - 1) + '^'}`;
	}

	public async checkSyntax(str: string) {
		const getErrorEvent = UI.getErrorEventFn();

		let output = "";
		const { lineno, colno, message } = await getErrorEvent(str);
		if (message === 'No Error: Parsing successful!') {
			return "";
		}
		output += `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`; // lineNo -2 because of anonymous function added by new Function() constructor
		output += UI.describeError(str, lineno - 2, colno) + "\n";
		output += message;
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
		basicText.addEventListener('change', () => this.onbasicTextChange());

		const compiledText = window.document.getElementById("compiledText") as HTMLTextAreaElement;
		compiledText.addEventListener('change', () => this.onCompiledTextChange());

		const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
		compileButton.addEventListener('click', (event) => this.onCompileButtonClick(event), false);

		const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
		executeButton.addEventListener('click', (event) => this.onExecuteButtonClick(event), false);

		const exampleSelect = window.document.getElementById("exampleSelect") as HTMLSelectElement;
		exampleSelect.addEventListener('change', (event) => this.onExampleSelectChange(event));

		const helpButton = window.document.getElementById("helpButton") as HTMLButtonElement;
		helpButton.addEventListener('click', () => this.onHelpButtonClick());

		const WinCodeMirror = window.CodeMirror;
		if (WinCodeMirror) {
			this.basicCm = WinCodeMirror.fromTextArea(basicText, {
				lineNumbers: true,
				mode: 'javascript'
			});
			this.basicCm.on('changes', this.debounce(() => this.onbasicTextChange(), "debounceCompile"));

			this.compiledCm = WinCodeMirror.fromTextArea(compiledText, {
				lineNumbers: true,
				mode: 'javascript'
			});
			this.compiledCm.on('changes', this.debounce(() => this.onCompiledTextChange(), "debounceExecute"));
		}

		UI.asyncDelay(() => {
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