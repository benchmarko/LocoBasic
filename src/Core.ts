// core.ts

import type { ICore, ConfigType } from "./Interfaces";
import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";

const vm = {
	_output: "",
	_fnOnCls: (() => undefined) as () => void,
	cls: () => {
		vm._output = "";
		vm._fnOnCls();
	},
	print: (...args: string[]) => vm._output += args.join(''),

	getOutput: () => vm._output,
	setOutput: (str: string) => vm._output = str,
	setOnCls: (fn: () => void) => vm._fnOnCls = fn
};


export class Core implements ICore {
	private readonly startConfig: ConfigType = {
		debug: 0,
		example: "",
		fileName: "",
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

	public getConfig(name: string) {
		return this.startConfig[name];
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

	setOnCheckSyntax(fn: (s: string) => Promise<string>) {
		this.onCheckSyntax = fn;
	}

	private arithmeticParser: Parser | undefined;

	public compileScript(script: string) {
		if (!this.arithmeticParser) {
			this.arithmeticParser = new Parser(arithmetic.grammar, this.semantics.getSemantics());
		}
		this.semantics.resetParser();

		const compiledScript = this.arithmeticParser.parseAndEval(script);
		return compiledScript;
	}

	async executeScript(compiledScript: string) {
		this.vm.setOutput("");

		if (compiledScript.startsWith("ERROR")) {
			return "ERROR";
		}

		let output: string;
		output = await this.onCheckSyntax(compiledScript);
		if (output) {
			vm.cls();
			return "ERROR: " + output;
		}

		try {
			const fnScript = new Function("_o", compiledScript);
			const result = fnScript(this.vm) || "";
			if (result instanceof Promise) {
				output = await result;
				output = this.vm.getOutput() + output;
			} else {
				output = this.vm.getOutput() + result;
			}

		} catch (error) {
			vm.cls();
			output = "ERROR: ";
			if (error instanceof Error) {
				output += String(error);

				const anyErr = error as any;
				const lineNumber = anyErr.lineNumber; // only on FireFox
				const columnNumber = anyErr.columnNumber; // only on FireFox

				if (lineNumber || columnNumber) {
					const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
					output += ` (Line ${errLine}, column ${columnNumber})`;
				}
			} else {
				output += "unknown";
			}
		}
		return output;
	}
}
