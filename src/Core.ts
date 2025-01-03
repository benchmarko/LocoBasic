// core.ts

import type { ICore, ConfigType, ConfigEntryType, IVm } from "./Interfaces";
import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";

const vm = {
	_output: "",
	_fnOnCls: (() => undefined) as () => void,
	_fnOnPrint: ((_msg: string) => undefined) as (msg: string) => void, // eslint-disable-line @typescript-eslint/no-unused-vars
	_fnOnPrompt: ((_msg: string) => "") as (msg: string) => string, // eslint-disable-line @typescript-eslint/no-unused-vars
	cls: () => {
		vm._output = "";
		vm._fnOnCls();
	},
	print(...args: string[]) {
		this._output += args.join('');
		if (this._output.endsWith("\n")) {
			this._fnOnPrint(this._output);
			this._output = "";
		}
	},
	prompt: (msg: string) => {
		return vm._fnOnPrompt(msg);
	},

	getOutput: () => vm._output,
	setOutput: (str: string) => vm._output = str,
	setOnCls: (fn: () => void) => vm._fnOnCls = fn,
	setOnPrint: (fn: (msg: string) => void) => vm._fnOnPrint = fn,
	setOnPrompt: (fn: (msg: string) => string) => vm._fnOnPrompt = fn
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

	setOnCheckSyntax(fn: (s: string) => Promise<string>) {
		this.onCheckSyntax = fn;
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
				output = this.vm.getOutput() + output;
			} else {
				output = this.vm.getOutput() + result;
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
	print(...args) { this._output += args.join(''); if (this._output.endsWith("\\n")) { console.log(this._output); this._output = ""; } },
	prompt: (msg) => { console.log(msg); return ""; }
});`
		return result;
	}
}
