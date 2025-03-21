function getCodeSnippets() {
    const _o = {};
    const _data = [];
    let _dataPtr = 0;
    const _restoreMap = {};
    const _startTime = 0;
    const frame = async () => { }; // dummy
    const codeSnippets = {
        bin$: function bin$(num, pad = 0) {
            return num.toString(2).toUpperCase().padStart(pad, "0");
        },
        cls: function cls() {
            _o.cls();
        },
        dec$: function dec$(num, format) {
            const decimals = (format.split(".")[1] || "").length;
            const str = num.toFixed(decimals);
            const pad = " ".repeat(Math.max(0, format.length - str.length));
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
        draw: function draw(x, y) {
            _o.drawMovePlot("L", x, y);
        },
        drawr: function drawr(x, y) {
            _o.drawMovePlot("l", x, y);
        },
        end: function end() {
            _o.flush();
            return "end";
        },
        frame: async function frame() {
            _o.flush();
            if (_o.getEscape()) {
                throw new Error("INFO: Program stopped");
            }
            return new Promise(resolve => setTimeout(() => resolve(), Date.now() % 50));
        },
        graphicsPen: function graphicsPen(num) {
            _o.graphicsPen(num);
        },
        hex$: function hex$(num, pad) {
            return num.toString(16).toUpperCase().padStart(pad || 0, "0");
        },
        ink: function ink(num, col) {
            _o.ink(num, col);
        },
        inkey$: async function inkey$() {
            await frame();
            return await _o.inkey$();
        },
        input: async function input(msg, isNum) {
            await frame();
            const input = await _o.input(msg);
            if (input === null) {
                throw new Error("INFO: Input canceled");
            }
            else if (isNum && isNaN(Number(input))) {
                throw new Error("Invalid number input");
            }
            else {
                return isNum ? Number(input) : input;
            }
        },
        mid$Assign: function mid$Assign(s, start, newString, len) {
            start -= 1;
            len = Math.min(len !== null && len !== void 0 ? len : newString.length, newString.length, s.length - start);
            return s.substring(0, start) + newString.substring(0, len) + s.substring(start + len);
        },
        mode: function mode(num) {
            _o.mode(num);
        },
        move: function move(x, y) {
            _o.drawMovePlot("M", x, y);
        },
        mover: function mover(x, y) {
            _o.drawMovePlot("m", x, y);
        },
        paper: function paper(n) {
            _o.paper(n);
        },
        pen: function pen(n) {
            _o.pen(n);
        },
        plot: function plot(x, y) {
            _o.drawMovePlot("P", x, y);
        },
        plotr: function plotr(x, y) {
            _o.drawMovePlot("p", x, y);
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
        stop: function stop() {
            _o.flush();
            return "stop";
        },
        str$: function str$(num) {
            return num >= 0 ? ` ${num}` : String(num);
        },
        time: function time() {
            return ((Date.now() - _startTime) * 3 / 10) | 0;
        },
        val: function val(str) {
            return Number(str.replace("&x", "0b").replace("&", "0x"));
        }
    };
    return codeSnippets;
}
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
    return children.map(child => child.eval());
}
function createComparisonExpression(a, op, b) {
    return `-(${a.eval()} ${op} ${b.eval()})`;
}
function getSemantics(semanticsHelper) {
    const drawMovePlot = (lit, x, _comma1, y, _comma2, e3) => {
        var _a;
        const command = lit.sourceString.toLowerCase();
        semanticsHelper.addInstr(command);
        const pen = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
        let penStr = "";
        if (pen !== undefined) {
            semanticsHelper.addInstr("graphicsPen");
            penStr = `graphicsPen(${pen}); `;
        }
        return penStr + `${command}(${x.eval()}, ${y.eval()})`;
    };
    const cosSinTan = (lit, _open, e, _close) => {
        const func = lit.sourceString.toLowerCase();
        return semanticsHelper.getDeg() ? `Math.${func}((${e.eval()}) * Math.PI / 180)` : `Math.${func}(${e.eval()})`;
    };
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
                    lineList[label.last] += `\n${indentStr}}`;
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
            let needsStartTime = false;
            for (const key of Object.keys(codeSnippets)) {
                if (instrMap[key]) {
                    const code = String((codeSnippets[key]).toString());
                    const adaptedCode = trimIndent(code);
                    lineList.push(adaptedCode);
                    if (adaptedCode.startsWith("async ")) {
                        needsAsync = true;
                    }
                    if (adaptedCode.includes("_startTime")) {
                        needsStartTime = true;
                    }
                }
            }
            if (variableDeclarations) {
                lineList.unshift(variableDeclarations);
            }
            if (needsStartTime) {
                lineList.unshift(`const _startTime = Date.now();`);
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
        Cos: cosSinTan,
        Cint(_cintLit, _open, e, _close) {
            return `Math.round(${e.eval()})`;
        },
        Cls(_clsLit) {
            semanticsHelper.addInstr("cls");
            return `cls()`;
        },
        Data(_datalit, args) {
            const argList = evalChildren(args.asIteration().children);
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
            const argList = evalChildren(arrayIdents.asIteration().children);
            return `(${argList.join(", ")})`;
        },
        DefAssign(ident, args, _equal, e) {
            const fnIdent = semanticsHelper.getVariable(`fn${ident.sourceString}`);
            semanticsHelper.setDefContext(true); // do not create global variables in this context
            const argStr = evalChildren(args.children).join(", ") || "()";
            const defBody = e.eval();
            semanticsHelper.setDefContext(false);
            return `${fnIdent} = ${argStr} => ${defBody}`;
        },
        Deg(_degLit) {
            semanticsHelper.setDeg(true);
            return `/* deg active */`;
        },
        Dim(_dimLit, dimArgs) {
            const argumentList = evalChildren(dimArgs.asIteration().children);
            semanticsHelper.addInstr("dim");
            return argumentList.join("; ");
        },
        Draw: drawMovePlot,
        Drawr: drawMovePlot,
        End(_endLit) {
            semanticsHelper.addInstr("end");
            return `return end()`;
        },
        Erase(_eraseLit, arrayIdents) {
            const arrayIdentifiers = evalChildren(arrayIdents.asIteration().children);
            const results = [];
            for (const ident of arrayIdentifiers) {
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
        AnyFnArgs(_open, args, _close) {
            const argumentList = evalChildren(args.asIteration().children);
            return `(${argumentList.join(", ")})`;
        },
        FnIdent(fnIdent, args) {
            var _a;
            const argumentString = ((_a = args.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "()";
            return `${fnIdent.eval()}${argumentString}`;
        },
        StrFnIdent(fnIdent, args) {
            var _a;
            const argStr = ((_a = args.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "()";
            return `${fnIdent.eval()}${argStr}`;
        },
        For(_forLit, variable, _eqSign, start, _dirLit, end, _stepLit, step) {
            var _a;
            const variableExpression = variable.eval();
            const startExpression = start.eval();
            const endExpression = end.eval();
            const stepExpression = ((_a = step.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "1";
            const stepAsNumber = Number(stepExpression);
            let comparisonStatement = "";
            if (isNaN(stepAsNumber)) {
                comparisonStatement = `${stepExpression} >= 0 ? ${variableExpression} <= ${endExpression} : ${variableExpression} >= ${endExpression}`;
            }
            else {
                comparisonStatement = stepAsNumber >= 0 ? `${variableExpression} <= ${endExpression}` : `${variableExpression} >= ${endExpression}`;
            }
            semanticsHelper.nextIndentAdd(2);
            const result = `for (${variableExpression} = ${startExpression}; ${comparisonStatement}; ${variableExpression} += ${stepExpression}) {`;
            return result;
        },
        Frame(_frameLit) {
            semanticsHelper.addInstr("frame");
            return `await frame()`;
        },
        Gosub(_gosubLit, e) {
            const labelString = e.sourceString;
            semanticsHelper.addGosubLabel(labelString);
            return `_${labelString}()`;
        },
        GraphicsPen(_graphicsLit, _penLit, e) {
            semanticsHelper.addInstr("graphicsPen");
            return `graphicsPen(${e.eval()})`;
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
            const condition = condExp.eval();
            const thenStatement = thenStat.eval();
            let result = `if (${condition}) {\n${increasedIndent}${thenStatement}\n${initialIndent}}`; // put in newlines to also allow line comments
            if (elseLit.sourceString) {
                const elseStatement = evalChildren(elseStat.children).join('; ');
                result += ` else {\n${increasedIndent}${elseStatement}\n${initialIndent}}`;
            }
            semanticsHelper.addIndent(-2);
            return result;
        },
        Ink(_inkLit, num, _comma, col, _comma2, _col2) {
            semanticsHelper.addInstr("ink");
            return `ink(${num.eval()}, ${col.eval()})`;
        },
        InkeyS(_inkeySLit) {
            semanticsHelper.addInstr("inkey$");
            semanticsHelper.addInstr("frame");
            return `await inkey$()`;
        },
        Input(_inputLit, message, _semi, e) {
            semanticsHelper.addInstr("input");
            semanticsHelper.addInstr("frame");
            const messageString = message.sourceString.replace(/\s*[;,]$/, "");
            const identifier = e.eval();
            const isNumberString = identifier.includes("$") ? "" : ", true";
            return `${identifier} = await input(${messageString}${isNumberString})`;
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
            const argumentList = evalChildren(args.asIteration().children);
            return `Math.max(${argumentList})`;
        },
        MidS(_midLit, _open, e1, _comma1, e2, _comma2, e3, _close) {
            var _a;
            const length = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            const lengthString = length === undefined ? "" : `, ${length}`;
            return `(${e1.eval()}).substr(${e2.eval()} - 1${lengthString})`;
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
            const argumentList = evalChildren(args.asIteration().children);
            return `Math.min(${argumentList})`;
        },
        Mode(_modeLit, e) {
            semanticsHelper.addInstr("mode");
            return `mode(${e.eval()})`;
        },
        Move: drawMovePlot,
        Mover: drawMovePlot,
        Next(_nextLit, variables) {
            const argumentList = evalChildren(variables.asIteration().children);
            if (!argumentList.length) {
                argumentList.push("_any");
            }
            semanticsHelper.addIndent(-2 * argumentList.length);
            return '} '.repeat(argumentList.length).slice(0, -1);
        },
        On(_nLit, e1, _gosubLit, args) {
            const index = e1.eval();
            const argumentList = args.asIteration().children.map(child => child.sourceString);
            for (let i = 0; i < argumentList.length; i += 1) {
                semanticsHelper.addGosubLabel(argumentList[i]);
            }
            return `([${argumentList.map((label) => `_${label}`).join(",")}]?.[${index} - 1] || (() => undefined))()`; // 1-based index
        },
        Paper(_paperLit, e) {
            semanticsHelper.addInstr("paper");
            return `paper(${e.eval()})`;
        },
        Pen(_penLit, e) {
            semanticsHelper.addInstr("pen");
            return `pen(${e.eval()})`;
        },
        Pi(_piLit) {
            return "Math.PI";
        },
        Plot: drawMovePlot,
        Plotr: drawMovePlot,
        PrintArg_strCmp(_cmp, args) {
            const parameterString = args.children[0].eval();
            return parameterString;
        },
        PrintArg_usingNum(_printLit, format, _semi, numArgs) {
            semanticsHelper.addInstr("dec$");
            const formatString = format.eval();
            const argumentList = evalChildren(numArgs.asIteration().children);
            const parameterString = argumentList.map((arg) => `dec$(${arg}, ${formatString})`).join(', ');
            return parameterString;
        },
        Print(_printLit, args, semi) {
            semanticsHelper.addInstr("print");
            const argumentList = evalChildren(args.asIteration().children);
            const parameterString = argumentList.join(', ') || "";
            let newlineString = "";
            if (!semi.sourceString) {
                newlineString = parameterString ? `, "\\n"` : `"\\n"`;
            }
            return `print(${parameterString}${newlineString})`;
        },
        Rad(_radLit) {
            semanticsHelper.setDeg(false);
            return `/* rad active */`;
        },
        Read(_readlit, args) {
            semanticsHelper.addInstr("read");
            const argumentList = evalChildren(args.asIteration().children);
            const results = argumentList.map(identifier => `${identifier} = read()`);
            return results.join("; ");
        },
        Rem(_remLit, remain) {
            return `// ${remain.sourceString}`;
        },
        Restore(_restoreLit, e) {
            const labelString = e.sourceString || "0";
            semanticsHelper.addRestoreLabel(labelString);
            semanticsHelper.addInstr("restore");
            return `restore(${labelString})`;
        },
        Return(_returnLit) {
            return "return";
        },
        RightS(_rightLit, _open, e1, _comma, e2, _close) {
            const string = e1.eval();
            const length = e2.eval();
            return `(${string}).substring((${string}).length - (${length}))`;
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
        Sin: cosSinTan,
        SpaceS(_stringLit, _open, len, _close) {
            return `" ".repeat(${len.eval()})`;
        },
        Sqr(_sqrLit, _open, e, _close) {
            return `Math.sqrt(${e.eval()})`;
        },
        Stop(_stopLit) {
            semanticsHelper.addInstr("stop");
            return `return stop()`;
        },
        StrS(_strLit, _open, e, _close) {
            const argument = e.eval();
            if (isNaN(Number(argument))) {
                semanticsHelper.addInstr("str$");
                return `str$(${argument})`;
            }
            // simplify if we know at compile time that arg is a positive number
            return argument >= 0 ? `(" " + String(${argument}))` : `String(${argument})`;
        },
        StringS_str(_stringLit, _open, len, _commaLit, chr, _close) {
            // Note: we do not use charAt(0) to get just one char
            return `(${chr.eval()}).repeat(${len.eval()})`;
        },
        StringS_num(_stringLit, _open, len, _commaLit, num, _close) {
            return `String.fromCharCode(${num.eval()}).repeat(${len.eval()})`;
        },
        Tan: cosSinTan,
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
            return createComparisonExpression(a, "===", b);
        },
        CmpExp_ne(a, _op, b) {
            return createComparisonExpression(a, "!==", b);
        },
        CmpExp_lt(a, _op, b) {
            return createComparisonExpression(a, "<", b);
        },
        CmpExp_le(a, _op, b) {
            return createComparisonExpression(a, "<=", b);
        },
        CmpExp_gt(a, _op, b) {
            return createComparisonExpression(a, ">", b);
        },
        CmpExp_ge(a, _op, b) {
            return createComparisonExpression(a, ">=", b);
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
            //return args.asIteration().children.map(c => String(c.eval())).join("][");
            return evalChildren(args.asIteration().children).join("][");
        },
        ArrayIdent(ident, _open, e, _close) {
            return `${ident.eval()}[${e.eval()}]`;
        },
        StrArrayIdent(ident, _open, e, _close) {
            return `${ident.eval()}[${e.eval()}]`;
        },
        DimArrayArgs(args) {
            //return args.asIteration().children.map(c => String(c.eval())).join(", ");
            return evalChildren(args.asIteration().children).join(", ");
        },
        DimArrayIdent(ident, _open, indices, _close) {
            const identStr = ident.eval();
            const initValStr = identStr.endsWith("$") ? ', ""' : '';
            semanticsHelper.addInstr("dim");
            return `${identStr} = dim([${indices.eval()}]${initValStr})`;
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
        this.isDefContext = false;
    }
    getDeg() {
        return this.isDeg;
    }
    setDeg(isDeg) {
        this.isDeg = isDeg;
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
        if (!this.isDefContext) {
            this.variables[name] = (this.variables[name] || 0) + 1;
        }
        return name;
    }
    setDefContext(isDef) {
        this.isDefContext = isDef;
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
        this.isDefContext = false;
    }
    getSemantics() {
        return getSemantics(this);
    }
}
Semantics.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
//# sourceMappingURL=Semantics.js.map