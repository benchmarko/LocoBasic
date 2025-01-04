// Semantics.ts
function getCodeSnippets() {
    const _o = {};
    let _data = [];
    let _dataPtr = 0;
    let _restoreMap = {};
    const codeSnippets = {
        _setDataDummy: function _setDataDummy() {
            _data = [];
            _dataPtr = 0;
            _restoreMap = {};
            //Object.assign(_o, vm);
        },
        bin$: function bin$(num, pad = 0) {
            return num.toString(2).toUpperCase().padStart(pad, "0");
        },
        cls: function cls() {
            _o.cls();
        },
        dec$: function dec$(num, format) {
            const [, decimalPart] = format.split(".", 2);
            const decimals = decimalPart ? decimalPart.length : 0;
            const str = num.toFixed(decimals);
            const padLen = format.length - str.length;
            const pad = padLen > 0 ? " ".repeat(padLen) : "";
            return pad + str;
        },
        dim: function dim(dims, initVal = 0) {
            const createRecursiveArray = (depth) => {
                const length = dims[depth] + 1; // +1 because of 0-based index
                const array = Array.from({ length }, () => depth + 1 < dims.length ? createRecursiveArray(depth + 1) : initVal);
                return array;
            };
            return createRecursiveArray(0);
        },
        frame: function frame() {
            return new Promise(resolve => setTimeout(() => resolve(), Date.now() % 50));
        },
        hex$: function hex$(num, pad) {
            return num.toString(16).toUpperCase().padStart(pad || 0, "0");
        },
        input: function input(msg, isNum) {
            return new Promise(resolve => setTimeout(() => {
                const input = _o.prompt(msg);
                resolve(isNum ? Number(input) : input);
            }, 0));
        },
        mid$Assign: function mid$Assign(s, start, newString, len) {
            start -= 1;
            len = Math.min(len !== null && len !== void 0 ? len : newString.length, newString.length, s.length - start);
            return s.substring(0, start) + newString.substring(0, len) + s.substring(start + len);
        },
        print: function print(...args) {
            const _printNumber = (arg) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
            const output = args.map((arg) => (typeof arg === "number") ? _printNumber(arg) : arg).join("");
            _o.print(output);
        },
        read: function read() {
            return _data[_dataPtr++];
        },
        restore: function restore(label) {
            _dataPtr = _restoreMap[label];
        },
        round: function round(num, dec) {
            return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        },
        str$: function str$(num) {
            return num >= 0 ? ` ${num}` : String(num);
        },
        time: function time() {
            return (Date.now() * 3 / 10) | 0;
        },
        val: function val(str) {
            return Number(str.replace("&x", "0b").replace("&", "0x"));
        }
    };
    return codeSnippets;
}
/*
// round with higher precision: https://www.jacklmoore.com/notes/rounding-in-javascript
round: function round(num: number, dec: number) {
    const maxDecimals = 20 - Math.floor(Math.log10(Math.abs(num))); // limit for JS
    if (dec >= 0 && dec > maxDecimals) {
        dec = maxDecimals;
    }
    return Math.sign(num) * Number(Math.round(Number(Math.abs(num) + "e" + dec)) + "e" + (dec >= 0 ? -dec : -dec));
}
*/
function trimIndent(code) {
    const lines = code.split("\n");
    const lastLine = lines[lines.length - 1];
    const match = lastLine.match(/^(\s+)}$/);
    if (match) {
        const indent = match[1];
        const trimmedLines = lines.map((line) => line.startsWith(indent) ? line.slice(indent.length) : line);
        return trimmedLines.join("\n");
    }
    return code;
}
function evalChildren(children) {
    return children.map(c => c.eval());
}
function getSemantics(semanticsHelper) {
    // Semantics to evaluate an arithmetic expression
    const semantics = {
        Program(lines) {
            const lineList = evalChildren(lines.children);
            const variableList = semanticsHelper.getVariables();
            const variableDeclarations = variableList.length ? "let " + variableList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";" : "";
            // find subroutines
            const definedLabels = semanticsHelper.getDefinedLabels();
            const gosubLabels = semanticsHelper.getGosubLabels();
            const restoreMap = semanticsHelper.getRestoreMap();
            const awaitLabels = [];
            let subroutineStart;
            for (const label of definedLabels) {
                if (gosubLabels[label.label]) {
                    subroutineStart = label;
                }
                if (subroutineStart && label.last >= 0) {
                    const first = subroutineStart.first;
                    const indent = lineList[first].search(/\S|$/);
                    const indentStr = " ".repeat(indent);
                    let hasAwait = false;
                    for (let i = first; i <= label.last; i += 1) {
                        if (lineList[i].includes("await ")) {
                            hasAwait = true; // quick check
                        }
                        lineList[i] = "  " + lineList[i]; // indent
                    }
                    const asyncStr = hasAwait ? "async " : "";
                    lineList[first] = `${indentStr}${asyncStr}function _${subroutineStart.label}() {${indentStr}\n` + lineList[first];
                    lineList[label.last] += `\n${indentStr}` + "}"; //TS issue when using the following? `\n${indentStr}};`
                    if (hasAwait) {
                        awaitLabels.push(subroutineStart.label);
                    }
                    subroutineStart = undefined;
                }
                if (restoreMap[label.label] === -1) {
                    restoreMap[label.label] = label.dataIndex;
                }
            }
            const dataList = semanticsHelper.getDataList();
            if (dataList.length) {
                for (const key of Object.keys(restoreMap)) {
                    let index = restoreMap[key];
                    if (index < 0) {
                        index = 0;
                        restoreMap[key] = index;
                    }
                }
                lineList.unshift(`const {_data, _restoreMap} = _defineData();\nlet _dataPtr = 0;`);
                lineList.push(`function _defineData() {\n  const _data = [\n${dataList.join(",\n")}\n  ];\n  const _restoreMap = ${JSON.stringify(restoreMap)};\n  return {_data, _restoreMap};\n}`);
            }
            lineList.push("// library");
            const instrMap = semanticsHelper.getInstrMap();
            const codeSnippets = getCodeSnippets();
            let needsAsync = false;
            for (const key of Object.keys(codeSnippets)) {
                if (instrMap[key]) {
                    const code = String(codeSnippets[key]);
                    const adaptedCode = trimIndent(code);
                    if (adaptedCode.includes("Promise") || adaptedCode.includes("await")) {
                        lineList.push("async " + adaptedCode);
                        needsAsync = true;
                    }
                    else {
                        lineList.push(adaptedCode);
                    }
                }
            }
            if (variableDeclarations) {
                lineList.unshift(variableDeclarations);
            }
            if (needsAsync) {
                lineList.unshift(`return async function() {`);
                lineList.push('}();');
            }
            lineList.unshift(`"use strict"`);
            let lineStr = lineList.filter((line) => line.trimEnd() !== "").join('\n');
            if (awaitLabels.length) {
                for (const label of awaitLabels) {
                    const regEx = new RegExp(`_${label}\\(\\);`, "g");
                    lineStr = lineStr.replace(regEx, `await _${label}();`);
                }
            }
            return lineStr;
        },
        Line(label, stmts, comment, _eol) {
            const labelString = label.sourceString;
            const currentLineIndex = semanticsHelper.incrementLineIndex() - 1;
            if (labelString) {
                semanticsHelper.addDefinedLabel(labelString, currentLineIndex);
            }
            const lineStr = stmts.eval();
            if (lineStr === "return") {
                const definedLabels = semanticsHelper.getDefinedLabels();
                if (definedLabels.length) {
                    const lastLabelItem = definedLabels[definedLabels.length - 1];
                    lastLabelItem.last = currentLineIndex;
                }
            }
            const commentStr = comment.sourceString ? `; //${comment.sourceString.substring(1)}` : "";
            const semi = lineStr === "" || lineStr.endsWith("{") || lineStr.endsWith("}") || lineStr.startsWith("//") || commentStr ? "" : ";";
            const indentStr = semanticsHelper.getIndentStr();
            semanticsHelper.applyNextIndent();
            return indentStr + lineStr + commentStr + semi;
        },
        Statements(stmt, _stmtSep, stmts) {
            // separate statements, use ";", if the last stmt does not end with "{"
            const statements = [stmt.eval(), ...evalChildren(stmts.children)];
            return statements.reduce((acc, current) => acc.endsWith("{") ? `${acc} ${current}` : `${acc}; ${current}`);
        },
        ArrayAssign(ident, _op, e) {
            return `${ident.eval()} = ${e.eval()}`;
        },
        Assign(ident, _op, e) {
            const variableName = ident.sourceString;
            const resolvedVariableName = semanticsHelper.getVariable(variableName);
            const value = e.eval();
            return `${resolvedVariableName} = ${value}`;
        },
        Abs(_absLit, _open, e, _close) {
            return `Math.abs(${e.eval()})`;
        },
        Asc(_ascLit, _open, e, _close) {
            return `(${e.eval()}).charCodeAt(0)`;
        },
        Atn(_atnLit, _open, e, _close) {
            return semanticsHelper.getDeg() ? `(Math.atan(${e.eval()}) * 180 / Math.PI)` : `Math.atan(${e.eval()})`;
        },
        BinS(_binLit, _open, e, _comma, n, _close) {
            var _a;
            semanticsHelper.addInstr("bin$");
            const pad = (_a = n.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            return pad !== undefined ? `bin$(${e.eval()}, ${pad})` : `bin$(${e.eval()})`;
        },
        ChrS(_chrLit, _open, e, _close) {
            return `String.fromCharCode(${e.eval()})`;
        },
        Comment(_commentLit, remain) {
            return `//${remain.sourceString}`;
        },
        Cos(_cosLit, _open, e, _close) {
            return semanticsHelper.getDeg() ? `Math.cos((${e.eval()}) * Math.PI / 180)` : `Math.cos(${e.eval()})`;
        },
        Cint(_cintLit, _open, e, _close) {
            return `Math.round(${e.eval()})`;
        },
        Cls(_clsLit) {
            semanticsHelper.addInstr("cls");
            return `cls()`;
        },
        Data(_datalit, args) {
            const argList = args.asIteration().children.map(c => c.eval());
            const definedLabels = semanticsHelper.getDefinedLabels();
            if (definedLabels.length) {
                const currentLabel = definedLabels[definedLabels.length - 1];
                if (currentLabel.dataIndex === -1) {
                    const dataIndex = semanticsHelper.getDataIndex();
                    currentLabel.dataIndex = dataIndex;
                }
            }
            const dataList = semanticsHelper.getDataList();
            dataList.push(argList.join(", "));
            semanticsHelper.addDataIndex(argList.length);
            return "";
        },
        DecS(_decLit, _open, num, _comma, format, _close) {
            semanticsHelper.addInstr("dec$");
            return `dec$(${num.eval()}, ${format.eval()})`;
        },
        Def(_defLit, _fnLit, assign) {
            return `${assign.eval()}`;
        },
        DefArgs(_open, arrayIdents, _close) {
            const argList = arrayIdents.asIteration().children.map(c => c.eval());
            return `(${argList.join(", ")})`;
        },
        DefAssign(ident, args, _equal, e) {
            const argStr = args.children.map(c => c.eval()).join(", ") || "()";
            const fnIdent = semanticsHelper.getVariable(`fn${ident.sourceString}`);
            return `${fnIdent} = ${argStr} => ${e.eval()}`;
        },
        Deg(_degLit) {
            semanticsHelper.setDeg(true);
            return `/* deg active */`;
        },
        Dim(_dimLit, arrayIdents) {
            const argList = arrayIdents.asIteration().children.map(c => c.eval());
            const results = [];
            for (const arg of argList) {
                const [ident, ...indices] = arg;
                let createArrStr;
                if (indices.length > 1) { // multi-dimensional?
                    const initValStr = ident.endsWith("$") ? ', ""' : '';
                    createArrStr = `dim([${indices}]${initValStr})`; // indices are automatically joined with comma
                    semanticsHelper.addInstr("dim");
                }
                else {
                    const fillStr = ident.endsWith("$") ? `""` : "0";
                    createArrStr = `new Array(${indices[0]} + 1).fill(${fillStr})`; // +1 because of 0-based index
                }
                results.push(`${ident} = ${createArrStr}`);
            }
            return results.join("; ");
        },
        End(_endLit) {
            return `return "end"`;
        },
        Erase(_eraseLit, arrayIdents) {
            const argList = arrayIdents.asIteration().children.map(c => c.eval());
            const results = [];
            for (const ident of argList) {
                const initValStr = ident.endsWith("$") ? '""' : '0';
                results.push(`${ident} = ${initValStr}`);
            }
            return results.join("; ");
        },
        Error(_errorLit, e) {
            return `throw new Error(${e.eval()})`;
        },
        Exp(_expLit, _open, e, _close) {
            return `Math.exp(${e.eval()})`;
        },
        Fix(_fixLit, _open, e, _close) {
            return `Math.trunc(${e.eval()})`;
        },
        FnArgs(_open, args, _close) {
            const argList = args.asIteration().children.map(c => c.eval());
            return `(${argList.join(", ")})`;
        },
        StrFnArgs(_open, args, _close) {
            const argList = args.asIteration().children.map(c => c.eval());
            return `(${argList.join(", ")})`;
        },
        FnIdent(fnIdent, args) {
            var _a;
            const argStr = ((_a = args.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "()";
            return `${fnIdent.eval()}${argStr}`;
        },
        StrFnIdent(fnIdent, args) {
            var _a;
            const argStr = ((_a = args.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "()";
            return `${fnIdent.eval()}${argStr}`;
        },
        For(_forLit, variable, _eqSign, start, _dirLit, end, _stepLit, step) {
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
            semanticsHelper.nextIndentAdd(2);
            const result = `for (${varExp} = ${startExp}; ${cmpSt}; ${varExp} += ${stepExp}) {`;
            return result;
        },
        Frame(_frameLit) {
            semanticsHelper.addInstr("frame");
            return `await frame()`;
        },
        Gosub(_gosubLit, e) {
            const labelStr = e.sourceString;
            semanticsHelper.addGosubLabel(labelStr);
            return `_${labelStr}()`;
        },
        HexS(_hexLit, _open, e, _comma, n, _close) {
            var _a;
            semanticsHelper.addInstr("hex$");
            const pad = (_a = n.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            return pad !== undefined ? `hex$(${e.eval()}, ${pad})` : `hex$(${e.eval()})`;
        },
        If(_iflit, condExp, _thenLit, thenStat, elseLit, elseStat) {
            const initialIndent = semanticsHelper.getIndentStr();
            semanticsHelper.addIndent(2);
            const increasedIndent = semanticsHelper.getIndentStr();
            const cond = condExp.eval();
            const thSt = thenStat.eval();
            let result = `if (${cond}) {\n${increasedIndent}${thSt}\n${initialIndent}}`; // put in newlines to also allow line comments
            if (elseLit.sourceString) {
                const elseSt = evalChildren(elseStat.children).join('; ');
                result += ` else {\n${increasedIndent}${elseSt}\n${initialIndent}}`;
            }
            semanticsHelper.addIndent(-2);
            return result;
        },
        Input(_inputLit, message, _semi, e) {
            semanticsHelper.addInstr("input");
            const msgStr = message.sourceString.replace(/\s*[;,]$/, "");
            const ident = e.eval();
            const isNumStr = ident.includes("$") ? "" : ", true";
            return `${ident} = await input(${msgStr}${isNumStr})`;
        },
        Instr_noLen(_instrLit, _open, e1, _comma, e2, _close) {
            return `((${e1.eval()}).indexOf(${e2.eval()}) + 1)`;
        },
        Instr_len(_instrLit, _open, len, _comma1, e1, _comma2, e2, _close) {
            return `((${e1.eval()}).indexOf(${e2.eval()}, ${len.eval()} - 1) + 1)`;
        },
        Int(_intLit, _open, e, _close) {
            return `Math.floor(${e.eval()})`;
        },
        LeftS(_leftLit, _open, e1, _comma, e2, _close) {
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
        LowerS(_lowerLit, _open, e, _close) {
            return `(${e.eval()}).toLowerCase()`;
        },
        Max(_maxLit, _open, args, _close) {
            const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
            return `Math.max(${argList})`;
        },
        MidS(_midLit, _open, e1, _comma1, e2, _comma2, e3, _close) {
            var _a;
            const length = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            const lengthStr = length === undefined ? "" : `, ${length}`;
            return `(${e1.eval()}).substr(${e2.eval()} - 1${lengthStr})`;
        },
        MidSAssign(_midLit, _open, ident, _comma1, e2, _comma2, e3, _close, _op, e) {
            var _a;
            semanticsHelper.addInstr("mid$Assign");
            const variableName = ident.sourceString;
            const resolvedVariableName = semanticsHelper.getVariable(variableName);
            const start = e2.eval();
            const newString = e.eval();
            const length = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval(); // also undefined possible
            return `${resolvedVariableName} = mid$Assign(${resolvedVariableName}, ${start}, ${newString}, ${length})`;
        },
        Min(_minLit, _open, args, _close) {
            const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
            return `Math.min(${argList})`;
        },
        Mode(_clsLit, _num) {
            semanticsHelper.addInstr("cls"); // currently MODE is the same as CLS
            return `cls()`;
        },
        Next(_nextLit, variables) {
            const argList = variables.asIteration().children.map(c => c.eval());
            if (!argList.length) {
                argList.push("_any");
            }
            semanticsHelper.addIndent(-2 * argList.length);
            return '} '.repeat(argList.length).slice(0, -1);
        },
        On(_nLit, e1, _gosubLit, args) {
            const index = e1.eval();
            const argList = args.asIteration().children.map(c => c.sourceString);
            for (let i = 0; i < argList.length; i += 1) {
                semanticsHelper.addGosubLabel(argList[i]);
            }
            return `[${argList.map((label) => `_${label}`).join(",")}]?.[${index} - 1]()`; // 1-based index
        },
        Pi(_piLit) {
            return "Math.PI";
        },
        PrintArg_strCmp(_cmp, args) {
            const paramStr = args.children[0].eval();
            return paramStr;
        },
        PrintArg_usingNum(_printLit, format, _semi, num) {
            semanticsHelper.addInstr("dec$");
            return `dec$(${num.eval()}, ${format.eval()})`;
        },
        Print(_printLit, args, semi) {
            semanticsHelper.addInstr("print");
            const argList = args.asIteration().children.map(c => c.eval());
            const paramStr = argList.join(', ') || "";
            let newlineStr = "";
            if (!semi.sourceString) {
                newlineStr = paramStr ? `, "\\n"` : `"\\n"`;
            }
            return `print(${paramStr}${newlineStr})`;
        },
        Rad(_radLit) {
            semanticsHelper.setDeg(false);
            return `/* rad active */`;
        },
        Read(_readlit, args) {
            semanticsHelper.addInstr("read");
            const argList = args.asIteration().children.map(c => c.eval());
            const results = argList.map(identifier => `${identifier} = read()`);
            return results.join("; ");
        },
        Rem(_remLit, remain) {
            return `// ${remain.sourceString}`;
        },
        Restore(_restoreLit, e) {
            const labelStr = e.sourceString || "0";
            semanticsHelper.addRestoreLabel(labelStr);
            semanticsHelper.addInstr("restore");
            return `restore(${labelStr})`;
        },
        Return(_returnLit) {
            return "return";
        },
        RightS(_rightLit, _open, e1, _comma, e2, _close) {
            const str = e1.eval();
            const len = e2.eval();
            return `(${str}).substring((${str}).length - (${len}))`;
        },
        Rnd(_rndLit, _open, _e, _close) {
            // args are ignored
            return `Math.random()`;
        },
        Round(_roundLit, _open, value, _comma, decimals, _close) {
            var _a;
            const decimalPlaces = (_a = decimals.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            if (decimalPlaces) {
                semanticsHelper.addInstr("round");
                return `round(${value.eval()}, ${decimalPlaces})`;
            }
            return `Math.round(${value.eval()})`; // common round without decimals places
            // A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
        },
        Sgn(_sgnLit, _open, e, _close) {
            return `Math.sign(${e.eval()})`;
        },
        Sin(_sinLit, _open, e, _close) {
            return semanticsHelper.getDeg() ? `Math.sin((${e.eval()}) * Math.PI / 180)` : `Math.sin(${e.eval()})`;
        },
        SpaceS(_stringLit, _open, len, _close) {
            return `" ".repeat(${len.eval()})`;
        },
        Sqr(_sqrLit, _open, e, _close) {
            return `Math.sqrt(${e.eval()})`;
        },
        Stop(_stopLit) {
            return `return "stop"`;
        },
        StrS(_strLit, _open, e, _close) {
            const arg = e.eval();
            if (isNaN(Number(arg))) {
                semanticsHelper.addInstr("str$");
                return `str$(${arg})`;
            }
            // simplify if we know at compile time that arg is a positive number
            return arg >= 0 ? `(" " + String(${arg}))` : `String(${arg})`;
        },
        StringS_str(_stringLit, _open, len, _commaLit, chr, _close) {
            // Note: we do not use charAt(0) to get just one char
            return `(${chr.eval()}).repeat(${len.eval()})`;
        },
        StringS_num(_stringLit, _open, len, _commaLit, num, _close) {
            return `String.fromCharCode(${num.eval()}).repeat(${len.eval()})`;
        },
        Tan(_tanLit, _open, e, _close) {
            return semanticsHelper.getDeg() ? `Math.tan((${e.eval()}) * Math.PI / 180)` : `Math.tan(${e.eval()})`;
        },
        Time(_timeLit) {
            semanticsHelper.addInstr("time");
            return `time()`;
        },
        UpperS(_upperLit, _open, e, _close) {
            return `(${e.eval()}).toUpperCase()`;
        },
        Val(_upperLit, _open, e, _close) {
            const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
            const numStr = String(e.eval());
            if (numPattern.test(numStr)) {
                return `Number(${numStr})`; // for non-hex/bin number strings we can use this simple version
            }
            semanticsHelper.addInstr("val");
            return `val(${numStr})`;
        },
        Wend(_wendLit) {
            semanticsHelper.addIndent(-2);
            return '}';
        },
        While(_whileLit, e) {
            const cond = e.eval();
            semanticsHelper.nextIndentAdd(2);
            return `while (${cond}) {`;
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
            return `-(${a.eval()} === ${b.eval()})`; // or -Number(...), or -(...), or: ? -1 : 0
        },
        CmpExp_ne(a, _op, b) {
            return `-(${a.eval()} !== ${b.eval()})`;
        },
        CmpExp_lt(a, _op, b) {
            return `-(${a.eval()} < ${b.eval()})`;
        },
        CmpExp_le(a, _op, b) {
            return `-(${a.eval()} <= ${b.eval()})`;
        },
        CmpExp_gt(a, _op, b) {
            return `-(${a.eval()} > ${b.eval()})`;
        },
        CmpExp_ge(a, _op, b) {
            return `-(${a.eval()} >= ${b.eval()})`;
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
            return `((${a.eval()} / ${b.eval()}) | 0)`;
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
            return `+${e.eval()}`;
        },
        PriExp_neg(_op, e) {
            return `-${e.eval()}`;
        },
        StrCmpExp_eq(a, _op, b) {
            return `-(${a.eval()} === ${b.eval()})`;
        },
        StrCmpExp_ne(a, _op, b) {
            return `-(${a.eval()} !== ${b.eval()})`;
        },
        StrCmpExp_lt(a, _op, b) {
            return `-(${a.eval()} < ${b.eval()})`;
        },
        StrCmpExp_le(a, _op, b) {
            return `-(${a.eval()} <= ${b.eval()})`;
        },
        StrCmpExp_gt(a, _op, b) {
            return `-(${a.eval()} > ${b.eval()})`;
        },
        StrCmpExp_ge(a, _op, b) {
            return `-(${a.eval()} >= ${b.eval()})`;
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
            return [ident.eval(), ...indices.eval()];
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
        signedDecimal(sign, value) {
            return `${sign.sourceString}${value.sourceString}`;
        },
        string(_quote1, e, _quote2) {
            return `"${e.sourceString}"`;
        },
        ident(ident) {
            const name = ident.sourceString;
            return semanticsHelper.getVariable(name);
        },
        fnIdent(fn, ident) {
            const name = fn.sourceString + ident.sourceString;
            return semanticsHelper.getVariable(name);
        },
        strIdent(ident, typeSuffix) {
            const name = ident.sourceString + typeSuffix.sourceString;
            return semanticsHelper.getVariable(name);
        },
        strFnIdent(fn, ident, typeSuffix) {
            const name = fn.sourceString + ident.sourceString + typeSuffix.sourceString;
            return semanticsHelper.getVariable(name);
        }
    };
    return semantics;
}
export class Semantics {
    constructor() {
        this.lineIndex = 0;
        this.indent = 0;
        this.indentAdd = 0;
        this.variables = {};
        this.definedLabels = [];
        this.gosubLabels = {};
        this.dataList = [];
        this.dataIndex = 0;
        this.restoreMap = {};
        this.instrMap = {};
        this.isDeg = false;
    }
    addIndent(num) {
        if (num < 0) {
            this.applyNextIndent();
        }
        this.indent += num;
        return this.indent;
    }
    setIndent(indent) {
        this.indent = indent;
    }
    getIndent() {
        return this.indent;
    }
    getIndentStr() {
        if (this.indent < 0) {
            console.error("getIndentStr: lineIndex=", this.lineIndex, ", indent=", this.indent);
            return "";
        }
        return " ".repeat(this.indent);
    }
    applyNextIndent() {
        this.indent += this.indentAdd;
        this.indentAdd = 0;
    }
    nextIndentAdd(num) {
        this.indentAdd += num;
    }
    addDataIndex(count) {
        return this.dataIndex += count;
    }
    getDataIndex() {
        return this.dataIndex;
    }
    addDefinedLabel(label, line) {
        this.definedLabels.push({
            label,
            first: line,
            last: -1,
            dataIndex: -1
        });
    }
    getDefinedLabels() {
        return this.definedLabels;
    }
    addGosubLabel(label) {
        this.gosubLabels[label] = this.gosubLabels[label] || {
            count: 0
        };
        this.gosubLabels[label].count = (this.gosubLabels[label].count || 0) + 1;
    }
    getGosubLabels() {
        return this.gosubLabels;
    }
    getInstrMap() {
        return this.instrMap;
    }
    addInstr(name) {
        this.instrMap[name] = (this.instrMap[name] || 0) + 1;
        return this.instrMap[name];
    }
    getVariables() {
        return Object.keys(this.variables);
    }
    getVariable(name) {
        name = name.toLowerCase();
        if (Semantics.reJsKeyword.test(name)) {
            name = `_${name}`;
        }
        this.variables[name] = (this.variables[name] || 0) + 1;
        return name;
    }
    static deleteAllItems(items) {
        for (const name in items) {
            delete items[name];
        }
    }
    incrementLineIndex() {
        this.lineIndex += 1;
        return this.lineIndex;
    }
    getRestoreMap() {
        return this.restoreMap;
    }
    addRestoreLabel(label) {
        this.restoreMap[label] = -1;
    }
    getDataList() {
        return this.dataList;
    }
    resetParser() {
        this.lineIndex = 0;
        this.indent = 0;
        this.indentAdd = 0;
        Semantics.deleteAllItems(this.variables);
        this.definedLabels.length = 0;
        Semantics.deleteAllItems(this.gosubLabels);
        this.dataList.length = 0;
        this.dataIndex = 0;
        Semantics.deleteAllItems(this.restoreMap);
        Semantics.deleteAllItems(this.instrMap);
        this.isDeg = false;
    }
    getSemantics() {
        const semanticsHelper = {
            addDataIndex: (count) => this.addDataIndex(count),
            addDefinedLabel: (label, line) => this.addDefinedLabel(label, line),
            addGosubLabel: (label) => this.addGosubLabel(label),
            addIndent: (num) => this.addIndent(num),
            addInstr: (name) => this.addInstr(name),
            addRestoreLabel: (label) => this.addRestoreLabel(label),
            applyNextIndent: () => this.applyNextIndent(),
            getDataIndex: () => this.getDataIndex(),
            getDataList: () => this.getDataList(),
            getDefinedLabels: () => this.getDefinedLabels(),
            getGosubLabels: () => this.getGosubLabels(),
            getIndent: () => this.getIndent(),
            getIndentStr: () => this.getIndentStr(),
            getInstrMap: () => this.getInstrMap(),
            getRestoreMap: () => this.getRestoreMap(),
            getVariable: (name) => this.getVariable(name),
            getVariables: () => this.getVariables(),
            incrementLineIndex: () => this.incrementLineIndex(),
            nextIndentAdd: (num) => this.nextIndentAdd(num),
            setIndent: (indent) => this.setIndent(indent),
            setDeg: (isDeg) => this.isDeg = isDeg,
            getDeg: () => this.isDeg
        };
        return getSemantics(semanticsHelper);
    }
}
Semantics.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
//# sourceMappingURL=Semantics.js.map