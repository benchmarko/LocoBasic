import { BasicVmNode } from "./BasicVmNode";
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
    async inkey$() { return Promise.resolve(""); },
    async input(msg) { console.log(msg); return ""; },
    mode(num) { this.debug("mode:", num); },
    paper(num) { this.debug("paper:", num); },
    pen(num) { this.debug("pen:", num); },
    print(...args) { this._output += args.join(''); },
    getEscape() { return false; }
};
export class NodeParts {
    constructor() {
        this.modulePath = "";
        this.keyBuffer = []; // buffered pressed keys
        this.escape = false;
    }
    async nodeReadFile(name) {
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
            return await this.nodeFs.promises.readFile(name, "utf8");
        }
        catch (error) {
            console.error(`Error reading file ${name}:`, String(error));
            throw error;
        }
    }
    keepRunning(fn, timeout) {
        const timerId = setTimeout(() => { }, timeout);
        return (async () => {
            fn();
            clearTimeout(timerId);
        })();
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
    putKeyInBuffer(key) {
        this.keyBuffer.push(key);
    }
    initKeyboardInput() {
        this.nodeReadline = require('readline');
        this.nodeReadline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        process.stdin.on('keypress', (_chunk, key) => {
            //console.log(`DEBUG: You pressed the key: '${_chunk}'`, key);
            if (key) {
                const keySequenceCode = key.sequence.charCodeAt(0);
                if (key.name === 'c' && key.ctrl === true) {
                    // key: '<char>' { sequence: '\x03', name: 'c', ctrl: true, meta: false, shift: false }
                    process.exit();
                }
                else if (key.name === "escape") {
                    this.escape = true;
                }
                else if (keySequenceCode === 0x0d || (keySequenceCode >= 32 && keySequenceCode <= 128)) {
                    this.putKeyInBuffer(key.sequence);
                }
            }
        });
    }
    getKeyFromBuffer() {
        if (!this.nodeReadline) {
            this.initKeyboardInput();
        }
        const key = this.keyBuffer.length ? this.keyBuffer.shift() : "";
        return key;
    }
    getEscape() {
        return this.escape;
    }
    start(core, input) {
        const actionConfig = core.getConfigObject().action;
        if (input !== "") {
            core.setOnCheckSyntax((s) => Promise.resolve(this.nodeCheckSyntax(s)));
            const compiledScript = actionConfig.includes("compile") ? core.compileScript(input) : input;
            if (compiledScript.startsWith("ERROR:")) {
                console.error(compiledScript);
                return;
            }
            if (actionConfig.includes("run")) {
                return this.keepRunning(async () => {
                    const output = await core.executeScript(compiledScript);
                    console.log(output.replace(/\n$/, ""));
                }, 5000);
            }
            else {
                const inFrame = this.putScriptInFrame(compiledScript);
                console.log(inFrame);
            }
        }
        else {
            console.log("No input");
            console.log(NodeParts.getHelpString());
        }
    }
    async nodeMain(core) {
        core.setVm(new BasicVmNode(this));
        const config = core.getConfigObject();
        core.parseArgs(global.process.argv.slice(2), config);
        let input = config.input || "";
        if (config.fileName) {
            return this.keepRunning(async () => {
                input = await this.nodeReadFile(config.fileName);
                this.start(core, input);
            }, 5000);
        }
        else {
            if (config.example) {
                return this.keepRunning(async () => {
                    const jsFile = await this.nodeReadFile("./dist/examples/examples.js");
                    const fnScript = new Function("cpcBasic", jsFile);
                    fnScript({
                        addItem: core.addItem
                    });
                    const exampleScript = core.getExample(config.example);
                    if (!exampleScript) {
                        console.error(`ERROR: Example '${config.example}' not found.`);
                        return;
                    }
                    input = exampleScript;
                    this.start(core, input);
                }, 5000);
            }
            this.start(core, input);
        }
    }
    static getHelpString() {
        return `
Usage:
node dist/locobasic.js [action='compile,run'] [input=<statements>] [example=<name>] [fileName=<file>] [grammar=<name>] [debug=0] [debounceCompile=800] [debounceExecute=400]

- Examples for compile and run:
node dist/locobasic.js input='PRINT "Hello!"'
npx ts-node dist/locobasic.js input='PRINT "Hello!"'
node dist/locobasic.js input='?3 + 5 * (2 - 8)'
node dist/locobasic.js example=euler
node dist/locobasic.js fileName=dist/examples/example.bas
node dist/locobasic.js grammar='strict' input='a$="Bob":PRINT "Hello ";a$;"!"'

- Example for compile only:
node dist/locobasic.js action='compile' input='PRINT "Hello!"' > hello1.js
[Windows: Use node.exe when redirecting into a file; or npx ts-node ...]
node hello1.js
[When using async functions like FRAME or INPUT, redirect to hello1.mjs]
`;
    }
}
//# sourceMappingURL=NodeParts.js.map