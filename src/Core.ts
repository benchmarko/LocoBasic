// core.ts

import type { ICore, ConfigType, ConfigEntryType, IVm } from "./Interfaces";
import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";


//TTT: should not be here:
const colorsForPens: string[] = [
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

const vm = {
	_output: "",
	_lastPaper: -1,
	_lastPen: -1,
	_mode: 2,
	_paperColors: [] as string[],
	_penColors: [] as string[],
	_graphicsBuffer: "",
	_graphicsPen: 1,
	_graphicsX: 0,
	_graphicsY: 0,
	_fnOnCls: (() => undefined) as () => void,
	_fnOnPrint: ((_msg: string) => undefined) as (msg: string) => void, // eslint-disable-line @typescript-eslint/no-unused-vars
	_fnOnPrompt: ((_msg: string) => "") as (msg: string) => string, // eslint-disable-line @typescript-eslint/no-unused-vars
	cls: () => {
		vm._output = "";
		vm._lastPaper = -1;
		vm._lastPen = -1;
		vm._graphicsBuffer = "";
		vm._graphicsPen = -1;
		vm._graphicsX = 0;
		vm._graphicsY = 0;
		vm._fnOnCls();
	},
	drawMovePlot: (type: string, x: number, y: number) => {
		x = Math.round(x);
		y = Math.round(y);
		if (!vm._graphicsBuffer) {
			vm._graphicsBuffer = `<path d="`;
		}

		if (vm._graphicsBuffer.endsWith('d="')) {
			// avoid 'Error: <path> attribute d: Expected moveto path command ('M' or 'm')'
			if (type !== "M") {
				vm._graphicsBuffer += `M${vm._graphicsX} ${vm._graphicsY}`;
			}
		}

		let svg = "";
		switch (type) {
			case "L":
			case "M":
				y = 399 - y;
				svg = `${type}${x} ${y}`;
				break;
			case "P":
				y = 399 - y;
				svg = `M${x - 1} ${y + 1}h1v1h-1v-1`;
				break;
			case "l":
			case "m":
				y = -y;
				svg = `${type}${x} ${y}`;
				x = vm._graphicsX + x;
				y = vm._graphicsY + y;
				break;
			case "p":
				y = -y;
				svg = `m${x - 1} ${y + 1}h1v1h-1v-1`;
				x = vm._graphicsX + x;
				y = vm._graphicsY + y;
				break;
			default:
				console.error(`drawMovePlot: Unknown type: ${type}`);
				break;
		}
		vm._graphicsBuffer += svg;
		vm._graphicsX = x;
		vm._graphicsY = y;
	},
	flush: () => {
		if (vm._graphicsBuffer) {
			//vm._output += `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" transform="scale(1, -1) translate(0, -400)" stroke-width="1px" stroke="currentColor">${vm._drawBuffer}" /> </svg>`;
			const strokeWidth = vm._mode >= 2 ? "1px" : vm._mode === 1 ? "2px" : "4px";
			vm._output += `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" stroke-width="${strokeWidth}" stroke="currentColor">${vm._graphicsBuffer}" /> </svg>`;
			vm._graphicsBuffer = "";
		}
		if (vm._output) {
			vm._fnOnPrint(vm._output);
			vm._output = "";
		}
	},
	graphicsPen: (num: number) => {
		if (num === vm._graphicsPen) {
			return;
		}
		vm._graphicsPen = num;

		if (vm._graphicsBuffer) {
			vm._graphicsBuffer += `" />`; // close the path
		}
		vm._graphicsBuffer += `<path stroke="${colorsForPens[num]}" d="`;
	},
	mode: (num: number) => {
		vm._mode = num;
		vm.cls();
	},
	paper(n: number) {
		if (n !== this._lastPaper) {
			this._output += this._paperColors[n];
			this._lastPaper = n;
		}
	},
	pen(n: number) {
		if (n !== this._lastPen) {
			this._output += this._penColors[n];
			this._lastPen = n;
		}
	},
	print(...args: string[]) {
		this._output += args.join('');
	},
	prompt: (msg: string) => {
		vm.flush();
		return vm._fnOnPrompt(msg);
	},

	getOutput: () => vm._output,
	setOutput: (str: string) => vm._output = str,
	setOnCls: (fn: () => void) => vm._fnOnCls = fn,
	setOnPrint: (fn: (msg: string) => void) => vm._fnOnPrint = fn,
	setOnPrompt: (fn: (msg: string) => string) => vm._fnOnPrompt = fn,
	setPaperColors: (paperColors: string[]) => vm._paperColors = paperColors,
	setPenColors: (penColors: string[]) => vm._penColors = penColors
};


export class Core implements ICore {
	private readonly startConfig: ConfigType = {
		action: "compile,run",
		debug: 0,
		example: "",
		fileName: "",
		grammar: "basic", // basic or strict
		input: "",
		debounceCompile: 800,
		debounceExecute: 400
	};

	private readonly semantics = new Semantics();

	private readonly examples: Record<string, string> = {};

	private vm = vm;

	private onCheckSyntax = async (_s: string) => ""; // eslint-disable-line @typescript-eslint/no-unused-vars

	public getConfigObject() {
		return this.startConfig;
	}

	public getConfig<T extends ConfigEntryType>(name: string) {
		return this.startConfig[name] as T;
	}

	public getExampleObject() {
		return this.examples;
	}

	public setExample(name: string, script: string) {
		this.examples[name] = script;
	}

	public getExample(name: string) {
		return this.examples[name];
	}

	public setOnCls(fn: () => void) {
		vm.setOnCls(fn);
	}

	public setOnPrint(fn: (msg: string) => void) {
		vm.setOnPrint(fn);
	}

	public setOnPrompt(fn: (msg: string) => string) {
		vm.setOnPrompt(fn);
	}

	public setOnCheckSyntax(fn: (s: string) => Promise<string>) {
		this.onCheckSyntax = fn;
	}

	public setPaperColors(colors: string[]) {
		vm.setPaperColors(colors);
	}

	public setPenColors(colors: string[]) {
		vm.setPenColors(colors);
	}

	private arithmeticParser: Parser | undefined;

	public compileScript(script: string) {
		if (!this.arithmeticParser) {
			const semantics = this.semantics.getSemantics();
			if (this.getConfig<string>("grammar") === "strict") {
				const basicParser = new Parser(arithmetic.basicGrammar, semantics);
				this.arithmeticParser = new Parser(arithmetic.strictGrammar, semantics, basicParser);
			} else {
				this.arithmeticParser = new Parser(arithmetic.basicGrammar, semantics);
			}
		}
		this.semantics.resetParser();

		return this.arithmeticParser.parseAndEval(script);
	}

	async executeScript(compiledScript: string) {
		this.vm.setOutput("");

		if (compiledScript.startsWith("ERROR")) {
			return "ERROR";
		}

		const syntaxError = await this.onCheckSyntax(compiledScript);
		if (syntaxError) {
			vm.cls();
			return "ERROR: " + syntaxError;
		}

		try {
			const fnScript = new Function("_o", compiledScript);
			const result = fnScript(this.vm as IVm) || "";

			let output: string;
			if (result instanceof Promise) {
				output = await result;
				this.vm.flush();
				output = this.vm.getOutput();
			} else {
				this.vm.flush();
				output = this.vm.getOutput();
			}
			return output;
		} catch (error) {
			let errorMessage = "ERROR: ";
			if (error instanceof Error) {
				errorMessage += this.vm.getOutput() + "\n" + String(error);

				const anyErr = error as unknown as Record<string, number>;
				const lineNumber = anyErr.lineNumber; // only on FireFox
				const columnNumber = anyErr.columnNumber; // only on FireFox

				if (lineNumber || columnNumber) {
					const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
					errorMessage += ` (Line ${errLine}, column ${columnNumber})`;
				}
			} else {
				errorMessage += "unknown";
			}
			return errorMessage;
		}
	}

	public putScriptInFrame(script: string) {
		const result =
`(function(_o) {
	${script}
})({
	_output: "",
	cls: () => undefined,
	flush() { if (this._output) { console.log(this._output); this._output = ""; } },
	paper: () => undefined,
	pen: () => undefined,
	print(...args) { this._output += args.join(''); },
	prompt: (msg) => { console.log(msg); return ""; }
});`
		return result;
	}
}
