import type { DatabaseType, ExampleType, ICore, MessageFromWorker, NodeWorkerFnType, NodeWorkerType } from "./Interfaces";
import { NodeVmMain } from "./NodeVmMain";
import { VmMessageHandlerCallbacks } from "./VmMessageHandler";

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

declare function require(name: string): NodeFs | NodeHttps | NodeModule | NodePath | NodeReadline | NodeVm | NodeWorkerThreads | NodeWorkerFnType;

export class NodeParts {
    private nodeVmMain?: NodeVmMain;
    private locoVmWorkerName = "";
    private readonly loadedNodeModules: Record<string, ReturnType<typeof require>> = {};
    private modulePath = "";
    private fnOnKeyPressHandler?: (chunk: string, key: NodeKeyPressType) => void;

    private getNodeModule<T>(module: string): T {
        if (!this.loadedNodeModules[module]) {
            this.loadedNodeModules[module] = require(module);
        }
        return this.loadedNodeModules[module] as T;
    }

    private getNodePath() {
        return this.getNodeModule<NodePath>("path");
    }

    private nodeGetAbsolutePath(name: string) {
        const path = this.getNodePath();

        // https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
        const dirname = __dirname || path.dirname(__filename);
        return path.resolve(dirname, name); // absolute path
    }

    private async nodeReadFile(name: string): Promise<string> {
        const nodeFs = this.getNodeModule<NodeFs>("fs");

        if (!module) {
            const module = this.getNodeModule<NodeModule>("module");
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
        const nodeHttps = this.getNodeModule<NodeHttps>("https");

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

    private createNodeWorker(): NodeWorkerType {
        const nodeWorkerThreads = this.getNodeModule<NodeWorkerThreads>("worker_threads");
        const path = this.getNodePath();

        return new nodeWorkerThreads.Worker(path.resolve(__dirname, this.locoVmWorkerName));
    }

    private getNodeWorkerFn(workerFile: string): NodeWorkerFnType {
        const path = this.getNodePath();
        const workerFnPath = path.resolve(__dirname, workerFile);
        return this.getNodeModule<NodeWorkerFnType>(workerFnPath);
    }

    private static isUrl(s: string) {
        return s.startsWith("http"); // http or https
    }

    private loadScript(fileOrUrl: string): Promise<string> {
        return NodeParts.isUrl(fileOrUrl) ? this.nodeReadUrl(fileOrUrl) : this.nodeReadFile(fileOrUrl);
    };

    private keepRunning(fn: () => void, timeout: number): Promise<void> {
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

    private fnOnKeypress(_chunk: string, key: NodeKeyPressType) {
        if (key) {
            const keySequenceCode = key.sequence.charCodeAt(0);
            if (key.name === 'c' && key.ctrl === true) {
                // key: '<char>' { sequence: '\x03', name: 'c', ctrl: true, meta: false, shift: false }
                process.exit();
            } else if (key.name === "escape") {
                this.getNodeVmMain().stop(); // request stop
            } else if (keySequenceCode === 0x0d || (keySequenceCode >= 32 && keySequenceCode <= 128)) {
                //this.putKeyInBuffer(key.sequence);
                this.getNodeVmMain().putKeys(key.sequence);
            }
        }
    }

    private initKeyboardInput() {
        const nodeReadline = this.getNodeModule<NodeReadline>("readline");

        if (process.stdin.isTTY) {
            nodeReadline.emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);

            this.fnOnKeyPressHandler = this.fnOnKeypress.bind(this);
            process.stdin.on('keypress', this.fnOnKeyPressHandler);
        } else {
            console.warn("initKeyboardInput: not a TTY", process.stdin);
        }
    }

    private createMessageHandlerCallbacks() {
        const callbacks: VmMessageHandlerCallbacks = {
            onFlush: (message: string, needCls?: boolean) => {
                if (needCls) {
                    console.clear();
                }
                console.log(message);
            },
            onInput: (prompt: string) => {
                console.log(prompt);
                const input = ""; //TODO
                return Promise.resolve(input);
            },
            onGeolocation: async () => {
                // TODO
                return '';
            },
            onSpeak: async () => {
                // TODO
            },
            onKeyDef: () => {
                //TODO
            }
        };
        return callbacks;
    }

    private getNodeVmMain() {
        if (!this.nodeVmMain) {
            const messageHandlerCallbacks = this.createMessageHandlerCallbacks();
            this.nodeVmMain = new NodeVmMain(messageHandlerCallbacks, () => this.createNodeWorker());
        }
        return this.nodeVmMain;
    }

    private async startRun(core: ICore, compiledScript: string, usedInstrMap: Record<string, number>) {
        if (core.getConfigMap().debug) {
            console.log("DEBUG: running compiled script...");
        }

        if (usedInstrMap["inkey$"]) { // do we need inkey$
            this.initKeyboardInput();
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

    private start(core: ICore, input: string): Promise<void> | undefined {
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

        const usedInstrMap = core.getSemantics().getHelper().getInstrMap();
        if (actionConfig.includes("run")) {
            return this.keepRunning(async () => {
                return this.startRun(core, compiledScript, usedInstrMap);
            }, 5000);
        } else { // compile only: output standalone script
            const workerFn = this.getNodeWorkerFn(this.locoVmWorkerName);
            const inFrame = core.createStandaloneScript(workerFn, compiledScript, Object.keys(usedInstrMap));
            console.log(inFrame);
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
        return example.script || "";

    }

    public async nodeMain(core: ICore, locoVmWorkerName: string): Promise<void> {
        const config = core.getConfigMap();
        core.parseArgs(global.process.argv.slice(2), config);
        this.locoVmWorkerName = locoVmWorkerName;

        if (config.input) {
            return this.keepRunning(async () => {
                this.start(core, config.input);
            }, 5000);

        } else if (config.fileName) {
            return this.keepRunning(async () => {
                const inputFromFile = await this.nodeReadFile(config.fileName);
                this.start(core, inputFromFile);
            }, 5000);

        } else if (config.example) {
            const databaseMap = core.initDatabaseMap();
            const database = config.database;
            const databaseItem = databaseMap[database];

            if (!databaseItem) {
                console.error(`Error: Database ${database} not found in ${config.databaseDirs}`);
                return;
            }

            return this.keepRunning(async () => {
                if (!NodeParts.isUrl(databaseItem.source)) {
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
        } else {
            console.log(NodeParts.getHelpString());
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
node dist/locobasic.js example=abelian1
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
