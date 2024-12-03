function evalChildren(children) {
    return children.map(c => c.eval());
}
function getSemantics(semanticsHelper) {
    // Semantics to evaluate an arithmetic expression
    const semantics = {
        Program(lines) {
            const lineList = evalChildren(lines.children);
            const variableList = semanticsHelper.getVariables();
            const varStr = variableList.length ? "let " + variableList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";\n" : "";
            // find subroutines
            const definedLabels = semanticsHelper.getDefinedLabels();
            const gosubLabels = semanticsHelper.getGosubLabels();
            const restoreMap = semanticsHelper.getRestoreMap();
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
            const dataList = semanticsHelper.getDataList();
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
            const currentLineIndex = semanticsHelper.incrementLineIndex() - 1;
            if (labelStr) {
                semanticsHelper.addDefinedLabel(labelStr, currentLineIndex);
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
            //lineIndex += 1;
            return lineStr + commentStr + semi;
        },
        Statements(stmt, _stmtSep, stmts) {
            // separate statements, use ";", if the last stmt does not end with "{"
            return [stmt.eval(), ...evalChildren(stmts.children)].reduce((str, st) => str.endsWith("{") ? `${str} ${st}` : `${str}; ${st}`);
        },
        ArrayAssign(ident, _op, e) {
            return `${ident.eval()} = ${e.eval()}`;
        },
        Assign(ident, _op, e) {
            const name = ident.sourceString;
            const name2 = semanticsHelper.getVariable(name);
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
                newlineStr = paramStr ? `, "\\n"` : `"\\n"`;
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
            const dataList = semanticsHelper.getDataList();
            const definedLabels = semanticsHelper.getDefinedLabels();
            const dataIndex = dataList.length;
            if (definedLabels.length) {
                const currentLabel = definedLabels[definedLabels.length - 1];
                currentLabel.dataIndex = dataIndex;
            }
            dataList.push(argList.join(", "));
            //defineData(argList);
            return "";
        },
        Dim(_dimLit, arrayIdents) {
            const argList = arrayIdents.asIteration().children.map(c => c.eval());
            const results = [];
            for (const arg of argList) {
                const [ident, ...indices] = arg;
                let createArrStr;
                if (indices.length > 1) { // multi-dimensional?
                    const initValStr = ident.endsWith("$") ? ', " "' : '';
                    createArrStr = `_o.dimArray([${indices}]${initValStr})`; // automatically joined with comma
                }
                else {
                    const fillStr = ident.endsWith("$") ? `" "` : "0";
                    createArrStr = `new Array(${indices[0]} + 1).fill(${fillStr})`; // +1 because of 0-based index
                }
                results.push(`${ident} = ${createArrStr}`);
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
            semanticsHelper.addGosubLabel(labelStr);
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
                semanticsHelper.addGosubLabel(argList[i]);
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
            semanticsHelper.addRestoreLabel(labelStr);
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
            const arg = e.eval();
            let argStr;
            if (isNaN(Number(arg))) {
                argStr = `(((${arg}) >= 0) ? " " : "") + String(${arg})`;
            }
            else {
                argStr = arg >= 0 ? `" " + String(${arg})` : `String(${arg})`;
            }
            return argStr;
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
            return semanticsHelper.getVariable(name);
        },
        strIdent(ident, typeSuffix) {
            const name = ident.sourceString + typeSuffix.sourceString;
            return semanticsHelper.getVariable(name);
        }
    };
    return semantics;
}
export class Semantics {
    constructor() {
        this.variables = {};
        this.definedLabels = [];
        this.gosubLabels = {};
        this.lineIndex = 0;
        this.dataList = [];
        this.restoreMap = {};
    }
    getSemantics() {
        const semanticsHelper = {
            addDefinedLabel: (label, line) => this.addDefinedLabel(label, line),
            addGosubLabel: (label) => this.addGosubLabel(label),
            addRestoreLabel: (label) => this.addRestoreLabel(label),
            getDataList: () => this.getDataList(),
            getDefinedLabels: () => this.getDefinedLabels(),
            getGosubLabels: () => this.getGosubLabels(),
            getRestoreMap: () => this.getRestoreMap(),
            getVariable: (name) => this.getVariable(name),
            getVariables: () => this.getVariables(),
            incrementLineIndex: () => this.incrementLineIndex()
        };
        return getSemantics(semanticsHelper);
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
    deleteAllItems(items) {
        for (const name in items) { // eslint-disable-line guard-for-in
            delete items[name];
        }
    }
    getGosubLabels() {
        return this.gosubLabels;
    }
    incrementLineIndex() {
        this.lineIndex += 1;
        return this.lineIndex;
    }
    getDefinedLabels() {
        return this.definedLabels;
    }
    addDefinedLabel(label, line) {
        this.definedLabels.push({
            label,
            first: line,
            last: -1,
            dataIndex: -1
        });
    }
    addGosubLabel(label) {
        this.gosubLabels[label] = this.gosubLabels[label] || {
            count: 0
        };
        this.gosubLabels[label].count = (this.gosubLabels[label].count || 0) + 1;
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
        this.deleteAllItems(this.variables);
        this.definedLabels.length = 0;
        this.deleteAllItems(this.gosubLabels);
        this.lineIndex = 0;
        this.dataList.length = 0;
        this.deleteAllItems(this.restoreMap);
    }
}
Semantics.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
//# sourceMappingURL=Semantics.js.map