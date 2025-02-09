import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";
function fnHereDoc(fn) {
    return String(fn).replace(/^[^/]+\/\*\S*/, "").replace(/\*\/[^/]+$/, "");
}
export class Core {
    constructor(defaultConfig) {
        this.semantics = new Semantics();
        this.examples = {};
        this.onCheckSyntax = async (_s) => ""; // eslint-disable-line @typescript-eslint/no-unused-vars
        this.addItem = (key, input) => {
            let inputString = typeof input !== "string" ? fnHereDoc(input) : input;
            inputString = inputString.replace(/^\n/, "").replace(/\n$/, ""); // remove preceding and trailing newlines
            if (!key) { // maybe ""
                const firstLine = inputString.slice(0, inputString.indexOf("\n"));
                const matches = firstLine.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
                key = matches ? matches[1] : "unknown";
            }
            this.setExample(key, inputString);
        };
        this.config = defaultConfig;
    }
    setVm(vm) {
        this.vm = vm;
    }
    getConfigObject() {
        return this.config;
    }
    getExampleObject() {
        return this.examples;
    }
    setExample(name, script) {
        this.examples[name] = script;
    }
    getExample(name) {
        return this.examples[name];
    }
    setOnCheckSyntax(fn) {
        this.onCheckSyntax = fn;
    }
    compileScript(script) {
        if (!this.arithmeticParser) {
            const semantics = this.semantics.getSemantics();
            if (this.config.grammar === "strict") {
                const basicParser = new Parser(arithmetic.basicGrammar, semantics);
                this.arithmeticParser = new Parser(arithmetic.strictGrammar, semantics, basicParser);
            }
            else {
                this.arithmeticParser = new Parser(arithmetic.basicGrammar, semantics);
            }
        }
        this.semantics.resetParser();
        return this.arithmeticParser.parseAndEval(script);
    }
    async executeScript(compiledScript) {
        var _a, _b, _c, _d, _e, _f, _g;
        (_a = this.vm) === null || _a === void 0 ? void 0 : _a.setOutput("");
        if (compiledScript.startsWith("ERROR")) {
            return "ERROR";
        }
        const syntaxError = await this.onCheckSyntax(compiledScript);
        if (syntaxError) {
            (_b = this.vm) === null || _b === void 0 ? void 0 : _b.cls();
            return "ERROR: " + syntaxError;
        }
        try {
            const fnScript = new Function("_o", compiledScript);
            const result = fnScript(this.vm) || "";
            let output;
            if (result instanceof Promise) {
                output = await result;
                (_c = this.vm) === null || _c === void 0 ? void 0 : _c.flush();
                output = ((_d = this.vm) === null || _d === void 0 ? void 0 : _d.getOutput()) || "";
            }
            else {
                (_e = this.vm) === null || _e === void 0 ? void 0 : _e.flush();
                output = ((_f = this.vm) === null || _f === void 0 ? void 0 : _f.getOutput()) || "";
            }
            return output;
        }
        catch (error) {
            let errorMessage = "ERROR: ";
            if (error instanceof Error) {
                errorMessage += ((_g = this.vm) === null || _g === void 0 ? void 0 : _g.getOutput()) + "\n" + String(error);
                const anyErr = error;
                const lineNumber = anyErr.lineNumber; // only on FireFox
                const columnNumber = anyErr.columnNumber; // only on FireFox
                if (lineNumber || columnNumber) {
                    const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
                    errorMessage += ` (Line ${errLine}, column ${columnNumber})`;
                }
            }
            else {
                errorMessage += "unknown";
            }
            return errorMessage;
        }
    }
    parseArgs(args, config) {
        for (const arg of args) {
            const [name, ...valueParts] = arg.split("=");
            const nameType = typeof config[name];
            let value = valueParts.join("=");
            if (value !== undefined) {
                if (nameType === "boolean") {
                    value = value === "true";
                }
                else if (nameType === "number") {
                    value = Number(value);
                }
                config[name] = value;
            }
        }
        return config;
    }
}
//# sourceMappingURL=Core.js.map