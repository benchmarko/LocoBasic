// main.ts
//
// Usage:
// node dist/locobasic.js [action='compile,run'] [input=<statements>] [example=<name>] [fileName=<file>] [grammar=<name>] [debug=0] [debounceCompile=800] [debounceExecute=400]
//
// - Examples for compile and run:
// node dist/locobasic.js input='PRINT "Hello!"'
// npx ts-node dist/locobasic.js input='PRINT "Hello!"'
// node dist/locobasic.js input="?3 + 5 * (2 - 8)"
// node dist/locobasic.js example=euler
// node dist/locobasic.js fileName=dist/examples/example.bas
// node dist/locobasic.js grammar="strict" input='a$="Bob":PRINT "Hello ";a$;"!"'
//
// - Example for compile only:
// node dist/locobasic.js action='compile' input='PRINT "Hello!"' > hello1.js
//   [Windows: Use node.exe when redirecting into a file; or npx ts-node ...]
// node hello1.js
// [When using async functions like FRAME or INPUT, redirect to hello1.mjs]
//

declare const window: Record<string, any>;

import type { ConfigEntryType, ConfigType, ICore, IUI } from "./Interfaces";
import { Core } from "./Core";

const core: ICore = new Core();

let ui: IUI;


function fnHereDoc(fn: () => void) {
	return String(fn).
		replace(/^[^/]+\/\*\S*/, "").
		replace(/\*\/[^/]+$/, "");
}

function addItem(key: string, input: string | (() => void)) {
	let inputString = (typeof input !== "string") ? fnHereDoc(input) : input;
	inputString = inputString.replace(/^\n/, "").replace(/\n$/, ""); // remove preceding and trailing newlines
	// beware of data files ending with newlines! (do not use trimEnd)

	if (!key) { // maybe ""
		const firstLine = inputString.slice(0, inputString.indexOf("\n"));
		const matches = firstLine.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
		key = matches ? matches[1] : "unknown";
	}

	core.setExample(key, inputString);
}


interface NodeFs {
	promises: {
		readFile(name: string, encoding: string): Promise<string>
	};
}

interface NodeVm {
	runInNewContext: (code: string) => string;
}

let fs: NodeFs;
let modulePath: string;

let vm: NodeVm;

declare function require(name: string): NodeModule | NodeFs | NodeVm;

async function nodeReadFile(name: string): Promise<string> {
	if (!fs) {
		fs = require("fs") as NodeFs;
	}

	if (!module) {
		module = require("module") as NodeModule;
		modulePath = module.path || "";

		if (!modulePath) {
			console.warn("nodeReadFile: Cannot determine module path");
		}
	}
	try {
        return await fs.promises.readFile(name, "utf8");
    } catch (error) {
        console.error(`Error reading file ${name}:`, String(error));
        throw error;
    }
}

function fnParseArgs(args: string[], config: ConfigType) {
	for (let i = 0; i < args.length; i += 1) {
		const [name, ...valueParts] = args[i].split("="),
			nameType = typeof config[name];

		let value: ConfigEntryType = valueParts.join("=");
		if (value !== undefined) {
			if (nameType === "boolean") {
				value = (value === "true");
			} else if (nameType === "number") {
				value = Number(value);
			}
			config[name] = value;
		}
	}
	return config;
}

function keepRunning(fn: () => void, timeout: number) {
	const timerId = setTimeout(() => { }, timeout);
	return (async () => {
		fn();
		clearTimeout(timerId);
	})();
}


// https://stackoverflow.com/questions/35252731/find-details-of-syntaxerror-thrown-by-javascript-new-function-constructor
function nodeCheckSyntax(script: string) {
	if (!vm) {
		vm = require("vm") as NodeVm;
	}

	const describeError = (stack: string) => {
		const match = stack.match(/^\D+(\d+)\n(.+\n( *)\^+)\n\n(SyntaxError.+)/);
		if (!match) {
			return ""; // parse successful?
		}
		const [, linenoPlusOne, caretString, colSpaces, message] = match;
		const lineno = Number(linenoPlusOne) - 1;
		const colno = colSpaces.length + 1;
		return `Syntax error thrown at: Line ${lineno}, col: ${colno}\n${caretString}\n${message}`;
	};
	let output = "";

	try {
		const scriptInFrame = core.putScriptInFrame(script);
		vm.runInNewContext(`throw new Error();\n${scriptInFrame}`);
	}
	catch (err) { // Error-like object
		const stack = (err as Error).stack;
		if (stack) {
			output = describeError(stack);
		}
	}
	return output;
}


function start(input: string) {
	const actionConfig = core.getConfig<string>("action");
	if (input !== "") {
		core.setOnCls(() => console.clear());
		core.setOnCheckSyntax((s: string) => Promise.resolve(nodeCheckSyntax(s)));
		const compiledScript = actionConfig.includes("compile") ? core.compileScript(input) : input;

		if (compiledScript.startsWith("ERROR:")) {
			console.error(compiledScript);
			return;
		}

		if (actionConfig.includes("run")) {
			core.setOnPrint((msg) => {
				console.log(msg.replace(/\n$/, ""));
			});

			return keepRunning(async () => {
				const output = await core.executeScript(compiledScript);
				console.log(output.replace(/\n$/, ""));
			}, 5000);
		} else {
			const inFrame = core.putScriptInFrame(compiledScript);
			console.log(inFrame);
		}
	} else {
		console.log("No input");
	}
}

function main(config: ConfigType) {
	let input = (config.input as string) || "";

	if (config.fileName) {
		return keepRunning(async () => {
			input = await nodeReadFile(config.fileName as string);
			start(input);
		}, 5000);
	} else {
		if (config.example) {
			return keepRunning(async () => {
				const jsFile = await nodeReadFile("./dist/examples/examples.js");
				const fnScript = new Function("cpcBasic", jsFile);
				fnScript({
					addItem: addItem
				});

				const exampleScript = core.getExample(config.example as string);
				if (!exampleScript) {
					console.error(`ERROR: Example '${config.example}' not found.`);
					return;
				}
				input = exampleScript;
				start(input);
			}, 5000);
		}
		start(input);
	}
}

const config = core.getConfigObject();

if (typeof window !== "undefined") {
	window.cpcBasic = {
		addItem: addItem
	};
	window.onload = () => {
		const UI = window.locobasicUI.UI; 
		ui = new UI(core);

		const args = ui.parseUri(window.location.search.substring(1), config);
		fnParseArgs(args, config);

		core.setOnCls(() => ui.setOutputText(""));
		core.setOnPrint((msg) => ui.addOutputText(msg));
		core.setOnPrompt((msg) => window.prompt(msg));
		core.setOnCheckSyntax((s: string) => Promise.resolve(ui.checkSyntax(s)));
		ui.onWindowLoad(new Event("onload"));
	}

} else {
	main(fnParseArgs(global.process.argv.slice(2), config));
}
