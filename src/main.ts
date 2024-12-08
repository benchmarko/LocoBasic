// main.ts
//
// Usage:
// node dist/locobasic.js input="?3 + 5 * (2 - 8)"
// node dist/locobasic.js fileName=dist/examples/example.bas
// node dist/locobasic.js example=euler
//
// [ npx ts-node parser.ts input="?3 + 5 * (2 - 8)" ]

import type { ConfigEntryType, ConfigType, ICore, IUi } from "./Interfaces";
import { Core } from "./Core";
import { Ui } from "./Ui";

const core: ICore = new Core();

let ui: IUi;


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
	//readFile: (name: string, encoding: string, fn: (res: any) => void) => any
	promises: any;
}

let fs: NodeFs;
let modulePath: string;

declare function require(name: string): any;

async function nodeReadFile(name: string): Promise<string> {
	if (!fs) {
		fs = require("fs");
	}

	if (!module) {
		module = require("module");
		modulePath = (module as any).path || "";

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
	if (input !== "") {
		const compiledScript = core.compileScript(input);

		console.log("INFO: Compiled:\n" + compiledScript + "\n---");

		return keepRunning(async () => {
			const output = await core.executeScript(compiledScript);
			console.log(output.replace(/\n$/, ""));
		}, 5000);
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
		console.log("start");
		start(input);
	}
}

const config = core.getConfigObject();

if (typeof window !== "undefined") {
	(window as any).cpcBasic = {
		addItem: addItem
	};
	window.onload = () => {
		ui = new Ui(core);

		const args = ui.parseUri(window.location.search.substring(1), config);
		fnParseArgs(args, config);

		core.setOnCls(() => ui.setOutputText(""));
		ui.onWindowLoad(new Event("onload"));
	}

} else {
	main(fnParseArgs(global.process.argv.slice(2), config));
}
