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
    ink(num, col) { this.debug("ink:", num, col); },
    async inkey$() { return Promise.resolve(""); },
    async input(msg) { console.log(msg); return ""; },
    mode(num) { this.debug("mode:", num); },
    origin(x, y) { this.debug("origin:", x, y); },
    paper(num) { this.debug("paper:", num); },
    pen(num) { this.debug("pen:", num); },
    print(...args) { this._output += args.join(''); },
    tag(active) { this.debug("tag:", active); },
    getEscape() { return false; }
};
function isUrl(s) {
    return s.startsWith("http"); // http or https
}
export class NodeParts {
    constructor() {
        this.modulePath = "";
        this.keyBuffer = []; // buffered pressed keys
        this.escape = false;
    }
    nodeGetAbsolutePath(name) {
        if (!this.nodePath) {
            this.nodePath = require("path");
        }
        const path = this.nodePath;
        // https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
        const dirname = __dirname || path.dirname(__filename);
        const absolutePath = path.resolve(dirname, name);
        return absolutePath;
    }
    async nodeReadFile(name) {
        if (!this.nodeFs) {
            this.nodeFs = require("fs");
        }
        if (!module) { //TTT
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
    async nodeReadUrl(url) {
        if (!this.nodeHttps) {
            this.nodeHttps = require("https");
        }
        const nodeHttps = this.nodeHttps;
        return new Promise((resolve, reject) => {
            nodeHttps.get(url, (resp) => {
                let data = "";
                resp.on("data", (chunk) => {
                    data += chunk;
                });
                resp.on("end", () => {
                    resolve(data);
                });
            }).on("error", (err) => {
                console.error("Error: " + err.message);
                reject(err);
            });
        });
    }
    loadScript(fileOrUrl) {
        if (isUrl(fileOrUrl)) {
            return this.nodeReadUrl(fileOrUrl);
        }
        else {
            return this.nodeReadFile(fileOrUrl);
        }
    }
    ;
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
    fnOnKeypress(_chunk, key) {
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
    }
    initKeyboardInput() {
        this.nodeReadline = require('readline');
        if (process.stdin.isTTY) {
            this.nodeReadline.emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);
            this.fnOnKeyPressHandler = this.fnOnKeypress.bind(this);
            process.stdin.on('keypress', this.fnOnKeyPressHandler);
        }
        else {
            console.warn("initKeyboardInput: not a TTY", process.stdin);
        }
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
    start(core, vm, input) {
        const actionConfig = core.getConfigMap().action;
        if (input !== "") {
            core.setOnCheckSyntax((s) => Promise.resolve(this.nodeCheckSyntax(s)));
            const compiledScript = actionConfig.includes("compile") ? core.compileScript(input) : input;
            if (compiledScript.startsWith("ERROR:")) {
                console.error(compiledScript);
                return;
            }
            if (actionConfig.includes("run")) {
                return this.keepRunning(async () => {
                    const output = await core.executeScript(compiledScript, vm);
                    console.log(output.replace(/\n$/, ""));
                    if (this.fnOnKeyPressHandler) {
                        process.stdin.off('keypress', this.fnOnKeyPressHandler);
                        process.stdin.setRawMode(false);
                        process.exit(0); // hmm, not so nice
                    }
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
    async getExampleMap(databaseItem, core) {
        if (databaseItem.exampleMap) {
            return databaseItem.exampleMap;
        }
        databaseItem.exampleMap = {};
        const scriptName = databaseItem.source + "/0index.js";
        try {
            const jsFile = await this.loadScript(scriptName);
            const fnScript = new Function("cpcBasic", jsFile);
            fnScript({
                addIndex: core.addIndex
            });
        }
        catch (error) {
            console.error("Load Example Map ", scriptName, error);
        }
        return databaseItem.exampleMap;
    }
    async getExampleScript(example, core) {
        if (example.script !== undefined) {
            return example.script;
        }
        const database = core.getDatabase();
        const scriptName = database.source + "/" + example.key + ".js";
        try {
            const jsFile = await this.loadScript(scriptName);
            const fnScript = new Function("cpcBasic", jsFile);
            fnScript({
                addItem: (key, input) => {
                    if (!key) { // maybe ""
                        key = example.key;
                    }
                    core.addItem(key, input);
                }
            });
        }
        catch (error) {
            console.error("Load Example", scriptName, error);
        }
        return example.script || ""; //TTT
    }
    async nodeMain(core) {
        const vm = new BasicVmNode(this);
        const config = core.getConfigMap();
        core.parseArgs(global.process.argv.slice(2), config);
        if (config.input) {
            return this.keepRunning(async () => {
                this.start(core, vm, config.input);
            }, 5000);
        }
        if (config.fileName) {
            return this.keepRunning(async () => {
                const inputFromFile = await this.nodeReadFile(config.fileName);
                this.start(core, vm, inputFromFile);
            }, 5000);
        }
        if (config.example) {
            const databaseMap = core.initDatabaseMap();
            const database = config.database;
            const databaseItem = databaseMap[database];
            if (!databaseItem) {
                console.error(`Error: Database ${database} not found in ${config.databaseDirs}`);
                return;
            }
            return this.keepRunning(async () => {
                if (!isUrl(databaseItem.source)) {
                    databaseItem.source = this.nodeGetAbsolutePath(databaseItem.source);
                }
                await this.getExampleMap(databaseItem, core);
                const exampleName = config.example;
                const example = core.getExample(exampleName);
                const script = await this.getExampleScript(example, core);
                this.start(core, vm, script);
            }, 5000);
        }
    }
    static getHelpString() {
        return `
Usage:
node dist/locobasic.js [<option=<value(s)>] [<option=<value(s)>]

- Options:
action=compile,run
databaseDirs=examples,...
database=examples
debounceCompile=800
debounceExecute=400
debug=0
example=euler
fileName=<file>
grammar=<name>
input=<statements>

- Examples for compile and run:
node dist/locobasic.js input='PRINT "Hello!"'
npx ts-node dist/locobasic.js input='PRINT "Hello!"'
node dist/locobasic.js input='?3 + 5 * (2 - 8)' example=''
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