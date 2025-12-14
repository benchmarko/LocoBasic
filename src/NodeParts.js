import { NodeVmMain } from "./NodeVmMain";
function isUrl(s) {
    return s.startsWith("http"); // http or https
}
export class NodeParts {
    constructor() {
        this.locoVmWorkerName = "";
        this.modulePath = "";
        this.keyBuffer = []; // buffered pressed keys
        this.escape = false;
    }
    getNodeFs() {
        if (!this.nodeFs) {
            this.nodeFs = require("fs");
        }
        return this.nodeFs;
    }
    getNodeHttps() {
        if (!this.nodeHttps) {
            this.nodeHttps = require("https");
        }
        return this.nodeHttps;
    }
    getNodePath() {
        if (!this.nodePath) {
            this.nodePath = require("path");
        }
        return this.nodePath;
    }
    getNodeWorkerConstructor() {
        if (!this.nodeWorkerThreads) {
            this.nodeWorkerThreads = require('worker_threads');
        }
        return this.nodeWorkerThreads;
    }
    nodeGetAbsolutePath(name) {
        const path = this.getNodePath();
        // https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
        const dirname = __dirname || path.dirname(__filename);
        const absolutePath = path.resolve(dirname, name);
        return absolutePath;
    }
    async nodeReadFile(name) {
        const nodeFs = this.getNodeFs();
        if (!module) {
            const module = require("module");
            this.modulePath = module.path || "";
            if (!this.modulePath) {
                console.warn("nodeReadFile: Cannot determine module path");
            }
        }
        try {
            return await nodeFs.promises.readFile(name, "utf8");
        }
        catch (error) {
            console.error(`Error reading file ${name}:`, String(error));
            throw error;
        }
    }
    async nodeReadUrl(url) {
        const nodeHttps = this.getNodeHttps();
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
    createNodeWorker(workerFile) {
        const nodeWorkerThreads = this.getNodeWorkerConstructor();
        const path = this.getNodePath();
        const worker = new nodeWorkerThreads.Worker(path.resolve(__dirname, workerFile));
        return worker;
    }
    getNodeWorkerFn(workerFile) {
        const path = this.getNodePath();
        const workerFnPath = path.resolve(__dirname, workerFile);
        const workerFn = require(workerFnPath);
        return workerFn;
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
    /* TODO
    private nodeCheckSyntax(script: string): string {
        if (!this.nodeVm) {
            this.nodeVm = require("vm") as NodeVm;
        }

        const describeError = (stack: string): string => {
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
        } catch (err) { // Error-like object
            const stack = (err as Error).stack;
            if (stack) {
                output = describeError(stack);
            }
        }
        return output;
    }
    */
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
    consoleClear() {
        console.clear();
    }
    consolePrint(msg) {
        console.log(msg);
    }
    getNodeVmMain() {
        if (!this.nodeVmMain) {
            this.nodeVmMain = new NodeVmMain(this, this.locoVmWorkerName);
        }
        return this.nodeVmMain;
    }
    async startRun(core, compiledScript) {
        if (core.getConfigMap().debug) {
            console.log("DEBUG: running compiled script...");
        }
        const nodeVmMain = this.getNodeVmMain();
        const output = await nodeVmMain.run(compiledScript);
        console.log(output.replace(/\n$/, ""));
        nodeVmMain.reset(); // terminate worker
        if (this.fnOnKeyPressHandler) {
            process.stdin.off('keypress', this.fnOnKeyPressHandler);
            process.stdin.setRawMode(false);
            process.exit(0); // hmm, not so nice
        }
    }
    start(core, input) {
        const actionConfig = core.getConfigMap().action;
        //core.setOnCheckSyntax((s: string) => Promise.resolve(this.nodeCheckSyntax(s)));
        const needCompile = actionConfig.includes("compile");
        const { compiledScript, messages } = needCompile ? core.compileScript(input) : {
            compiledScript: input,
            messages: []
        };
        if (compiledScript.startsWith("ERROR:")) {
            console.error(compiledScript);
            return;
        }
        if (messages) {
            console.log(messages.join("\n"));
        }
        if (actionConfig.includes("run")) {
            return this.keepRunning(async () => {
                return this.startRun(core, compiledScript);
            }, 5000);
        }
        else { // compile only: output standalone script
            const workerFn = this.getNodeWorkerFn(this.locoVmWorkerName);
            const usedInstrMap = core.getSemantics().getHelper().getInstrMap();
            const inFrame = core.createStandaloneScript(workerFn, compiledScript, Object.keys(usedInstrMap));
            console.log(inFrame);
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
        return example.script || "";
    }
    async nodeMain(core, locoVmWorkerName) {
        const config = core.getConfigMap();
        core.parseArgs(global.process.argv.slice(2), config);
        this.locoVmWorkerName = locoVmWorkerName;
        if (config.input) {
            return this.keepRunning(async () => {
                this.start(core, config.input);
            }, 5000);
        }
        else if (config.fileName) {
            return this.keepRunning(async () => {
                const inputFromFile = await this.nodeReadFile(config.fileName);
                this.start(core, inputFromFile);
            }, 5000);
        }
        else if (config.example) {
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
                if (example) {
                    const script = await this.getExampleScript(example, core);
                    this.start(core, script);
                }
                else {
                    console.error(`Error: Example not found: ${exampleName}`);
                }
            }, 5000);
        }
        else {
            console.log(NodeParts.getHelpString());
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
node dist/locobasic.js example=abelian
node dist/locobasic.js example=archidr0 > test1.svg
node dist/locobasic.js example=binary database=rosetta databaseDirs=examples,https://benchmarko.github.io/CPCBasicApps/apps,https://benchmarko.github.io/CPCBasicApps/rosetta
node dist/locobasic.js grammar='strict' input='a$="Bob":PRINT "Hello ";a$;"!"'
node dist/locobasic.js fileName=dist/examples/example.bas  (if you have an example.bas file)

- Example for compile only:
node dist/locobasic.js action='compile' input='PRINT "Hello!"' > hello1.js
[Windows: Use node.exe when redirecting into a file; or npx ts-node ...]
node hello1.js
[When using async functions like FRAME or INPUT, redirect to hello1.mjs]
- Combined:
node dist/locobasic.js example=testpage action=compile | node
`;
    }
}
//# sourceMappingURL=NodeParts.js.map