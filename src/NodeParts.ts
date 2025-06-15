//import { NodeWorker } from "inspector/promises";
import type { DatabaseType, ExampleType, ICore, INodeParts, MessageFromWorker, NodeWorkerType } from "./Interfaces";
import { NodeVmMain } from "./NodeVmMain";
//import { BasicVmNode } from "./BasicVmNode";

interface NodePath {
    dirname: (dirname: string) => string;
    resolve: (dirname: string, name: string) => string;
}

interface NodeFs {
    promises: {
        readFile(name: string, encoding: string): Promise<string>
    };
}

type nodeIncomingMessage = { on: (type: string, fn: (s: string) => void) => void };

interface NodeHttps {
    get: (url: string, fn: (res: nodeIncomingMessage) => void) => {
        on: (type: string, fn: (err: Error) => void) => NodeHttps;
    }
}

interface NodeReadline {
    emitKeypressEvents(stream: typeof process.stdin): void;
}

interface NodeVm {
    runInNewContext: (code: string) => string;
}

type NodeWorkerConstructorType = new (filename: string) => NodeWorkerType;
interface NodeWorkerThreads {
    parentPort: {
        postMessage: (message: MessageFromWorker) => void
    };
    Worker: NodeWorkerConstructorType;
}

type NodeKeyPressType = {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}

declare function require(name: string): NodeFs | NodeHttps | NodeModule | NodePath | NodeReadline | NodeVm | NodeWorkerThreads;

/*
interface DummyVm extends IVm {
    _snippetData: SnippetDataType;
    debug(...args: (string | number | boolean)[]): void;
}

// The functions from dummyVm will be stringified in the putScriptInFrame function
const dummyVm: DummyVm = {
    _snippetData: {} as SnippetDataType,
    debug(..._args: (string | number)[]) { / * console.debug(...args); * / }, // eslint-disable-line @typescript-eslint/no-unused-vars
    cls() { },
    drawMovePlot(type: string, x: number, y: number, pen?: number) { this.debug("drawMovePlot:", type, x, y, pen !== undefined ? pen : ""); },
    escapeText(str: string, isGraphics?: boolean) { return isGraphics ? str.replace(/&/g, "&amp;").replace(/</g, "&lt;") : str; },
    flush() { if (this._snippetData.output) { console.log(this._snippetData.output); this._snippetData.output = ""; } },
    graphicsPen(num: number) { this.debug("graphicsPen:", num); },
    ink(num: number, col: number) { this.debug("ink:", num, col); },
    async inkey$() { return Promise.resolve(""); },
    async input(msg: string) { console.log(msg); return ""; },
    keyDef(num: number, repeat: number, ...codes: number[]) { this.debug("keyDef:", num, repeat, codes.join(", ")); },
    mode(num: number) { this.debug("mode:", num); },
    origin(x: number, y: number) { this.debug("origin:", x, y); },
    paper(num: number) { this.debug("paper:", num); },
    pen(num: number) { this.debug("pen:", num); },
    printGraphicsText(text: string) { this.debug("printGraphicsText:", text); },
    rsx(cmd: string, args: (string | number)[]): Promise<(number | string)[]> { this._snippetData.output += cmd + "," + args.join(''); return Promise.resolve([]); },
    xpos() { this.debug("xpos:"); return 0; },
    ypos() { this.debug("ypos:"); return 0; },
    getEscape() { return false; },
    getSnippetData() { return this._snippetData; }
};
*/

function isUrl(s: string) {
    return s.startsWith("http"); // http or https
}

export class NodeParts implements INodeParts {
    private nodeVmMain: NodeVmMain;

    private nodeFs?: NodeFs;
    private nodeHttps?: NodeHttps;
    private nodePath?: NodePath;
    private nodeWorkerThreads?: NodeWorkerThreads;
    private modulePath = "";
    private nodeReadline?: NodeReadline;
    private readonly keyBuffer: string[] = []; // buffered pressed keys
    private escape = false;
    private fnOnKeyPressHandler?: (chunk: string, key: NodeKeyPressType) => void;

    constructor() {
        this.nodeVmMain = new NodeVmMain(this, "locoVmWorker.js");
    }

    private getNodeFs() {
        if (!this.nodeFs) {
            this.nodeFs = require("fs") as NodeFs;
        }
        return this.nodeFs;
    }

    private getNodeHttps() {
        if (!this.nodeHttps) {
            this.nodeHttps = require("https") as NodeHttps;
        }
        return this.nodeHttps;
    }

    private getNodePath() {
        if (!this.nodePath) {
            this.nodePath = require("path") as NodePath;
        }
        return this.nodePath;
    }

    private getNodeWorkerConstructor() {
        if (!this.nodeWorkerThreads) {
            this.nodeWorkerThreads = require('worker_threads') as NodeWorkerThreads;
        }
        return this.nodeWorkerThreads;
    }

    private nodeGetAbsolutePath(name: string) {
        const path = this.getNodePath();

        // https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
        const dirname = __dirname || path.dirname(__filename);
        const absolutePath = path.resolve(dirname, name);

        return absolutePath;
    }

    private async nodeReadFile(name: string): Promise<string> {
        const nodeFs = this.getNodeFs();

        if (!module) {
            const module = require("module") as NodeModule;
            this.modulePath = module.path || "";

            if (!this.modulePath) {
                console.warn("nodeReadFile: Cannot determine module path");
            }
        }
        try {
            return await nodeFs.promises.readFile(name, "utf8");
        } catch (error) {
            console.error(`Error reading file ${name}:`, String(error));
            throw error;
        }
    }

    private async nodeReadUrl(url: string): Promise<string> {
        const nodeHttps = this.getNodeHttps();

        return new Promise((resolve, reject) => {
            nodeHttps.get(url, (resp) => {
                let data = "";

                resp.on("data", (chunk: string) => {
                    data += chunk;
                });

                resp.on("end", () => {
                    resolve(data);
                });
            }).on("error", (err: Error) => {
                console.error("Error: " + err.message);
                reject(err);
            });
        });
    }

    public createNodeWorker(workerFile: string): NodeWorkerType {
        const nodeWorkerThreads = this.getNodeWorkerConstructor() as NodeWorkerThreads;
        const path = this.getNodePath();

        const worker = new nodeWorkerThreads.Worker(path.resolve(__dirname, workerFile));
        return worker;
    }

    private loadScript(fileOrUrl: string): Promise<string> {
        if (isUrl(fileOrUrl)) {
            return this.nodeReadUrl(fileOrUrl);
        } else {
            return this.nodeReadFile(fileOrUrl);
        }
    };

    private keepRunning(fn: () => void, timeout: number): Promise<void> {
        const timerId = setTimeout(() => { }, timeout);
        return (async () => {
            fn();
            clearTimeout(timerId);
        })();
    }

    private putScriptInFrame(script: string): string {
        const dummyVm = {}; //"TODO"; //TTT
        const dummyVmString = Object.entries(dummyVm).map(([key, value]) => {
            if (typeof value === "function") {
                return `${value}`;
            } else if (typeof value === "object") {
                return `${key}: ${JSON.stringify(value)}`;
            } else {
                return `${key}: "${value}"`;
            }
        }).join(",\n  ");
        const result =
            `(function(_o) {
    ${script}
})({
    ${dummyVmString}
});`
        return result;
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

    private putKeyInBuffer(key: string): void {
        this.keyBuffer.push(key);
    }

    private fnOnKeypress(_chunk: string, key: NodeKeyPressType) {
        if (key) {
            const keySequenceCode = key.sequence.charCodeAt(0);
            if (key.name === 'c' && key.ctrl === true) {
                // key: '<char>' { sequence: '\x03', name: 'c', ctrl: true, meta: false, shift: false }
                process.exit();
            } else if (key.name === "escape") {
                this.escape = true;
            } else if (keySequenceCode === 0x0d || (keySequenceCode >= 32 && keySequenceCode <= 128)) {
                this.putKeyInBuffer(key.sequence);
            }
        }
    }

    private initKeyboardInput(): void {
        this.nodeReadline = require('readline') as NodeReadline;

        if (process.stdin.isTTY) {
            this.nodeReadline.emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);

            this.fnOnKeyPressHandler = this.fnOnKeypress.bind(this);
            process.stdin.on('keypress', this.fnOnKeyPressHandler);
        } else {
            console.warn("initKeyboardInput: not a TTY", process.stdin);
        }
    }

    public getKeyFromBuffer(): string {
        if (!this.nodeReadline) {
            this.initKeyboardInput();
        }
        const key = this.keyBuffer.length ? this.keyBuffer.shift() as string : "";
        return key;
    }

    public getEscape(): boolean {
        return this.escape;
    }

    public consoleClear(): void {
        console.clear();
    }

    public consolePrint(msg: string): void {
        console.log(msg);
    }

    private start(core: ICore, input: string): Promise<void> | undefined {
        const actionConfig = core.getConfigMap().action;
        if (input !== "") {
            //core.setOnCheckSyntax((s: string) => Promise.resolve(this.nodeCheckSyntax(s)));

            const compiledScript = actionConfig.includes("compile") ? core.compileScript(input) : input;

            if (compiledScript.startsWith("ERROR:")) {
                console.error(compiledScript);
                return;
            }

            if (actionConfig.includes("run")) {
                return this.keepRunning(async () => {
                    //await core.executeScript(compiledScript, vm);
                    if (core.getConfigMap().debug) {
                        console.log("DEBUG: running compiled script...");
                    }
                    const output = await this.nodeVmMain.run(compiledScript);
                    console.log(output.replace(/\n$/, ""));
                    this.nodeVmMain.reset(); // terminate worker
                    if (this.fnOnKeyPressHandler) {
                        process.stdin.off('keypress', this.fnOnKeyPressHandler);
                        process.stdin.setRawMode(false);
                        process.exit(0); // hmm, not so nice
                    }
                }, 5000);
            } else {
                const inFrame = this.putScriptInFrame(compiledScript);
                console.log(inFrame);
            }
        } else {
            console.log("No input");
            console.log(NodeParts.getHelpString());
        }
    }

    private async getExampleMap(databaseItem: DatabaseType, core: ICore) {
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
        } catch (error) {
            console.error("Load Example Map ", scriptName, error);
        }
        return databaseItem.exampleMap;
    }

    private async getExampleScript(example: ExampleType, core: ICore) {
        if (example.script !== undefined) {
            return example.script;
        }
        const database = core.getDatabase();
        const scriptName = database.source + "/" + example.key + ".js";
        try {
            const jsFile = await this.loadScript(scriptName);
            const fnScript = new Function("cpcBasic", jsFile);
            fnScript({
                addItem: (key: string, input: string | (() => void)) => {
                    if (!key) { // maybe ""
                        key = example.key;
                    }
                    core.addItem(key, input);
                }
            });
        } catch (error) {
            console.error("Load Example", scriptName, error);
        }
        return example.script || ""; //TTT

    }

    public async nodeMain(core: ICore): Promise<void> {
        const config = core.getConfigMap();
        core.parseArgs(global.process.argv.slice(2), config);

        if (config.input) {
            return this.keepRunning(async () => {
                this.start(core, config.input);
            }, 5000);
        }

        if (config.fileName) {
            return this.keepRunning(async () => {
                const inputFromFile = await this.nodeReadFile(config.fileName);
                this.start(core, inputFromFile);
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
                if (example) {
                    const script = await this.getExampleScript(example, core);
                    this.start(core, script);
                } else {
                    console.error(`Error: Example not found: ${exampleName}`);
                }
            }, 5000);
        }
    }

    private static getHelpString(): string {
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
`;
    }
}
