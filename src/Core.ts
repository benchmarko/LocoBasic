// core.ts

import type { ICore, ConfigType } from "./Interfaces";
import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";

type VariableValue = string | number | [] | VariableValue[];

const vm = {
	_output: "",
	_fnOnCls: (() => undefined) as () => void,
	dimArray: (dims: number[], initVal: string | number = 0) => {
		const createRecursiveArray = function (depth: number) {
			const length = dims[depth] + 1, // +1 because of 0-based index
				array: VariableValue[] = new Array(length);

			depth += 1;
			if (depth < dims.length) { // more dimensions?
				for (let i = 0; i < length; i += 1) {
					array[i] = createRecursiveArray(depth); // recursive call
				}
			} else { // one dimension
				array.fill(initVal);
			}
			return array;
		};
		return createRecursiveArray(0);
	},
	cls: () => {
		vm._output = "";
		vm._fnOnCls();
	},
	_convertPrintArg: (arg: string | number) => typeof arg !== "number" ? arg : arg >= 0 ? ` ${arg} ` : `${arg} `, // pad numbers with spaces
	print: (...args: (string | number)[]) => vm._output += args.map((arg) => vm._convertPrintArg(arg)).join(''),

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
			return "ERROR" + "\n";
		}

		let output: string;
		try {
			const fnScript = new Function("_o", compiledScript);
			const result = fnScript(this.vm) || "";
			if (result instanceof Promise) {
				output = this.vm.getOutput() + await result;
			} else {
				output = this.vm.getOutput() + result;
			}

		} catch (error) {
			output = "ERROR: ";
			if (error instanceof Error) {
				output += error.message;

				const anyErr = error as any;
				const lineNumber = anyErr.lineNumber; // only on FireFox
				const columnNumber = anyErr.columnNumber; // only on FireFox

				if (lineNumber || columnNumber) {
					const errLine = lineNumber - 2; // for some reason line 0 is 2
					output += ` (line ${errLine}, column ${columnNumber})`;
				}
			} else {
				output += "unknown";
			}
		}
		return output + "\n";
	}
}
