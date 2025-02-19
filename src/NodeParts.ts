import { ICore, IVm } from "./Interfaces";

interface NodeFs {
    promises: {
        readFile(name: string, encoding: string): Promise<string>
    };
}

interface NodeVm {
    runInNewContext: (code: string) => string;
}

declare function require(name: string): NodeModule | NodeFs | NodeVm;

interface DummyVm extends IVm {
    _output: string;
    debug(...args: (string | number)[]): void;
}

// The functions from dummyVm will be stringified in the putScriptInFrame function
const dummyVm: DummyVm = {
    _output: "",
    debug(..._args: (string | number)[]) { /* console.debug(...args); */ }, // eslint-disable-line @typescript-eslint/no-unused-vars
    cls() {},
    drawMovePlot(type: string, x: number, y: number) { this.debug("drawMovePlot:", type, x, y); },
    flush() { if (this._output) { console.log(this._output); this._output = ""; } },
    graphicsPen(num: number) { this.debug("graphicsPen:", num); },
    mode(num: number) { this.debug("mode:", num); },
    paper(num: number) { this.debug("paper:", num); },
    pen(num: number) { this.debug("pen:", num); },
    print(...args: (string | number)[]) { this._output += args.join(''); },
    async prompt(msg: string) { console.log(msg); return ""; }
};

export class NodeParts {
    private core: ICore;
    private nodeFs?: NodeFs;
    private modulePath: string;
    private nodeVm?: NodeVm;

    constructor(core: ICore) {
        this.core = core;
        this.modulePath = "";
    }

    private async nodeReadFile(name: string): Promise<string> {
        if (!this.nodeFs) {
            this.nodeFs = require("fs") as NodeFs;
        }

        if (!module) {
            const module = require("module") as NodeModule;
            this.modulePath = module.path || "";

            if (!this.modulePath) {
                console.warn("nodeReadFile: Cannot determine module path");
            }
        }
        try {
            return await this.nodeFs.promises.readFile(name, "utf8");
        } catch (error) {
            console.error(`Error reading file ${name}:`, String(error));
            throw error;
        }
    }

    private keepRunning(fn: () => void, timeout: number): Promise<void> {
        const timerId = setTimeout(() => { }, timeout);
        return (async () => {
            fn();
            clearTimeout(timerId);
        })();
    }

    private putScriptInFrame(script: string): string {
        const dummyFunctions = Object.values(dummyVm).filter((value) => value).map((value) => `${value}`).join(",\n  ");
        const result =
            `(function(_o) {
                ${script}
            })({
                _output: "",
                ${dummyFunctions}
            });`
        return result;
    }

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

    private start(input: string): Promise<void> | undefined {
        const core = this.core;
        const actionConfig = core.getConfigObject().action;
        if (input !== "") {
            core.setOnCheckSyntax((s: string) => Promise.resolve(this.nodeCheckSyntax(s)));

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
            } else {
                const inFrame = this.putScriptInFrame(compiledScript);
                console.log(inFrame);
            }
        } else {
            console.log("No input");
            console.log(NodeParts.getHelpString());
        }
    }

    public async nodeMain(): Promise<void> {
        const core = this.core;
        const config = this.core.getConfigObject();
        let input = config.input || "";

        if (config.fileName) {
            return this.keepRunning(async () => {
                input = await this.nodeReadFile(config.fileName);
                this.start(input);
            }, 5000);
        } else {
            if (config.example) {
                return this.keepRunning(async () => {
                    const jsFile = await this.nodeReadFile("./dist/examples/examples.js");
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
                }, 5000);
            }
            this.start(input);
        }
    }

    private static getHelpString(): string {
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
