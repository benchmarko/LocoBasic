// core.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";
const vm = {
    _output: "",
    _fnOnCls: (() => undefined),
    cls: () => {
        vm._output = "";
        vm._fnOnCls();
    },
    _convertPrintArg: (arg) => typeof arg !== "number" ? arg : arg >= 0 ? ` ${arg} ` : `${arg} `, // pad numbers with spaces
    print: (...args) => vm._output += args.map((arg) => vm._convertPrintArg(arg)).join(''),
    getOutput: () => vm._output,
    setOutput: (str) => vm._output = str,
    setOnCls: (fn) => vm._fnOnCls = fn
};
export class Core {
    constructor() {
        this.startConfig = {
            debug: 0,
            example: "",
            fileName: "",
            input: "",
            debounceCompile: 800,
            debounceExecute: 400
        };
        this.semantics = new Semantics();
        this.examples = {};
        this.vm = vm;
        this.onCheckSyntax = (_s) => __awaiter(this, void 0, void 0, function* () { return ""; }); // eslint-disable-line @typescript-eslint/no-unused-vars
    }
    getConfigObject() {
        return this.startConfig;
    }
    getConfig(name) {
        return this.startConfig[name];
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
    setOnCls(fn) {
        vm.setOnCls(fn);
    }
    setOnCheckSyntax(fn) {
        this.onCheckSyntax = fn;
    }
    compileScript(script) {
        if (!this.arithmeticParser) {
            this.arithmeticParser = new Parser(arithmetic.grammar, this.semantics.getSemantics());
        }
        this.semantics.resetParser();
        const compiledScript = this.arithmeticParser.parseAndEval(script);
        return compiledScript;
    }
    executeScript(compiledScript) {
        return __awaiter(this, void 0, void 0, function* () {
            this.vm.setOutput("");
            if (compiledScript.startsWith("ERROR")) {
                return "ERROR";
            }
            let output;
            output = yield this.onCheckSyntax(compiledScript);
            if (output) {
                vm.cls();
                return "ERROR: " + output;
            }
            try {
                const fnScript = new Function("_o", compiledScript);
                const result = fnScript(this.vm) || "";
                if (result instanceof Promise) {
                    output = yield result;
                    output = this.vm.getOutput() + output;
                }
                else {
                    output = this.vm.getOutput() + result;
                }
            }
            catch (error) {
                vm.cls();
                output = "ERROR: ";
                if (error instanceof Error) {
                    output += String(error);
                    const anyErr = error;
                    const lineNumber = anyErr.lineNumber; // only on FireFox
                    const columnNumber = anyErr.columnNumber; // only on FireFox
                    if (lineNumber || columnNumber) {
                        const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
                        output += ` (Line ${errLine}, column ${columnNumber})`;
                    }
                }
                else {
                    output += "unknown";
                }
            }
            return output;
        });
    }
}
//# sourceMappingURL=Core.js.map