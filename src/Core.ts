import type { ConfigEntryType, ConfigType, ICore, IVm, IVmAdmin } from "./Interfaces";
import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";

function fnHereDoc(fn: () => void) {
    return String(fn).replace(/^[^/]+\/\*\S*/, "").replace(/\*\/[^/]+$/, "");
}

export class Core implements ICore {
    private config: ConfigType;
    private vm?: IVmAdmin;
    private readonly semantics = new Semantics();
    private readonly examples: Record<string, string> = {};
    private arithmeticParser: Parser | undefined;

    constructor(defaultConfig: ConfigType) {
        this.config = defaultConfig;
    }

    public setVm(vm: IVmAdmin): void {
        this.vm = vm;
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

    public async executeScript(compiledScript: string): Promise<string> {
        this.vm?.setOutput("");

        if (compiledScript.startsWith("ERROR")) {
            return "ERROR";
        }

        const syntaxError = await this.onCheckSyntax(compiledScript);
        if (syntaxError) {
            this.vm?.cls();
            return "ERROR: " + syntaxError;
        }

        try {
            const fnScript = new Function("_o", compiledScript);
            const result = fnScript(this.vm as IVm) || "";

            let output: string;
            if (result instanceof Promise) {
                output = await result;
                this.vm?.flush();
                output = this.vm?.getOutput() || "";
            } else {
                this.vm?.flush();
                output = this.vm?.getOutput() || "";
            }
            return output;
        } catch (error) {
            let errorMessage = "ERROR: ";
            if (error instanceof Error) {
                errorMessage += this.vm?.getOutput() + "\n" + String(error);

                const anyErr = error as unknown as Record<string, number>;
                const lineNumber = anyErr.lineNumber; // only on FireFox
                const columnNumber = anyErr.columnNumber; // only on FireFox

                if (lineNumber || columnNumber) {
                    const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
                    errorMessage += ` (Line ${errLine}, column ${columnNumber})`;
                }
            } else {
                errorMessage += "unknown";
            }
            return errorMessage;
        }
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
