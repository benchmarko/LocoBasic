// parser.ts
// A simple parser for arithmetic expressions using Ohm
//
// Usage:
// node dist/locobasic.js input="?3 + 5 * (2 - 8)"
// node dist/locobasic.js fileName=dist/examples/example.bas
// node dist/locobasic.js example=euler
//
// [ npx ts-node parser.ts input="?3 + 5 * (2 - 8)" ]
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { grammar } from "ohm-js";
import { arithmetic } from "./arithmetic";
const startConfig = {
    debug: 0,
    example: "",
    fileName: "",
    input: ""
};
const examples = {};
function dimArray(dims, initVal = 0) {
    const createRecursiveArray = function (depth) {
        const length = dims[depth] + 1, // +1 because of 0-based index
        array = new Array(length);
        depth += 1;
        if (depth < dims.length) { // more dimensions?
            for (let i = 0; i < length; i += 1) {
                array[i] = createRecursiveArray(depth); // recursive call
            }
        }
        else { // one dimension
            array.fill(initVal);
        }
        return array;
    };
    return createRecursiveArray(0);
}
const vm = {
    _output: "",
    _fnOnCls: (() => undefined),
    dimArray: dimArray,
    cls: () => {
        vm._output = "";
        vm._fnOnCls();
    },
    print: (...args) => vm._output += args.join(''),
    getOutput: () => vm._output,
    setOutput: (str) => vm._output = str,
    setOnCls: (fn) => vm._fnOnCls = fn
};
class Parser {
    constructor(grammarString, semanticsMap) {
        this.ohmGrammar = grammar(grammarString);
        this.ohmSemantics = this.ohmGrammar
            .createSemantics()
            .addOperation("eval", semanticsMap);
    }
    // Function to parse and evaluate an expression
    parseAndEval(input) {
        try {
            const matchResult = this.ohmGrammar.match(input);
            if (matchResult.succeeded()) {
                return this.ohmSemantics(matchResult).eval();
            }
            else {
                return 'ERROR: Parsing failed: ' + matchResult.message;
            }
        }
        catch (error) {
            return 'ERROR: Parsing evaluator failed: ' + (error instanceof Error ? error.message : "unknown");
        }
    }
}
const variables = {};
const reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
function getVariable(name) {
    name = name.toLowerCase();
    if (reJsKeyword.test(name)) {
        name = `_${name}`;
    }
    variables[name] = (variables[name] || 0) + 1;
    return name;
}
function deleteAllItems(items) {
    for (const name in items) { // eslint-disable-line guard-for-in
        delete items[name];
    }
}
const definedLabels = [];
const gosubLabels = {};
let lineIndex = 0;
const dataList = [];
const restoreMap = {};
function addDefinedLabel(label, line) {
    definedLabels.push({
        label,
        first: line,
        last: -1,
        dataIndex: -1
    });
}
function addGosubLabel(label) {
    gosubLabels[label] = gosubLabels[label] || {
        count: 0
    };
    gosubLabels[label].count = (gosubLabels[label].count || 0) + 1;
}
function addRestoreLabel(label) {
    restoreMap[label] = -1;
}
function resetParser() {
    deleteAllItems(variables);
    definedLabels.length = 0;
    deleteAllItems(gosubLabels);
    lineIndex = 0;
    dataList.length = 0;
    deleteAllItems(restoreMap);
}
function evalChildren(children) {
    return children.map(c => c.eval());
}
// Semantics to evaluate an arithmetic expression
const semantics = {
    Program(lines) {
        const lineList = evalChildren(lines.children);
        const variabeList = Object.keys(variables);
        const varStr = variabeList.length ? "let " + variabeList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";\n" : "";
        // find subroutines
        let subFirst;
        for (let index = 0; index < definedLabels.length; index += 1) {
            const item = definedLabels[index];
            if (gosubLabels[item.label]) {
                subFirst = item;
            }
            if (subFirst && item.last >= 0) {
                const first = subFirst.first;
                const indent = lineList[first].search(/\S|$/);
                const indentStr = " ".repeat(indent);
                for (let i = first; i <= item.last; i += 1) {
                    lineList[i] = "  " + lineList[i]; // ident
                }
                lineList[first] = `${indentStr}function _${subFirst.label}() {${indentStr}\n` + lineList[first];
                lineList[item.last] += `\n${indentStr}` + "}"; //TS issue when using the following? `\n${indentStr}};`
                subFirst = undefined;
            }
            if (restoreMap[item.label] === -1) {
                restoreMap[item.label] = item.dataIndex;
            }
        }
        if (dataList.length) {
            lineList.unshift(`const _data = _getData();\nconst _restoreMap = _getRestore();\nlet _dataPrt = 0;`);
            lineList.push(`function _getData() {\nreturn [\n${dataList.join(",\n")}\n];\n}`);
            lineList.push(`function _getRestore() {\nreturn [\n${JSON.stringify(restoreMap)}\n];\n}`);
        }
        const lineStr = lineList.join('\n');
        return varStr + lineStr;
    },
    Line(label, stmts, comment, _eol) {
        const labelStr = label.sourceString;
        if (labelStr) {
            addDefinedLabel(labelStr, lineIndex);
        }
        const lineStr = stmts.eval();
        if (lineStr === "return") {
            if (definedLabels.length) {
                const lastLabelItem = definedLabels[definedLabels.length - 1];
                lastLabelItem.last = lineIndex;
            }
        }
        const commentStr = comment.sourceString ? `; //${comment.sourceString.substring(1)}` : "";
        const semi = lineStr === "" || lineStr.endsWith("{") || lineStr.startsWith("//") || commentStr ? "" : ";";
        lineIndex += 1;
        return lineStr + commentStr + semi;
    },
    Statements(stmt, _stmtSep, stmts) {
        return [stmt.eval(), ...evalChildren(stmts.children)].join('; ');
        //TODO: return [stmt.eval(), ...evalChildren(stmts.children)].map((e) => e.endsWith("{") ? e : `${e};`).join(' ');
    },
    ArrayAssign(ident, _op, e) {
        return `${ident.eval()} = ${e.eval()}`;
    },
    Assign(ident, _op, e) {
        const name = ident.sourceString;
        const name2 = getVariable(name);
        const value = e.eval();
        return `${name2} = ${value}`;
    },
    PrintArgs(arg, _printSep, args) {
        return [arg.eval(), ...evalChildren(args.children)].join(', ');
    },
    Print(_printLit, params, semi) {
        var _a;
        const paramStr = ((_a = params.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
        let newlineStr = "";
        if (!semi.sourceString) {
            newlineStr = paramStr ? ` + "\\n"` : `"\\n"`;
        }
        return `_o.print(${paramStr}${newlineStr})`;
    },
    Abs(_absLit, _open, e, _close) {
        return `Math.abs(${e.eval()})`;
    },
    Asc(_ascLit, _open, e, _close) {
        return `(${e.eval()}).charCodeAt(0)`;
    },
    Atn(_atnLit, _open, e, _close) {
        return `Math.atan(${e.eval()})`;
    },
    Bin(_binLit, _open, e, _comma, n, _close) {
        var _a;
        const pad = (_a = n.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
        const padStr = pad !== undefined ? `.padStart(${pad} || 0, "0")` : '';
        return `(${e.eval()}).toString(2).toUpperCase()${padStr}`;
    },
    Chr(_chrLit, _open, e, _close) {
        return `String.fromCharCode(${e.eval()})`;
    },
    Comment(_commentLit, remain) {
        return `//${remain.sourceString}`;
    },
    Cos(_cosLit, _open, e, _close) {
        return `Math.cos(${e.eval()})`;
    },
    Data(_datalit, args) {
        const argList = args.asIteration().children.map(c => c.eval());
        const dataIndex = dataList.length;
        if (definedLabels.length) {
            const currentLabel = definedLabels[definedLabels.length - 1];
            currentLabel.dataIndex = dataIndex;
        }
        dataList.push(argList.join(", "));
        return "";
    },
    Dim(_dimLit, arrayIdents) {
        const argList = arrayIdents.asIteration().children.map(c => c.eval());
        const results = [];
        for (const arg of argList) {
            const [ident, ...indices] = arg;
            const initValStr = ident.endsWith("$") ? ', ""' : '';
            results.push(`${ident} = _o.dimArray([${indices}]${initValStr})`); // automatically joined with comma
        }
        return results.join("; ");
    },
    Cint(_cintLit, _open, e, _close) {
        return `Math.round(${e.eval()})`;
    },
    Cls(_clsLit) {
        return `_o.cls()`;
    },
    Comparison(_iflit, condExp, _thenLit, thenStat, elseLit, elseStat) {
        const cond = condExp.eval();
        const thSt = thenStat.eval();
        let result = `if (${cond}) {\n${thSt}\n}`; // put in newlines to also allow line comments
        if (elseLit.sourceString) {
            const elseSt = evalChildren(elseStat.children).join('; ');
            result += ` else {\n${elseSt}\n}`;
        }
        return result;
    },
    End(_endLit) {
        return `return "end"`;
    },
    Exp(_expLit, _open, e, _close) {
        return `Math.exp(${e.eval()})`;
    },
    Fix(_fixLit, _open, e, _close) {
        return `Math.trunc(${e.eval()})`;
    },
    ForLoop(_forLit, variable, _eqSign, start, _dirLit, end, _stepLit, step) {
        var _a;
        const varExp = variable.eval();
        const startExp = start.eval();
        const endExp = end.eval();
        const stepExp = ((_a = step.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "1";
        const stepAsNum = Number(stepExp);
        let cmpSt = "";
        if (isNaN(stepAsNum)) {
            cmpSt = `${stepExp} >= 0 ? ${varExp} <= ${endExp} : ${varExp} >= ${endExp}`;
        }
        else {
            cmpSt = stepExp >= 0 ? `${varExp} <= ${endExp}` : `${varExp} >= ${endExp}`;
        }
        const result = `for (${varExp} = ${startExp}; ${cmpSt}; ${varExp} += ${stepExp}) {`;
        return result;
    },
    Gosub(_gosubLit, e) {
        const labelStr = e.sourceString;
        addGosubLabel(labelStr);
        return `_${labelStr}()`;
    },
    Hex(_hexLit, _open, e, _comma, n, _close) {
        var _a;
        const pad = (_a = n.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
        const padStr = pad !== undefined ? `.padStart(${pad} || 0, "0")` : '';
        return `(${e.eval()}).toString(16).toUpperCase()${padStr}`;
    },
    Int(_intLit, _open, e, _close) {
        return `Math.floor(${e.eval()})`;
    },
    Left(_leftLit, _open, e1, _comma, e2, _close) {
        return `(${e1.eval()}).slice(0, ${e2.eval()})`;
    },
    Len(_lenLit, _open, e, _close) {
        return `(${e.eval()}).length`;
    },
    Log(_logLit, _open, e, _close) {
        return `Math.log(${e.eval()})`;
    },
    Log10(_log10Lit, _open, e, _close) {
        return `Math.log10(${e.eval()})`;
    },
    Lower(_lowerLit, _open, e, _close) {
        return `(${e.eval()}).toLowerCase()`;
    },
    Max(_maxLit, _open, args, _close) {
        const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
        return `Math.max(${argList})`;
    },
    Mid(_midLit, _open, e1, _comma1, e2, _comma2, e3, _close) {
        var _a;
        const length = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
        const lengthStr = length === undefined ? "" : `, ${length}`;
        return `(${e1.eval()}).substr(${e2.eval()} - 1${lengthStr})`;
    },
    Min(_minLit, _open, args, _close) {
        const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
        return `Math.min(${argList})`;
    },
    Next(_nextLit, variables) {
        const argList = variables.asIteration().children.map(c => c.eval());
        if (!argList.length) {
            argList.push("_any");
        }
        return '}'.repeat(argList.length);
    },
    On(_nLit, e1, _gosubLit, args) {
        const index = e1.eval();
        const argList = args.asIteration().children.map(c => c.sourceString);
        for (let i = 0; i < argList.length; i += 1) {
            addGosubLabel(argList[i]);
        }
        return `[${argList.map((label) => `_${label}`).join(",")}]?.[${index} - 1]()`; // 1-based index
    },
    Pi(_piLit) {
        return "Math.PI";
    },
    Read(_readlit, args) {
        const argList = args.asIteration().children.map(c => c.eval());
        const results = [];
        for (const ident of argList) {
            results.push(`${ident} = _data[_dataPrt++]`);
        }
        return results.join("; ");
    },
    Rem(_remLit, remain) {
        return `// ${remain.sourceString}`;
    },
    Restore(_restoreLit, e) {
        const labelStr = e.sourceString || "0";
        addRestoreLabel(labelStr);
        return `_dataPtr = _restoreMap[${labelStr}]`;
    },
    Return(_returnLit) {
        return "return";
    },
    Right(_rightLit, _open, e1, _comma, e2, _close) {
        return `(${e1.eval()}).slice(-${e2.eval()})`;
    },
    Rnd(_rndLit, _open, _e, _close) {
        // args are ignored
        return `Math.random()`;
    },
    Round(_roundLit, _open, e, _comma, e2, _close) {
        var _a;
        const dec = (_a = e2.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
        if (dec) {
            return `(Math.round(${e.eval()} * Math.pow(10, ${dec})) / Math.pow(10, ${dec}))`;
        }
        return `Math.round(${e.eval()})`;
        // A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
    },
    Sgn(_sgnLit, _open, e, _close) {
        return `Math.sign(${e.eval()})`;
    },
    Sin(_sinLit, _open, e, _close) {
        return `Math.sin(${e.eval()})`;
    },
    Space2(_stringLit, _open, len, _close) {
        return `" ".repeat(${len.eval()})`;
    },
    Sqr(_sqrLit, _open, e, _close) {
        return `Math.sqrt(${e.eval()})`;
    },
    Stop(_stopLit) {
        return `return "stop"`;
    },
    Str(_strLit, _open, e, _close) {
        return `String(${e.eval()})`; // TODO: additional space for n>0?
    },
    String2(_stringLit, _open, len, _commaLit, chr, _close) {
        // Note: String$: we only support second parameter as string; we do not use charAt(0) to get just one char
        return `(${chr.eval()}).repeat(${len.eval()})`;
    },
    Tan(_tanLit, _open, e, _close) {
        return `Math.tan(${e.eval()})`;
    },
    Time(_timeLit) {
        return `Date.now()`; // TODO; or *300/1000
    },
    Upper(_upperLit, _open, e, _close) {
        return `(${e.eval()}).toUpperCase()`;
    },
    Val(_upperLit, _open, e, _close) {
        const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
        const numStr = String(e.eval());
        if (numPattern.test(numStr)) {
            return `Number(${numStr})`; // for non-hex/bin number strings we can use this simple version
        }
        return `Number((${numStr}).replace("&x", "0b").replace("&", "0x"))`;
    },
    Wend(_wendLit) {
        return '}';
    },
    WhileLoop(_whileLit, e) {
        const cond = e.eval();
        return `while (${cond}) {`;
    },
    StrOrNumExp(e) {
        return String(e.eval());
    },
    XorExp_xor(a, _op, b) {
        return `${a.eval()} ^ ${b.eval()}`;
    },
    OrExp_or(a, _op, b) {
        return `${a.eval()} | ${b.eval()}`;
    },
    AndExp_and(a, _op, b) {
        return `${a.eval()} & ${b.eval()}`;
    },
    NotExp_not(_op, e) {
        return `~(${e.eval()})`;
    },
    CmpExp_eq(a, _op, b) {
        return `${a.eval()} === ${b.eval()} ? -1 : 0`;
    },
    CmpExp_ne(a, _op, b) {
        return `${a.eval()} !== ${b.eval()} ? -1 : 0`;
    },
    CmpExp_lt(a, _op, b) {
        return `${a.eval()} < ${b.eval()} ? -1 : 0`;
    },
    CmpExp_le(a, _op, b) {
        return `${a.eval()} <= ${b.eval()} ? -1 : 0`;
    },
    CmpExp_gt(a, _op, b) {
        return `${a.eval()} > ${b.eval()} ? -1 : 0`;
    },
    CmpExp_ge(a, _op, b) {
        return `${a.eval()} >= ${b.eval()} ? -1 : 0`;
    },
    AddExp_plus(a, _op, b) {
        return `${a.eval()} + ${b.eval()}`;
    },
    AddExp_minus(a, _op, b) {
        return `${a.eval()} - ${b.eval()}`;
    },
    ModExp_mod(a, _op, b) {
        return `${a.eval()} % ${b.eval()}`;
    },
    DivExp_div(a, _op, b) {
        return `(${a.eval()} / ${b.eval()}) | 0`;
    },
    MulExp_times(a, _op, b) {
        return `${a.eval()} * ${b.eval()}`;
    },
    MulExp_divide(a, _op, b) {
        return `${a.eval()} / ${b.eval()}`;
    },
    ExpExp_power(a, _, b) {
        return `Math.pow(${a.eval()}, ${b.eval()})`;
    },
    PriExp_paren(_open, e, _close) {
        return `(${e.eval()})`;
    },
    PriExp_pos(_op, e) {
        return String(e.eval());
    },
    PriExp_neg(_op, e) {
        return `-${e.eval()}`;
    },
    StrCmpExp_eq(a, _op, b) {
        return `${a.eval()} === ${b.eval()} ? -1 : 0`;
    },
    StrCmpExp_ne(a, _op, b) {
        return `${a.eval()} !== ${b.eval()} ? -1 : 0`;
    },
    StrAddExp_plus(a, _op, b) {
        return `${a.eval()} + ${b.eval()}`;
    },
    StrPriExp_paren(_open, e, _close) {
        return `(${e.eval()})`;
    },
    ArrayArgs(args) {
        return args.asIteration().children.map(c => String(c.eval()));
    },
    ArrayIdent(ident, _open, e, _close) {
        return `${ident.eval()}[${e.eval().join("][")}]`;
    },
    StrArrayIdent(ident, _open, e, _close) {
        return `${ident.eval()}[${e.eval().join("][")}]`;
    },
    DimArrayIdent(ident, _open, indices, _close) {
        return [ident.eval(), ...indices.eval()]; //TTT
    },
    decimalValue(value) {
        return value.sourceString;
    },
    hexValue(_prefix, value) {
        return `0x${value.sourceString}`;
    },
    binaryValue(_prefix, value) {
        return `0b${value.sourceString}`;
    },
    string(_quote1, e, _quote2) {
        return `"${e.sourceString}"`;
    },
    ident(ident) {
        const name = ident.sourceString;
        return getVariable(name);
    },
    strIdent(ident, typeSuffix) {
        const name = ident.sourceString + typeSuffix.sourceString;
        return getVariable(name);
    }
};
const arithmeticParser = new Parser(arithmetic.grammar, semantics);
function compileScript(script) {
    resetParser();
    const compiledScript = arithmeticParser.parseAndEval(script);
    return compiledScript;
}
function executeScript(compiledScript) {
    return __awaiter(this, void 0, void 0, function* () {
        vm.setOutput("");
        if (compiledScript.startsWith("ERROR")) {
            return "ERROR" + "\n";
        }
        let output;
        try {
            const fnScript = new Function("_o", compiledScript); // eslint-disable-line no-new-func
            const result = fnScript(vm) || "";
            if (result instanceof Promise) {
                output = vm.getOutput() + (yield result);
            }
            else {
                output = vm.getOutput() + result;
            }
        }
        catch (error) {
            output = "ERROR: ";
            if (error instanceof Error) {
                output += error.message;
                const anyErr = error;
                const lineNumber = anyErr.lineNumber; // only on FireFox
                const columnNumber = anyErr.columnNumber; // only on FireFox
                if (lineNumber || columnNumber) {
                    const errLine = lineNumber - 2; // for some reason line 0 is 2
                    output += ` (line ${errLine}, column ${columnNumber})`;
                }
            }
            else {
                output += "unknown";
            }
        }
        return output + "\n";
    });
}
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}
function keepRunning(fn, timeout) {
    const timerId = setTimeout(() => { }, timeout);
    return (() => __awaiter(this, void 0, void 0, function* () {
        fn();
        clearTimeout(timerId);
    }))();
}
function asyncDelay(fn, timeout) {
    return (() => __awaiter(this, void 0, void 0, function* () {
        const timerId = setTimeout(fn, timeout);
        return timerId;
    }))();
}
let basicCm;
let compiledCm;
function getOutputText() {
    const outputText = document.getElementById("outputText");
    return outputText.value;
}
function setOutputText(value) {
    const outputText = document.getElementById("outputText");
    outputText.value = value;
}
function onExecuteButtonClick(_event) {
    return __awaiter(this, void 0, void 0, function* () {
        const compiledText = document.getElementById("compiledText");
        const compiledScript = compiledCm ? compiledCm.getValue() : compiledText.value;
        const output = yield executeScript(compiledScript);
        setOutputText(getOutputText() + output);
    });
}
function oncompiledTextChange(_event) {
    const autoExecuteInput = document.getElementById("autoExecuteInput");
    if (autoExecuteInput.checked) {
        const executeButton = window.document.getElementById("executeButton");
        executeButton.dispatchEvent(new Event('click'));
    }
}
function onCompileButtonClick(_event) {
    const basicText = document.getElementById("basicText");
    const compiledText = document.getElementById("compiledText");
    const input = compiledCm ? basicCm.getValue() : basicText.value;
    const compiledScript = compileScript(input);
    if (compiledCm) {
        compiledCm.setValue(compiledScript);
    }
    else {
        compiledText.value = compiledScript;
        const autoExecuteInput = document.getElementById("autoExecuteInput");
        if (autoExecuteInput.checked) {
            const newEvent = new Event('change');
            compiledText.dispatchEvent(newEvent);
        }
    }
}
function onbasicTextChange(_event) {
    const autoCompileInput = document.getElementById("autoCompileInput");
    if (autoCompileInput.checked) {
        const compileButton = window.document.getElementById("compileButton");
        compileButton.dispatchEvent(new Event('click'));
    }
}
function onExampleSelectChange(event) {
    const exampleSelect = event.target;
    const basicText = document.getElementById("basicText");
    const value = examples[exampleSelect.value];
    setOutputText("");
    if (basicCm) {
        basicCm.setValue(value);
    }
    else {
        basicText.value = value;
        basicText.dispatchEvent(new Event('change'));
    }
}
function setExampleSelectOptions(examples) {
    const exampleSelect = document.getElementById("exampleSelect");
    for (const key of Object.keys(examples)) {
        const value = key; //examples[key];
        const option = window.document.createElement("option");
        option.value = value;
        option.text = value;
        option.title = value;
        option.selected = false;
        exampleSelect.add(option);
    }
}
function fnHereDoc(fn) {
    return String(fn).
        replace(/^[^/]+\/\*\S*/, "").
        replace(/\*\/[^/]+$/, "");
}
function addItem(key, input) {
    let inputString = (typeof input !== "string") ? fnHereDoc(input) : input;
    inputString = inputString.replace(/^\n/, "").replace(/\n$/, ""); // remove preceding and trailing newlines
    // beware of data files ending with newlines! (do not use trimEnd)
    if (!key) { // maybe ""
        const matches = inputString.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
        key = matches ? matches[1] : "unknown";
    }
    examples[key] = inputString;
}
let fs;
let modulePath;
function nodeReadFile(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs) {
            fs = require("fs");
        }
        if (!module) {
            module = require("module");
            modulePath = module.path || "";
            if (!modulePath) {
                console.warn("nodeReadFile: Cannot determine module path");
            }
        }
        return fs.promises.readFile(name, "utf8");
    });
}
function fnParseArgs(args, config) {
    for (let i = 0; i < args.length; i += 1) {
        const [name, ...valueParts] = args[i].split("="), nameType = typeof config[name];
        let value = valueParts.join("=");
        if (value !== undefined) {
            if (nameType === "boolean") {
                value = (value === "true");
            }
            else if (nameType === "number") {
                value = Number(value);
            }
            config[name] = value;
        }
    }
    return config;
}
function fnDecodeUri(s) {
    let decoded = "";
    try {
        decoded = decodeURIComponent(s.replace(/\+/g, " "));
    }
    catch (err) {
        if (err instanceof Error) {
            err.message += ": " + s;
        }
        console.error(err);
    }
    return decoded;
}
// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function fnParseUri(urlQuery, config) {
    const rSearch = /([^&=]+)=?([^&]*)/g, args = [];
    let match;
    while ((match = rSearch.exec(urlQuery)) !== null) {
        const name = fnDecodeUri(match[1]), value = fnDecodeUri(match[2]);
        if (value !== null && config[name] !== undefined) {
            args.push(name + "=" + value);
        }
    }
    return fnParseArgs(args, config);
}
function start(input) {
    if (input !== "") {
        const compiledScript = compileScript(input);
        console.log("INFO: Compiled:\n" + compiledScript + "\n");
        return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
            const output = yield executeScript(compiledScript);
            console.log(output);
        }), 5000);
    }
    else {
        console.log("No input");
    }
}
function main(config) {
    let input = config.input || "";
    if (config.fileName) {
        return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
            input = yield nodeReadFile(config.fileName);
            start(input);
        }), 5000);
    }
    else {
        if (config.example) {
            if (!Object.keys(examples).length) {
                return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                    const jsFile = yield nodeReadFile("./dist/examples/examples.js");
                    // ?? require('./examples/examples.js');
                    const fnScript = new Function("cpcBasic", jsFile);
                    fnScript({
                        addItem: addItem
                    });
                    input = examples[config.example];
                    start(input);
                }), 5000);
            }
            input += examples[config.example];
        }
        console.log("start");
        start(input);
    }
}
if (typeof window !== "undefined") {
    window.cpcBasic = {
        addItem: addItem
    };
    window.onload = () => {
        const basicText = window.document.getElementById("basicText");
        basicText.addEventListener('change', onbasicTextChange);
        const compiledText = window.document.getElementById("compiledText");
        compiledText.addEventListener('change', oncompiledTextChange);
        const compileButton = window.document.getElementById("compileButton");
        compileButton.addEventListener('click', onCompileButtonClick, false);
        const executeButton = window.document.getElementById("executeButton");
        executeButton.addEventListener('click', onExecuteButtonClick, false);
        const exampleSelect = document.getElementById("exampleSelect");
        exampleSelect.addEventListener('change', onExampleSelectChange);
        const WinCodeMirror = window.CodeMirror;
        if (WinCodeMirror) {
            const debounceMs = 1000;
            basicCm = WinCodeMirror.fromTextArea(basicText, {
                lineNumbers: true,
                mode: 'javascript'
            });
            basicCm.on('changes', debounce(onbasicTextChange, debounceMs));
            compiledCm = WinCodeMirror.fromTextArea(compiledText, {
                lineNumbers: true,
                mode: 'javascript'
            });
            compiledCm.on('changes', debounce(oncompiledTextChange, debounceMs / 2));
        }
        vm.setOnCls(() => setOutputText(""));
        return asyncDelay(() => {
            setExampleSelectOptions(examples);
            const config = fnParseUri(window.location.search.substring(1), startConfig);
            if (config.example) {
                const exampleSelect = document.getElementById("exampleSelect");
                exampleSelect.value = config.example;
            }
            //const input = examples[config.example as string];
            exampleSelect.dispatchEvent(new Event('change'));
        }, 10);
    };
}
else {
    main(fnParseArgs(global.process.argv.slice(2), startConfig));
}
export const testParser = {
    dimArray: dimArray
};
//# sourceMappingURL=parser.js.map