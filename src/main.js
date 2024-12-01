// main.ts
//
// Usage:
// node dist/locobasic.js input="?3 + 5 * (2 - 8)"
// node dist/locobasic.js fileName=dist/examples/example.bas
// node dist/locobasic.js example=euler
//
// [ npx ts-node parser.ts input="?3 + 5 * (2 - 8)" ]
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Core } from "./Core";
import { Ui } from "./Ui";
const core = new Core();
let ui;
function fnHereDoc(fn) {
    return String(fn).
        replace(/^[^/]+\/\*\S*/, "").
        replace(/\*\/[^/]+$/, "");
}
function addItem(key, input) {
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
let fs;
let modulePath;
function nodeReadFile(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs) {
            fs = require("fs");
        }
        if (!module) {
            module = require("module");
            modulePath = module.path || "";
            if (!modulePath) {
                console.warn("nodeReadFile: Cannot determine module path");
            }
        }
        return fs.promises.readFile(name, "utf8");
    });
}
function fnParseArgs(args, config) {
    for (let i = 0; i < args.length; i += 1) {
        const [name, ...valueParts] = args[i].split("="), nameType = typeof config[name];
        let value = valueParts.join("=");
        if (value !== undefined) {
            if (nameType === "boolean") {
                value = (value === "true");
            }
            else if (nameType === "number") {
                value = Number(value);
            }
            config[name] = value;
        }
    }
    return config;
}
function keepRunning(fn, timeout) {
    const timerId = setTimeout(() => { }, timeout);
    return (() => __awaiter(this, void 0, void 0, function* () {
        fn();
        clearTimeout(timerId);
    }))();
}
function start(input) {
    if (input !== "") {
        const compiledScript = core.compileScript(input);
        console.log("INFO: Compiled:\n" + compiledScript + "\n");
        return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
            const output = yield core.executeScript(compiledScript);
            console.log(output);
        }), 5000);
    }
    else {
        console.log("No input");
    }
}
function main(config) {
    let input = config.input || "";
    if (config.fileName) {
        return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
            input = yield nodeReadFile(config.fileName);
            start(input);
        }), 5000);
    }
    else {
        if (config.example) {
            const examples = core.getExampleObject();
            if (!Object.keys(examples).length) {
                return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                    const jsFile = yield nodeReadFile("./dist/examples/examples.js");
                    // ?? require('./examples/examples.js');
                    const fnScript = new Function("cpcBasic", jsFile);
                    fnScript({
                        addItem: addItem
                    });
                    input = examples[config.example];
                    start(input);
                }), 5000);
            }
            input += examples[config.example];
        }
        console.log("start");
        start(input);
    }
}
const config = core.getConfigObject();
if (typeof window !== "undefined") {
    window.cpcBasic = {
        addItem: addItem
    };
    window.onload = () => {
        ui = new Ui(core);
        const args = ui.parseUri(window.location.search.substring(1), config);
        fnParseArgs(args, config);
        core.setOnCls(() => ui.setOutputText(""));
        ui.onWindowLoad(new Event("onload"));
    };
}
else {
    main(fnParseArgs(global.process.argv.slice(2), config));
}
//# sourceMappingURL=main.js.map