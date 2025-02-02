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
//TTT: should not be here:
const colorsForPens = [
    "#000080", //  1 Navy
    "#FFFF00", // 24 Bright Yellow
    "#00FFFF", // 20 Bright Cyan
    "#FF0000", //  6 Bright Red
    "#FFFFFF", // 26 Bright White
    "#000000", //  0 Black
    "#0000FF", //  2 Bright Blue
    "#FF00FF", //  8 Bright Magenta
    "#008080", // 10 Cyan
    "#808000", // 12 Yellow
    "#8080FF", // 14 Pastel Blue
    "#FF8080", // 16 Pink
    "#00FF00", // 18 Bright Green
    "#80FF80", // 22 Pastel Green
    "#000080", //  1 Navy (repeated)
    "#FF8080", // 16 Pink (repeated)
    "#000080" //  1 Navy (repeated)
];
const strokeWidthForMode = [4, 2, 1, 1];
const vm = {
    _output: "",
    _lastPaper: -1,
    _lastPen: -1,
    _mode: 2,
    _paperColors: [],
    _penColors: [],
    _graphicsBuffer: [],
    _graphicsPathBuffer: [],
    _graphicsPen: 1,
    _graphicsX: 0,
    _graphicsY: 0,
    _fnOnCls: (() => undefined),
    _fnOnPrint: ((_msg) => undefined), // eslint-disable-line @typescript-eslint/no-unused-vars
    _fnOnPrompt: ((_msg) => ""), // eslint-disable-line @typescript-eslint/no-unused-vars
    cls: () => {
        vm._output = "";
        vm._lastPaper = -1;
        vm._lastPen = -1;
        vm._graphicsBuffer.length = 0;
        vm._graphicsPathBuffer.length = 0;
        vm._graphicsPen = -1;
        vm._graphicsX = 0;
        vm._graphicsY = 0;
        vm._fnOnCls();
    },
    drawMovePlot: (type, x, y) => {
        x = Math.round(x);
        y = Math.round(y);
        let svgPathCmd = "";
        switch (type) {
            case "L":
            case "M":
                y = 399 - y;
                svgPathCmd = `${type}${x} ${y}`;
                break;
            case "P":
                y = 399 - y;
                svgPathCmd = `M${x} ${y}h1v1h-1v-1`;
                //or circle: vm.flushGraphicsPath(); svgPathCmd = ""; vm._graphicsBuffer.push(`<circle cx="${x}" cy="${y}" r="${strokeWidthForMode[vm._mode]}" stroke="${colorsForPens[vm._graphicsPen]}" />`);
                //or rect (slow): vm.flushGraphicsPath(); svgPathCmd = ""; vm._graphicsBuffer.push(`<rect x="${x}" y="${y}" width="${strokeWidthForMode[vm._mode]}" height="${strokeWidthForMode[vm._mode]}" fill="${colorsForPens[vm._graphicsPen]}" />`);
                break;
            case "l":
            case "m":
                y = -y;
                svgPathCmd = `${type}${x} ${y}`;
                x = vm._graphicsX + x;
                y = vm._graphicsY + y;
                break;
            case "p":
                y = -y;
                svgPathCmd = `m${x} ${y}h1v1h-1v-1`;
                x = vm._graphicsX + x;
                y = vm._graphicsY + y;
                break;
            default:
                console.error(`drawMovePlot: Unknown type: ${type}`);
                break;
        }
        if (svgPathCmd) {
            if (!vm._graphicsPathBuffer.length && svgPathCmd[0] !== "M") {
                // avoid 'Error: <path> attribute d: Expected moveto path command ('M' or 'm')'
                vm._graphicsPathBuffer.push(`M${vm._graphicsX} ${vm._graphicsY}`);
            }
            vm._graphicsPathBuffer.push(svgPathCmd);
        }
        vm._graphicsX = x;
        vm._graphicsY = y;
    },
    flushGraphicsPath: () => {
        if (vm._graphicsPathBuffer.length) {
            vm._graphicsBuffer.push(`<path stroke="${colorsForPens[vm._graphicsPen]}" d="${vm._graphicsPathBuffer.join("")}" />`);
            vm._graphicsPathBuffer.length = 0;
        }
    },
    flush: () => {
        vm.flushGraphicsPath();
        if (vm._graphicsBuffer.length) {
            vm._output += `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" stroke-width="${strokeWidthForMode[vm._mode]}px" stroke="currentColor">${vm._graphicsBuffer.join("\n")}" /> </svg>\n`;
            vm._graphicsBuffer.length = 0;
        }
        if (vm._output) {
            vm._fnOnPrint(vm._output);
            vm._output = "";
        }
    },
    graphicsPen: (num) => {
        if (num === vm._graphicsPen) {
            return;
        }
        vm.flushGraphicsPath();
        vm._graphicsPen = num;
    },
    mode: (num) => {
        vm._mode = num;
        vm.cls();
    },
    paper(n) {
        if (n !== this._lastPaper) {
            this._output += this._paperColors[n];
            this._lastPaper = n;
        }
    },
    pen(n) {
        if (n !== this._lastPen) {
            this._output += this._penColors[n];
            this._lastPen = n;
        }
    },
    print(...args) {
        this._output += args.join('');
    },
    prompt: (msg) => {
        vm.flush();
        return vm._fnOnPrompt(msg);
    },
    getOutput: () => vm._output,
    setOutput: (str) => vm._output = str,
    setOnCls: (fn) => vm._fnOnCls = fn,
    setOnPrint: (fn) => vm._fnOnPrint = fn,
    setOnPrompt: (fn) => vm._fnOnPrompt = fn,
    setPaperColors: (paperColors) => vm._paperColors = paperColors,
    setPenColors: (penColors) => vm._penColors = penColors
};
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
    mode(num) { this.debug("mode:", num); },
    paper(num) { this.debug("paper:", num); },
    pen(num) { this.debug("pen:", num); },
    print(...args) { this._output += args.join(''); },
    prompt(msg) { console.log(msg); return ""; }
};
export class Core {
    constructor() {
        this.startConfig = {
            action: "compile,run",
            debug: 0,
            example: "",
            fileName: "",
            grammar: "basic", // basic or strict
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
    setPaperColors(colors) {
        vm.setPaperColors(colors);
    }
    setPenColors(colors) {
        vm.setPenColors(colors);
    }
    compileScript(script) {
        if (!this.arithmeticParser) {
            const semantics = this.semantics.getSemantics();
            if (this.getConfig("grammar") === "strict") {
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
    executeScript(compiledScript) {
        return __awaiter(this, void 0, void 0, function* () {
            this.vm.setOutput("");
            if (compiledScript.startsWith("ERROR")) {
                return "ERROR";
            }
            const syntaxError = yield this.onCheckSyntax(compiledScript);
            if (syntaxError) {
                vm.cls();
                return "ERROR: " + syntaxError;
            }
            try {
                const fnScript = new Function("_o", compiledScript);
                const result = fnScript(this.vm) || "";
                let output;
                if (result instanceof Promise) {
                    output = yield result;
                    this.vm.flush();
                    output = this.vm.getOutput();
                }
                else {
                    this.vm.flush();
                    output = this.vm.getOutput();
                }
                return output;
            }
            catch (error) {
                let errorMessage = "ERROR: ";
                if (error instanceof Error) {
                    errorMessage += this.vm.getOutput() + "\n" + String(error);
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
        });
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
}
//# sourceMappingURL=Core.js.map