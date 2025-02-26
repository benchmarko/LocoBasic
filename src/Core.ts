import type { ConfigEntryType, ConfigType, ICore, IVm, IVmAdmin } from "./Interfaces";
import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";

function fnHereDoc(fn: () => void) {
    return String(fn).replace(/^[^/]+\/\*\S*/, "").replace(/\*\/[^/]+$/, "");
}

export class Core implements ICore {
    private config: ConfigType;
    private readonly semantics = new Semantics();
    private readonly examples: Record<string, string> = {};
    private arithmeticParser: Parser | undefined;

    constructor(defaultConfig: ConfigType) {
        this.config = defaultConfig;
    }

    private onCheckSyntax = async (_s: string) => ""; // eslint-disable-line @typescript-eslint/no-unused-vars

    public getConfigObject(): ConfigType {
        return this.config;
    }

    public getExampleObject(): Record<string, string> {
        return this.examples;
    }

    public setExample(name: string, script: string): void {
        this.examples[name] = script;
    }

    public getExample(name: string): string {
        return this.examples[name];
    }

    public setOnCheckSyntax(fn: (s: string) => Promise<string>): void {
        this.onCheckSyntax = fn;
    }

    public compileScript(script: string): string {
        if (!this.arithmeticParser) {
            const semantics = this.semantics.getSemantics();
            if (this.config.grammar === "strict") {
                const basicParser = new Parser(arithmetic.basicGrammar, semantics);
                this.arithmeticParser = new Parser(arithmetic.strictGrammar, semantics, basicParser);
            } else {
                this.arithmeticParser = new Parser(arithmetic.basicGrammar, semantics);
            }
        }
        this.semantics.resetParser();
        return this.arithmeticParser.parseAndEval(script);
    }

    public async executeScript(compiledScript: string, vm: IVmAdmin): Promise<string> {
        vm.setOutput("");

        if (compiledScript.startsWith("ERROR")) {
            return "ERROR";
        }

        const syntaxError = await this.onCheckSyntax(compiledScript);
        if (syntaxError) {
            vm.cls();
            return "ERROR: " + syntaxError;
        }

        let output = "";
        try {
            const fnScript = new Function("_o", compiledScript);
            const result = fnScript(vm as IVm) || "";

            if (result instanceof Promise) {
                output = await result;
                vm.flush();
                output = vm.getOutput() || "";
            } else {
                vm.flush();
                output = vm.getOutput() || "";
            }
        } catch (error) {
            output = vm.getOutput() || "";
            if (output) {
                output += "\n";
            }
            output += String(error).replace("Error: INFO: ", "INFO: ");
            if (error instanceof Error) {
                const anyErr = error as unknown as Record<string, number>;
                const lineNumber = anyErr.lineNumber; // only on FireFox
                const columnNumber = anyErr.columnNumber; // only on FireFox

                if (lineNumber || columnNumber) {
                    const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
                    output += ` (Line ${errLine}, column ${columnNumber})`;
                }
            }
        }
        return output;
    }

    public addItem = (key: string, input: string | (() => void)): void => { // need property function because we need bound "this"
        let inputString = typeof input !== "string" ? fnHereDoc(input) : input;
        inputString = inputString.replace(/^\n/, "").replace(/\n$/, ""); // remove preceding and trailing newlines

        if (!key) { // maybe ""
            const firstLine = inputString.slice(0, inputString.indexOf("\n"));
            const matches = firstLine.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
            key = matches ? matches[1] : "unknown";
        }

        this.setExample(key, inputString);
    };

    public parseArgs(args: string[], config: Record<string, ConfigEntryType>): Record<string, ConfigEntryType> {
        for (const arg of args) {
            const [name, ...valueParts] = arg.split("=");
            const nameType = typeof config[name];

            let value: ConfigEntryType = valueParts.join("=");
            if (value !== undefined) {
                if (nameType === "boolean") {
                    value = value === "true";
                } else if (nameType === "number") {
                    value = Number(value);
                }
                config[name] = value;
            }
        }
        return config;
    }
}
