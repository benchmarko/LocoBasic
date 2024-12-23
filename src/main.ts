// main.ts
//
// Usage:
// node dist/locobasic.js [action='compile,run'] [input=<statements>] [example=<name>]
//
// - Examples for compile and run:
// node dist/locobasic.js input='print "Hello!"'
// npx ts-node dist/locobasic.js input='print "Hello!"'
// node dist/locobasic.js input="?3 + 5 * (2 - 8)"
// node dist/locobasic.js example=euler
// node dist/locobasic.js fileName=dist/examples/example.bas
//
// - Example for compile only:
// node dist/locobasic.js action='compile' input='print "Hello!";' > hello1.js
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

let fs: NodeFs;
let modulePath: string;

declare function require(name: string): NodeModule | NodeFs;

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
	return fs.promises.readFile(name, "utf8");
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

function start(input: string) {
	const actionConfig = core.getConfig<string>("action");
	if (input !== "") {
		const compiledScript = actionConfig.includes("compile") ? core.compileScript(input) : input;
		//console.log("INFO: Compiled:\n" + compiledScript + "\n---");

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
			const examples = core.getExampleObject();
			if (!Object.keys(examples).length) {
				return keepRunning(async () => {
					const jsFile = await nodeReadFile("./dist/examples/examples.js");
					// ?? require('./examples/examples.js');
					const fnScript = new Function("cpcBasic", jsFile);
					fnScript({
						addItem: addItem
					});

					input = examples[config.example as string];
					start(input);
				}, 5000);
			}
			input += examples[config.example as string];
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
