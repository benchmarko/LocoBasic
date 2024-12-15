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
    _fnOnPrint: ((_msg) => undefined), // eslint-disable-line @typescript-eslint/no-unused-vars
    _fnOnPrompt: ((_msg) => ""), // eslint-disable-line @typescript-eslint/no-unused-vars
    cls: () => {
        vm._output = "";
        vm._fnOnCls();
    },
    print(...args) {
        this._output += args.join('');
        if (this._output.endsWith("\n")) {
            this._fnOnPrint(this._output);
            this._output = "";
        }
    },
    prompt: (msg) => {
        return vm._fnOnPrompt(msg);
    },
    getOutput: () => vm._output,
    setOutput: (str) => vm._output = str,
    setOnCls: (fn) => vm._fnOnCls = fn,
    setOnPrint: (fn) => vm._fnOnPrint = fn,
    setOnPrompt: (fn) => vm._fnOnPrompt = fn
};
export class Core {
    constructor() {
        this.startConfig = {
            action: "compile,run",
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
    setOnPrint(fn) {
        vm.setOnPrint(fn);
    }
    setOnPrompt(fn) {
        vm.setOnPrompt(fn);
    }
    setOnCheckSyntax(fn) {
        this.onCheckSyntax = fn;
    }
    compileScript(script) {
        if (!this.arithmeticParser) {
            this.arithmeticParser = new Parser(arithmetic.grammar, this.semantics.getSemantics());
        }
        this.semantics.resetParser();
        return this.arithmeticParser.parseAndEval(script);
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
                output = "ERROR: ";
                if (error instanceof Error) {
                    output += this.vm.getOutput() + "\n" + String(error);
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
    putScriptInFrame(script) {
        const result = `(function(_o) {
	${script}
})({
	_output: "",
	cls: () => undefined,
	print(...args: string[]) { this._output += args.join(''); },
	prompt: (msg) => { console.log(msg); return ""; }
});`;
        return result;
    }
}
//# sourceMappingURL=Core.js.map