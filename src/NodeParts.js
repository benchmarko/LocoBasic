// NodeParts.ts
// node.js specific parts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// The functions from dummyVm will be stringified in the putScriptInFrame function
const dummyVm = {
    _output: "",
    debug(..._args) { }, // eslint-disable-line @typescript-eslint/no-unused-vars
    cls() { },
    drawMovePlot(type, x, y) { this.debug("drawMovePlot:", type, x, y); },
    flush() { if (this._output) {
        console.log(this._output);
        this._output = "";
    } },
    graphicsPen(num) { this.debug("graphicsPen:", num); },
    mode(num) { this.debug("mode:", num); },
    paper(num) { this.debug("paper:", num); },
    pen(num) { this.debug("pen:", num); },
    print(...args) { this._output += args.join(''); },
    prompt(msg) { console.log(msg); return ""; }
};
export class NodeParts {
    constructor(core) {
        this.core = core;
        this.modulePath = "";
    }
    nodeReadFile(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.nodeFs) {
                this.nodeFs = require("fs");
            }
            if (!module) {
                const module = require("module");
                this.modulePath = module.path || "";
                if (!this.modulePath) {
                    console.warn("nodeReadFile: Cannot determine module path");
                }
            }
            try {
                return yield this.nodeFs.promises.readFile(name, "utf8");
            }
            catch (error) {
                console.error(`Error reading file ${name}:`, String(error));
                throw error;
            }
        });
    }
    keepRunning(fn, timeout) {
        const timerId = setTimeout(() => { }, timeout);
        return (() => __awaiter(this, void 0, void 0, function* () {
            fn();
            clearTimeout(timerId);
        }))();
    }
    putScriptInFrame(script) {
        const dummyFunctions = Object.values(dummyVm).filter((value) => value).map((value) => `${value}`).join(",\n  ");
        const result = `(function(_o) {
	${script}
})({
	_output: "",
	${dummyFunctions}
});`;
        return result;
    }
    nodeCheckSyntax(script) {
        if (!this.nodeVm) {
            this.nodeVm = require("vm");
        }
        const describeError = (stack) => {
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
            const scriptInFrame = this.putScriptInFrame(script);
            this.nodeVm.runInNewContext(`throw new Error();\n${scriptInFrame}`);
        }
        catch (err) { // Error-like object
            const stack = err.stack;
            if (stack) {
                output = describeError(stack);
            }
        }
        return output;
    }
    start(input) {
        const core = this.core;
        const actionConfig = core.getConfigObject().action;
        if (input !== "") {
            core.setOnCheckSyntax((s) => Promise.resolve(this.nodeCheckSyntax(s)));
            const compiledScript = actionConfig.includes("compile") ? core.compileScript(input) : input;
            if (compiledScript.startsWith("ERROR:")) {
                console.error(compiledScript);
                return;
            }
            if (actionConfig.includes("run")) {
                return this.keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                    const output = yield core.executeScript(compiledScript);
                    console.log(output.replace(/\n$/, ""));
                }), 5000);
            }
            else {
                const inFrame = this.putScriptInFrame(compiledScript);
                console.log(inFrame);
            }
        }
        else {
            console.log("No input");
        }
    }
    nodeMain() {
        return __awaiter(this, void 0, void 0, function* () {
            const core = this.core;
            const config = this.core.getConfigObject();
            let input = config.input || "";
            if (config.fileName) {
                return this.keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                    input = yield this.nodeReadFile(config.fileName);
                    this.start(input);
                }), 5000);
            }
            else {
                if (config.example) {
                    return this.keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                        const jsFile = yield this.nodeReadFile("./dist/examples/examples.js");
                        const fnScript = new Function("cpcBasic", jsFile);
                        fnScript({
                            addItem: core.addItem
                        });
                        const exampleScript = this.core.getExample(config.example);
                        if (!exampleScript) {
                            console.error(`ERROR: Example '${config.example}' not found.`);
                            return;
                        }
                        input = exampleScript;
                        this.start(input);
                    }), 5000);
                }
                this.start(input);
            }
        });
    }
}
//# sourceMappingURL=NodeParts.js.map