import { SemanticsHelper } from "./SemanticsHelper";
import { CommaOpChar, TabOpChar } from "./Constants";
function evalChildren(children) {
    return children.map(child => child.eval());
}
function evalOptionalArg(arg) {
    var _a;
    const argEval = (_a = arg.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
    return argEval !== undefined ? `, ${argEval}` : "";
}
function createComparisonExpression(a, op, b) {
    return `-(${a.eval()} ${op} ${b.eval()})`;
}
function expandLetterRanges(lettersAndRanges) {
    // a list of single letters "a" or range "a-b", expand to single letters
    const letters = lettersAndRanges.flatMap(x => x.length === 1
        ? x
        : Array.from({ length: x.charCodeAt(2) - x.charCodeAt(0) + 1 }, (_, i) => String.fromCharCode(x.charCodeAt(0) + i)));
    return letters;
}
function getSemanticsActions(semanticsHelper) {
    const adaptIdentName = (str) => str.replace(/\./g, "_");
    const drawMovePlot = (lit, x, _comma1, y, _comma2, pen, _comma3, mode) => {
        const command = lit.sourceString.toLowerCase();
        semanticsHelper.addInstr(command);
        const modeStr = mode.child(0) ? notSupported(mode.child(0)) : "";
        return `${command}(${x.eval()}, ${y.eval()}${evalOptionalArg(pen)}${modeStr})`;
    };
    const cosSinTan = (lit, _open, num, _close) => {
        const func = lit.sourceString.toLowerCase();
        semanticsHelper.addInstr(func);
        if (!semanticsHelper.getDeg()) {
            return `${func}(${num.eval()})`;
        }
        semanticsHelper.addInstr("toRad");
        return `${func}(toRad(${num.eval()}))`;
    };
    const loopBlock = (startNode, content, separator, endNode) => {
        const startStr = startNode.eval();
        const contentStr = evalChildren(content.children).join(';');
        const endStr = endNode.eval();
        let separatorStr = separator.eval();
        if (contentStr && !contentStr.endsWith("}")) {
            separatorStr = ";" + separatorStr;
        }
        return `${startStr}${contentStr}${separatorStr}${endStr}`;
    };
    const uncommentNotSupported = (str) => {
        const regExpNotSupp = new RegExp("/\\* not supported: (.*) \\*/");
        if (regExpNotSupp.test(str)) {
            return str.replace(regExpNotSupp, "$1");
        }
        return str;
    };
    const evalAnyFn = (arg) => {
        if (arg.isIteration()) {
            return arg.children.map(evalAnyFn).join(",");
        }
        else if (arg.isLexical() || arg.isTerminal()) {
            return arg.sourceString;
        }
        const argStr = arg.eval();
        return uncommentNotSupported(argStr);
    };
    const notSupported = (str, ...args) => {
        const name = evalAnyFn(str);
        const argList = args.map(evalAnyFn);
        const argStr = argList.length ? ` ${argList.join(" ")}` : "";
        const message = str.source.getLineAndColumnMessage();
        semanticsHelper.addCompileMessage(`WARNING: Not supported: ${message}`);
        return `/* not supported: ${name}${uncommentNotSupported(argStr)} */`;
    };
    function processSubroutines(lineList, definedLabels, variableList, variableScopes) {
        const usedLabels = semanticsHelper.getUsedLabels();
        const gosubLabels = usedLabels["gosub"] || {};
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
                // determine which variables are local to this function only
                const funcVars = [];
                for (const varName of variableList) {
                    const usage = variableScopes[varName];
                    if (usage[subroutineStart.label] && Object.keys(usage).length === 1) {
                        funcVars.push(varName);
                    }
                }
                let hasAwait = false;
                for (let i = first; i <= label.last; i += 1) {
                    if (lineList[i].includes("await ")) {
                        hasAwait = true; // quick check
                    }
                    lineList[i] = "  " + lineList[i]; // indent
                    lineList[i] = lineList[i].replace(/\n/g, "\n  ");
                }
                const asyncStr = hasAwait ? "async " : "";
                // Add function-local variable declarations if any
                let funcVarDecl = "";
                if (funcVars.length > 0) {
                    funcVarDecl = `\n${indentStr}  let ` + funcVars.map((v) => { var _a; return ((_a = semanticsHelper.getVariableEntry(v)) === null || _a === void 0 ? void 0 : _a.type) === "A" ? `${v} = []` : v.endsWith("$") ? `${v} = ""` : `${v} = 0`; }).join(", ") + ";";
                }
                lineList[first] = `${indentStr}${asyncStr}function _${subroutineStart.label}() {${funcVarDecl}${indentStr}\n` + lineList[first];
                lineList[label.last] = lineList[label.last].replace(`${indentStr}  return;`, `${indentStr}}`); // end of subroutine: replace "return" by "}" (can also be on same line)
                if (hasAwait) {
                    awaitLabels.push(subroutineStart.label);
                }
                subroutineStart = undefined;
            }
        }
        return awaitLabels;
    }
    const addSemicolon = (str) => {
        return str.endsWith("}") ? str : str + ";"; // add semicolon, but not for closing bracket
    };
    const stringCapitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.substring(1);
    };
    const semantics = {
        Program(lines) {
            const lineList = evalChildren(lines.children);
            const variableList = semanticsHelper.getVariables();
            const variableScopes = semanticsHelper.getVariableScopes();
            // Create global variable declarations (excluding function-local ones)
            const globalVars = variableList.filter(varName => {
                const usage = variableScopes[varName];
                return usage[""] || Object.keys(usage).length !== 1;
            });
            const variableDeclarations = globalVars.length ? "let " + globalVars.map((v) => { var _a; return ((_a = semanticsHelper.getVariableEntry(v)) === null || _a === void 0 ? void 0 : _a.type) === "A" ? `${v} = []` : v.endsWith("$") ? `${v} = ""` : `${v} = 0`; }).join(", ") + ";" : "";
            const definedLabels = semanticsHelper.getDefinedLabels();
            const awaitLabels = processSubroutines(lineList, definedLabels, variableList, variableScopes);
            const instrMap = semanticsHelper.getInstrMap();
            const dataList = semanticsHelper.getDataList();
            // Prepare data definition snippet if needed
            let dataListSnippet = "";
            if (dataList.length) {
                const restoreMap = semanticsHelper.getRestoreMap();
                for (const label of definedLabels) {
                    if (restoreMap[label.label] === -1) {
                        restoreMap[label.label] = label.dataIndex;
                    }
                }
                for (const key of Object.keys(restoreMap)) {
                    if (restoreMap[key] < 0) {
                        restoreMap[key] = 0;
                    }
                }
                dataListSnippet = `
function _defineData() {
	_o._data = [
${dataList.join(",\n")}
	];
	_o._restoreMap = ${JSON.stringify(restoreMap)};
}
`;
            }
            const libraryFunctions = Object.keys(instrMap).sort();
            // Assemble code lines
            const codeLines = [
                '"use strict";',
                libraryFunctions ? `const {${libraryFunctions.join(", ")}} = _o;` : '',
                dataList.length ? '_defineData();' : '',
                variableDeclarations,
                ...lineList.filter(line => line.trimEnd() !== ''),
                dataListSnippet
            ].filter(Boolean);
            let lineStr = codeLines.join('\n');
            if (!lineStr.endsWith("\n")) {
                lineStr += "\n";
            }
            if (awaitLabels.length) {
                for (const label of awaitLabels) {
                    const regEx = new RegExp(`_${label}\\(\\);`, "g");
                    lineStr = lineStr.replace(regEx, `await _${label}();`);
                }
            }
            return lineStr;
        },
        LabelRange(start, minus, end) {
            return [start, minus, end].map((node) => evalAnyFn(node)).join("");
        },
        LetterRange(start, minus, end) {
            return [start, minus, end].map((node) => evalAnyFn(node)).join("");
        },
        Line(label, stmts, colons2, comment, _eol) {
            const labelString = label.sourceString;
            const currentLineIndex = semanticsHelper.incrementLineIndex() - 1;
            if (labelString) {
                semanticsHelper.addDefinedLabel(labelString, currentLineIndex);
                // Check if this is a gosub label and set it as current function
                const usedLabels = semanticsHelper.getUsedLabels();
                const gosubLabels = usedLabels["gosub"] || {};
                if (gosubLabels[labelString]) {
                    semanticsHelper.setCurrentFunction(labelString);
                }
            }
            const lineStr = stmts.eval();
            if (colons2.children.length) { // are there trailing colons?
                notSupported(colons2);
            }
            if (lineStr === "return") {
                const definedLabels = semanticsHelper.getDefinedLabels();
                if (definedLabels.length) {
                    const lastLabelItem = definedLabels[definedLabels.length - 1];
                    lastLabelItem.last = currentLineIndex;
                }
                // reset current function when returning
                semanticsHelper.setCurrentFunction("");
            }
            const commentStr = comment.sourceString ? `; //${comment.sourceString.substring(1)}` : "";
            const semi = lineStr === "" || lineStr.endsWith("{") || lineStr.endsWith("}") || lineStr.startsWith("//") || commentStr ? "" : ";";
            const indentStr = semanticsHelper.getIndentStr();
            return indentStr + lineStr + commentStr + semi;
        },
        Statements(colons1, stmt, colons2, stmts) {
            var _a;
            if (colons1.children.length) { // are there leading colons?
                notSupported(colons1);
            }
            // separate statements, use ";", if the last stmt does not end with "{"
            if (((_a = colons2.child(0)) === null || _a === void 0 ? void 0 : _a.children.length) > 1) { // are there additional colons between statements?
                notSupported(colons2.child(0)); // ok, let's mark all
            }
            const statements = [stmt.eval(), ...evalChildren(stmts.children)];
            return statements.reduce((acc, current) => acc.endsWith("{") ? `${acc} ${current}` : `${acc}; ${current}`);
        },
        ArrayAssign(ident, _op, e) {
            return `${ident.eval()} = ${e.eval()}`;
        },
        Assign(ident, _op, e) {
            const variableName = ident.eval();
            const resolvedVariableName = semanticsHelper.getVariable(variableName);
            const value = e.eval();
            return `${resolvedVariableName} = ${value}`;
        },
        LoopBlockContent(separator, stmts) {
            var _a;
            const separatorStr = ((_a = separator === null || separator === void 0 ? void 0 : separator.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const lineStr = stmts.eval();
            return `${separatorStr}${lineStr}`;
        },
        LoopBlockSeparator_colon(colons) {
            if (colons.children.length > 1) { // are there additional colons between statements?
                notSupported(colons); // ok, let's mark all
            }
            return "";
        },
        LoopBlockSeparator_newline(comment, eol, _label) {
            // labels in blocks are ignored
            const commentStr = comment.sourceString ? ` //${comment.sourceString.substring(1)}` : "";
            const eolStr = eol.sourceString + semanticsHelper.getIndentStr();
            return `${commentStr}${eolStr}`;
        },
        Abs(_absLit, _open, e, _close) {
            semanticsHelper.addInstr("abs");
            return `abs(${e.eval()})`; // or inline:`Math.abs(${e.eval()})`
        },
        AddressOf(op, ident) {
            return notSupported(op, ident) + "0";
        },
        After(_afterLit, e1, _comma1, e2, _gosubLit, label) {
            var _a;
            semanticsHelper.addInstr("after");
            const timeout = e1.eval();
            const timer = ((_a = e2.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || 0;
            const labelString = label.sourceString;
            semanticsHelper.addUsedLabel(labelString, "gosub");
            return `after(${timeout}, ${timer}, _${labelString})`;
        },
        Asc(_ascLit, _open, str, _close) {
            semanticsHelper.addInstr("asc");
            return `asc(${str.eval()})`;
        },
        Atn(_atnLit, _open, num, _close) {
            semanticsHelper.addInstr("atn");
            if (!semanticsHelper.getDeg()) {
                return `atn(${num.eval()})`;
            }
            semanticsHelper.addInstr("toDeg");
            return `toDeg(atn(${num.eval()}))`;
        },
        Auto(lit, label, comma, step) {
            return notSupported(lit, label, comma, step);
        },
        BinS(_binLit, _open, num, _comma, pad, _close) {
            semanticsHelper.addInstr("bin$");
            return `bin$(${num.eval()}${evalOptionalArg(pad)})`;
        },
        Border(lit, num, comma, num2) {
            return notSupported(lit, num, comma, num2);
        },
        Call(lit, args) {
            const num = Number(args.asIteration().child(0).eval()); // only works for constants
            let result = "";
            switch (num) {
                case 0xbb06: // fall through...
                case 0xbb18:
                    result = `while (await inkey$() === "") {}`;
                    semanticsHelper.addInstr("inkey$");
                    break;
                case 0xbd19:
                    result = "frame()";
                    semanticsHelper.addInstr("frame");
                    break;
                default:
                    break;
            }
            return notSupported(lit, args.asIteration()) + result;
        },
        Cat: notSupported,
        Chain(lit, merge, file, comma, num, comma2, del) {
            return notSupported(lit, merge, file, comma, num, comma2, del);
        },
        ChrS(_chrLit, _open, e, _close) {
            semanticsHelper.addInstr("chr$");
            return `chr$(${e.eval()})`;
        },
        Cint(_cintLit, _open, e, _close) {
            semanticsHelper.addInstr("cint");
            return `cint(${e.eval()})`;
        },
        Clear_clear: notSupported,
        Clear_input(_lit, _inputLit) {
            semanticsHelper.addInstr("clearInput");
            return "clearInput()";
        },
        Clg(lit, num) {
            return notSupported(lit, num);
        },
        Closein: notSupported,
        Closeout: notSupported,
        Cls(_clsLit, stream) {
            var _a;
            semanticsHelper.addInstr("cls");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            return `cls(${streamStr})`;
        },
        Comment(_commentLit, remain) {
            return `//${remain.sourceString}`;
        },
        Cont: notSupported,
        CopychrS(lit, open, stream, close) {
            return notSupported(lit, open, stream, close) + '" "';
        },
        Cos: cosSinTan,
        Creal(_lit, _open, num, _close) {
            semanticsHelper.addInstr("creal");
            return `creal(${num.eval()})`;
        },
        Cursor(lit, num, comma, num2) {
            return notSupported(lit, num, comma, num2);
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
            semanticsHelper.setDefContextStatus("start"); // do not create global variables in this context
            const name = ident.eval();
            semanticsHelper.setDefContextStatus("collect");
            const argStr = evalChildren(args.children).join(", ") || "()";
            semanticsHelper.setDefContextStatus("use");
            const defBody = e.eval();
            semanticsHelper.setDefContextStatus("");
            const fnIdent = semanticsHelper.getVariable(`fn${name}`);
            return `${fnIdent} = ${argStr} => ${defBody}`;
        },
        Defint(_lit, letterRange) {
            const lettersAndRanges = evalChildren(letterRange.asIteration().children); // a list of single letters "a" or range "a-b"
            const letters = expandLetterRanges(lettersAndRanges);
            semanticsHelper.setVarLetterTypes(letters, "I");
            return `/* defint ${lettersAndRanges.join(",")} */`;
        },
        Defreal(lit, letterRange) {
            return notSupported(lit, letterRange.asIteration());
        },
        Defstr(lit, letterRange) {
            return notSupported(lit, letterRange.asIteration());
        },
        Deg(_degLit) {
            semanticsHelper.setDeg(true);
            return `/* deg */`; // we assume to check it at compile time
        },
        Delete(lit, labelRange) {
            return notSupported(lit, labelRange);
        },
        Derr(lit) {
            return notSupported(lit) + "0";
        },
        Di: notSupported,
        Dim(_dimLit, dimArgs) {
            const argumentList = evalChildren(dimArgs.asIteration().children);
            return argumentList.join("; ");
        },
        Draw: drawMovePlot,
        Drawr: drawMovePlot,
        Edit(lit, label) {
            return notSupported(lit, label);
        },
        Ei: notSupported,
        End(_endLit) {
            semanticsHelper.addInstr("end");
            return `return end()`;
        },
        Ent(lit, nums) {
            return notSupported(lit, nums.asIteration());
        },
        Env(lit, nums) {
            return notSupported(lit, nums.asIteration());
        },
        Eof(lit) {
            return notSupported(lit) + "-1";
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
        Erl(lit) {
            return notSupported(lit) + "0";
        },
        Err(lit) {
            return notSupported(lit) + "0";
        },
        Error(_errorLit, e) {
            return `throw new Error(${e.eval()})`;
        },
        Every(_everyLit, e1, _comma1, e2, _gosubLit, label) {
            var _a;
            semanticsHelper.addInstr("every");
            const timeout = e1.eval();
            const timer = ((_a = e2.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || 0;
            const labelString = label.sourceString;
            semanticsHelper.addUsedLabel(labelString, "gosub");
            return `every(${timeout}, ${timer}, _${labelString})`;
        },
        Exp(_expLit, _open, num, _close) {
            semanticsHelper.addInstr("exp");
            return `exp(${num.eval()})`;
        },
        Fill(lit, num) {
            return notSupported(lit, num);
        },
        Fix(_fixLit, _open, num, _close) {
            semanticsHelper.addInstr("fix");
            return `fix(${num.eval()})`;
        },
        Fre(lit, open, e, close) {
            return notSupported(lit, open, e, close) + "0";
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
            semanticsHelper.addIndent(2);
            const result = `for (${variableExpression} = ${startExpression}; ${comparisonStatement}; ${variableExpression} += ${stepExpression}) {`;
            return result;
        },
        ForNextBlock: loopBlock,
        Frame(_frameLit) {
            semanticsHelper.addInstr("frame");
            return `await frame()`;
        },
        Gosub(_gosubLit, e) {
            const labelString = e.sourceString;
            semanticsHelper.addUsedLabel(labelString, "gosub");
            return `_${labelString}()`;
        },
        Goto(lit, label) {
            return notSupported(lit, label);
        },
        GraphicsPaper(lit, paperLit, num) {
            return notSupported(lit, paperLit, num);
        },
        GraphicsPen(_graphicsLit, _penLit, num, _comma, mode) {
            semanticsHelper.addInstr("graphicsPen");
            const modeStr = mode.child(0) ? notSupported(mode.child(0)) : "";
            return `graphicsPen(${num.eval()}${modeStr})`;
        },
        HexS(_hexLit, _open, num, _comma, pad, _close) {
            semanticsHelper.addInstr("hex$");
            return `hex$(${num.eval()}${evalOptionalArg(pad)})`;
        },
        Himem(lit) {
            return notSupported(lit) + "0";
        },
        IfExp_label(label) {
            return notSupported(label);
        },
        IfThen_then(_thenLit, thenStat) {
            const thenStatement = thenStat.eval();
            return thenStatement;
        },
        If(_iflit, condExp, thenStat, colons, elseLit, elseStat) {
            var _a;
            const initialIndent = semanticsHelper.getIndentStr();
            semanticsHelper.addIndent(2);
            const increasedIndent = semanticsHelper.getIndentStr();
            const condition = condExp.eval();
            const thenStatement = addSemicolon(thenStat.eval());
            if ((_a = colons.child(0)) === null || _a === void 0 ? void 0 : _a.children.length) { // are there colons before else?
                notSupported(colons.child(0));
            }
            let result = `if (${condition}) {\n${increasedIndent}${thenStatement}\n${initialIndent}}`; // put in newlines to also allow line comments
            if (elseLit.sourceString) {
                const elseStatement = addSemicolon(evalChildren(elseStat.children).join('; '));
                result += ` else {\n${increasedIndent}${elseStatement}\n${initialIndent}}`;
            }
            semanticsHelper.addIndent(-2);
            return result;
        },
        Ink(_inkLit, num, _comma, col, _comma2, col2) {
            semanticsHelper.addInstr("ink");
            const col2Str = col2.child(0) ? notSupported(col2.child(0)) : "";
            return `ink(${num.eval()}, ${col.eval()}${col2Str})`;
        },
        Inkey(lit, open, num, close) {
            return notSupported(lit, open, num, close) + "0";
        },
        InkeyS(_inkeySLit) {
            semanticsHelper.addInstr("inkey$");
            return `await inkey$()`;
        },
        Inp(lit, open, num, close) {
            return notSupported(lit, open, num, close) + "0";
        },
        Input(_inputLit, stream, _comma, _semi, message, _commaSemi, ids) {
            var _a;
            semanticsHelper.addInstr("input");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const messageString = message.sourceString.replace(/\s*[;,]$/, "") || '""';
            const identifiers = evalChildren(ids.asIteration().children);
            const identifierStr = `[${identifiers.join(", ")}]`;
            const typesStr = identifiers.map(id => id.includes("$") ? "s" : "n").join("");
            return `${identifierStr} = (await input(${streamStr}${messageString}, "${typesStr}"))`;
        },
        Instr_noLen(_instrLit, _open, e1, _comma, e2, _close) {
            semanticsHelper.addInstr("instr");
            return `instr(${e1.eval()}, ${e2.eval()})`;
        },
        Instr_len(_instrLit, _open, len, _comma1, e1, _comma2, e2, _close) {
            semanticsHelper.addInstr("instr");
            return `instr(${e1.eval()}, ${e2.eval()}, ${len.eval()})`;
        },
        Int(_intLit, _open, num, _close) {
            semanticsHelper.addInstr("int");
            return `int(${num.eval()})`;
        },
        Joy(lit, open, num, close) {
            return notSupported(lit, open, num, close) + "0";
        },
        Key_key(lit, num, comma, str) {
            return notSupported(lit, num, comma, str);
        },
        Key_def(lit, defLit, num, comma, repeat, comma2, codes) {
            //const codesIteration = codes.child(0) ? codes.child(0).asIteration() : undefined;
            if (num.eval() === "78" && repeat.eval() === "1") {
                const codeList = codes.child(0) ? evalChildren(codes.child(0).asIteration().children) : undefined;
                const codeListStr = codeList ? `, ${codeList.join(", ")}` : "";
                semanticsHelper.addInstr("keyDef");
                return `keyDef(${num.eval()}, ${repeat.eval()}${codeListStr})`;
            }
            return notSupported(lit, defLit, num, comma, repeat, comma2, codes.child(0) ? codes.child(0).asIteration() : codes);
        },
        LeftS(_leftLit, _open, pos, _comma, len, _close) {
            semanticsHelper.addInstr("left$");
            return `left$(${pos.eval()}, ${len.eval()})`;
        },
        Len(_lenLit, _open, str, _close) {
            semanticsHelper.addInstr("len");
            return `len(${str.eval()})`;
        },
        Let(_letLit, assign) {
            return `${assign.eval()}`;
        },
        LineInput(_lit, _inputLit, stream, _comma, message, _semi, id) {
            var _a;
            semanticsHelper.addInstr("lineInput");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const messageString = message.sourceString.replace(/\s*[;,]$/, "") || '""';
            const identifier = id.eval();
            return `${identifier} = await lineInput(${streamStr}${messageString})`;
        },
        List(lit, labelRange, comma, stream) {
            return notSupported(lit, labelRange, comma, stream);
        },
        Load(lit, file, comma, address) {
            return notSupported(lit, file, comma, address);
        },
        Locate(lit, stream, comma, x, comma2, y) {
            return notSupported(lit, stream, comma, x, comma2, y);
        },
        Log(_logLit, _open, num, _close) {
            semanticsHelper.addInstr("log");
            return `log(${num.eval()})`;
        },
        Log10(_log10Lit, _open, num, _close) {
            semanticsHelper.addInstr("log10");
            return `log10(${num.eval()})`;
        },
        LowerS(_lowerLit, _open, str, _close) {
            semanticsHelper.addInstr("lower$");
            return `lower$(${str.eval()})`;
        },
        Mask(lit, num, comma, num2, comma2, num3) {
            return notSupported(lit, num, comma, num2, comma2, num3);
        },
        Max(_maxLit, _open, args, _close) {
            semanticsHelper.addInstr("max");
            return `max(${evalChildren(args.asIteration().children)})`;
        },
        Memory(lit, num) {
            return notSupported(lit, num);
        },
        Merge(lit, file) {
            return notSupported(lit, file);
        },
        MidS(_midLit, _open, str, _comma1, start, _comma2, len, _close) {
            semanticsHelper.addInstr("mid$");
            return `mid$(${str.eval()}, ${start.eval()}${evalOptionalArg(len)})`;
        },
        MidSAssign(_midLit, _open, ident, _comma1, start, _comma2, len, _close, _op, newStr) {
            semanticsHelper.addInstr("mid$Assign");
            const variableName = ident.eval();
            return `${variableName} = mid$Assign(${variableName}, ${start.eval()}, ${newStr.eval()}${evalOptionalArg(len)})`;
        },
        Min(_minLit, _open, args, _close) {
            semanticsHelper.addInstr("min");
            return `min(${evalChildren(args.asIteration().children)})`;
        },
        Mode(_modeLit, num) {
            semanticsHelper.addInstr("mode");
            return `mode(${num.eval()})`;
        },
        Move: drawMovePlot,
        Mover: drawMovePlot,
        New: notSupported,
        Next(_nextLit, _variable) {
            // we cannot parse NEXT with multiple variables, if we want to match FOR and NEXT
            semanticsHelper.addIndent(-2);
            return `}`;
        },
        On_numGosub(_onLit, e1, _gosubLit, args) {
            const index = e1.eval();
            const argumentList = args.asIteration().children.map(child => child.sourceString);
            for (let i = 0; i < argumentList.length; i += 1) {
                const labelString = argumentList[i];
                semanticsHelper.addUsedLabel(labelString, "gosub");
            }
            return `([${argumentList.map((label) => `_${label}`).join(",")}]?.[${index} - 1] || (() => undefined))()`; // 1-based index
        },
        On_numGoto(_lit, _num, gotoLit, labels) {
            return notSupported(gotoLit, labels.asIteration());
        },
        On_breakCont(lit, breakLit, contLit) {
            return notSupported(lit, breakLit, contLit);
        },
        On_breakGosub(lit, breakLit, gosubLit, label) {
            return notSupported(lit, breakLit, gosubLit, label);
        },
        On_breakStop(lit, breakLit, stopLit) {
            return notSupported(lit, breakLit, stopLit);
        },
        On_errorGoto(lit, errorLit, gotoLit, label) {
            return notSupported(lit, errorLit, gotoLit, label);
        },
        Openin(lit, file) {
            return notSupported(lit, file);
        },
        Openout(lit, file) {
            return notSupported(lit, file);
        },
        Origin(_originLit, x, _comma, y, _comma2, win) {
            semanticsHelper.addInstr("origin");
            const winStr = win.child(0) ? notSupported(win.child(0)) : "";
            return `origin(${x.eval()}, ${y.eval()}${winStr})`;
        },
        Out(lit, num, comma, num2) {
            return notSupported(lit, num, comma, num2);
        },
        Paper(_paperLit, stream, _comma, e) {
            var _a;
            semanticsHelper.addInstr("paper");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            return `paper(${streamStr}${e.eval()})`;
        },
        Peek(lit, open, num, close) {
            return notSupported(lit, open, num, close) + "0";
        },
        Pen(_penLit, stream, _comma, e, _comma2, e2) {
            var _a;
            semanticsHelper.addInstr("pen");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const modeStr = e2.child(0) ? notSupported(e2.child(0)) : "";
            return `pen(${streamStr}${e.eval()}${modeStr})`;
        },
        Pi(_piLit) {
            semanticsHelper.addInstr("pi");
            return `pi`;
        },
        Plot: drawMovePlot,
        Plotr: drawMovePlot,
        Poke(lit, num, comma, num2) {
            return notSupported(lit, num, comma, num2);
        },
        Pos(lit, open, streamLit, num, close) {
            if (num.eval() !== "0") {
                return notSupported(lit, open, streamLit, num, close) + "0";
            }
            semanticsHelper.addInstr("pos");
            return "pos()";
        },
        PrintArg_strCmp(_cmp, args) {
            const parameterString = args.children[0].eval();
            return parameterString;
        },
        PrintArg_usingNum(_printLit, format, _semi, numArgs) {
            semanticsHelper.addInstr("using");
            const formatString = format.eval();
            const argumentList = evalChildren(numArgs.asIteration().children);
            const parameterString = argumentList.join(', ');
            return `using(${formatString}, ${parameterString})`;
        },
        PrintArg_commaOp(_comma) {
            return `"${CommaOpChar}"`; // Unicode arrow right
        },
        StreamArg(streamLit, stream) {
            return notSupported(streamLit, stream) + "";
        },
        Print(_printLit, stream, _comma, args, semi) {
            var _a;
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const argumentList = evalChildren(args.asIteration().children);
            const parameterString = argumentList.join(', ') || "";
            const tag = semanticsHelper.getTag();
            const hasCommaOrTab = parameterString.includes(`"${CommaOpChar}`) || parameterString.includes(`"${TabOpChar}`);
            const printInstr = (hasCommaOrTab ? "printTab" : "print") + (tag ? "Tag" : "");
            semanticsHelper.addInstr(printInstr);
            let newlineString = "";
            if (!semi.sourceString) {
                newlineString = parameterString ? `, "\\n"` : `"\\n"`;
            }
            return `${printInstr}(${streamStr}${parameterString}${newlineString})`;
        },
        Rad(_radLit) {
            semanticsHelper.setDeg(false);
            return `/* rad */`; // we assume to check it at compile time
        },
        Randomize(lit, num) {
            return notSupported(lit, num);
        },
        Read(_readlit, args) {
            semanticsHelper.addInstr("read");
            const argumentList = evalChildren(args.asIteration().children);
            const results = argumentList.map(identifier => `${identifier} = read()`);
            return results.join("; ");
        },
        Release(lit, num) {
            return notSupported(lit, num);
        },
        Rem(_remLit, remain) {
            return `// ${remain.sourceString}`;
        },
        Remain(_remainLit, _open, e, _close) {
            semanticsHelper.addInstr("remain");
            return `remain(${e.eval()})`;
        },
        Renum(lit, num, comma, num2, comma2, num3) {
            return notSupported(lit, num, comma, num2, comma2, num3);
        },
        Restore(_restoreLit, e) {
            const labelString = e.sourceString || "0";
            semanticsHelper.addRestoreLabel(labelString);
            semanticsHelper.addUsedLabel(labelString, "restore");
            semanticsHelper.addInstr("restore");
            return `restore(${labelString})`;
        },
        Resume(lit, labelOrNext) {
            return notSupported(lit, labelOrNext);
        },
        Return(_returnLit) {
            return "return";
        },
        RightS(_rightLit, _open, str, _comma, len, _close) {
            semanticsHelper.addInstr("right$");
            return `right$(${str.eval()}, ${len.eval()})`;
        },
        Rnd(_rndLit, _open, e, _close) {
            var _a, _b;
            semanticsHelper.addInstr("rnd");
            const arg = (_b = (_a = e.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) !== null && _b !== void 0 ? _b : ""; // we ignore arg, but...
            return `rnd(${arg})`;
        },
        Round(_roundLit, _open, num, _comma, decimals, _close) {
            const decimalPlaces = evalOptionalArg(decimals);
            if (decimalPlaces) {
                semanticsHelper.addInstr("round");
                return `round(${num.eval()}${decimalPlaces})`;
            }
            semanticsHelper.addInstr("round1");
            return `round1(${num.eval()})`;
            // A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
        },
        Rsx(_rsxLit, cmd, e) {
            var _a;
            const cmdString = adaptIdentName(cmd.sourceString).toLowerCase();
            const rsxArgs = ((_a = e.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const knownRsx = ["arc", "circle", "date", "ellipse", "geolocation", "pitch", "polygon", "rect", "say", "time"];
            if (!knownRsx.includes(cmdString)) {
                return notSupported(_rsxLit, cmd, e);
            }
            const rsxCall = "rsx" + stringCapitalize(cmdString);
            semanticsHelper.addInstr(rsxCall);
            const asyncStr = ["geolocation", "say"].includes(cmdString) ? "await " : "";
            if (rsxArgs === "") {
                return `${asyncStr}${rsxCall}(${rsxArgs})`;
            }
            // need assign, not so nice to use <RSXFUNCTION>" as separator
            return rsxArgs.replace("<RSXFUNCTION>", `${asyncStr}${rsxCall}(`) + ")";
        },
        RsxAddressOf(_adressOfLit, ident) {
            const identString = ident.eval().toLowerCase();
            return `@${identString}`;
        },
        RsxArgs(_comma, args) {
            const argumentList = evalChildren(args.asIteration().children);
            // Remove "@" prefix from arguments
            const argumentListNoAddr = argumentList.map(arg => arg.startsWith("@") ? arg.substring(1) : arg);
            // Extract assignments and remove "@" prefix
            const assignList = argumentList.map(arg => arg.startsWith("@") ? arg.substring(1) : undefined);
            // Remove trailing undefined values
            while (assignList.length && assignList[assignList.length - 1] === undefined) {
                assignList.pop();
            }
            // Build the result string
            const assignments = assignList.length ? `[${assignList.join(", ")}] = ` : "";
            //const result = `${assignments}<RSXFUNCTION>, ${argumentListNoAddr.join(", ")}`;
            const result = `${assignments}<RSXFUNCTION>${argumentListNoAddr.join(", ")}`;
            return result;
        },
        Run(lit, labelOrFileOrNoting) {
            return notSupported(lit, labelOrFileOrNoting);
        },
        Save(lit, file, comma, type, comma2, num, comma3, num2, comma4, num3) {
            return notSupported(lit, file, comma, type, comma2, num, comma3, num2, comma4, num3);
        },
        Sgn(_sgnLit, _open, num, _close) {
            semanticsHelper.addInstr("sgn");
            return `sgn(${num.eval()})`;
        },
        Sin: cosSinTan,
        Sound(lit, state, comma, period, comma2, args) {
            return notSupported(lit, state, comma, period, comma2, args);
        },
        SpaceS(_stringLit, _open, num, _close) {
            semanticsHelper.addInstr("space$");
            return `space$(${num.eval()})`;
        },
        Spc(_lit, _open, num, _close) {
            semanticsHelper.addInstr("spc");
            return `spc(${num.eval()})`;
        },
        Speed_ink(lit, inkLit, num, comma, num2) {
            return notSupported(lit, inkLit, num, comma, num2);
        },
        Speed_key(lit, keyLit, num, comma, num2) {
            return notSupported(lit, keyLit, num, comma, num2);
        },
        Speed_write(lit, writeLit, num) {
            return notSupported(lit, writeLit, num);
        },
        Sq(lit, open, num, close) {
            return notSupported(lit, open, num, close) + "0";
        },
        Sqr(_sqrLit, _open, num, _close) {
            semanticsHelper.addInstr("sqr");
            return `sqr(${num.eval()})`;
        },
        Stop(_stopLit) {
            semanticsHelper.addInstr("stop");
            return `return stop()`;
        },
        StrS(_strLit, _open, num, _close) {
            semanticsHelper.addInstr("str$");
            return `str$(${num.eval()})`;
        },
        StringS_str(_stringLit, _open, len, _commaLit, chr, _close) {
            // Note: we do not use charAt(0) to get just one char
            semanticsHelper.addInstr("string$Str");
            return `string$Str(${len.eval()}, ${chr.eval()})`;
        },
        StringS_num(_stringLit, _open, len, _commaLit, num, _close) {
            semanticsHelper.addInstr("string$Num");
            return `string$Num(${len.eval()}, ${num.eval()})`;
        },
        Symbol_def(lit, args) {
            return notSupported(lit, args.asIteration());
        },
        Symbol_after(lit, afterLit, num) {
            return notSupported(lit, afterLit, num);
        },
        Tab(_lit, _open, num, _close) {
            return `"${TabOpChar}" + String(${num.eval()})`; // Unicode double arrow right
        },
        Tag(lit, stream) {
            var _a;
            //semanticsHelper.addInstr("tag");
            semanticsHelper.setTag(true);
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            if (streamStr) {
                return notSupported(lit, stream);
            }
            return `/* tag */`; // we assume to check it at compile time
            //return `tag(${streamStr})`;
        },
        Tagoff(lit, stream) {
            var _a;
            //semanticsHelper.addInstr("tagoff");
            semanticsHelper.setTag(false);
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            if (streamStr) {
                return notSupported(lit, stream);
            }
            return `/* tagoff */`; // we assume to check it at compile time
            //eturn `tagoff(${streamStr})`;
        },
        Tan: cosSinTan,
        Test(lit, open, num, comma, num2, close) {
            return notSupported(lit, open, num, comma, num2, close) + "0";
        },
        Testr(lit, open, num, comma, num2, close) {
            return notSupported(lit, open, num, comma, num2, close) + "0";
        },
        Time(_timeLit) {
            semanticsHelper.addInstr("time");
            return `time()`;
        },
        Troff: notSupported,
        Tron: notSupported,
        Unt(_lit, _open, num, _close) {
            semanticsHelper.addInstr("unt");
            return `unt(${num.eval()})`;
        },
        UpperS(_upperLit, _open, str, _close) {
            semanticsHelper.addInstr("upper$");
            return `upper$(${str.eval()})`;
        },
        Val(_upperLit, _open, e, _close) {
            const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
            const numStr = String(e.eval());
            if (numPattern.test(numStr)) { // for non-hex/bin number strings we can use this simple version
                semanticsHelper.addInstr("val1");
                return `val1(${numStr})`;
            }
            semanticsHelper.addInstr("val");
            return `val(${numStr})`;
        },
        Vpos(lit, open, streamLit, num, close) {
            if (num.eval() !== "0") {
                return notSupported(lit, open, streamLit, num, close) + "0";
            }
            semanticsHelper.addInstr("vpos");
            return "vpos()";
        },
        Wait(lit, num, comma, num2, comma2, num3) {
            return notSupported(lit, num, comma, num2, comma2, num3);
        },
        Wend(_wendLit) {
            semanticsHelper.addIndent(-2);
            return '}';
        },
        While(_whileLit, e) {
            const cond = e.eval();
            semanticsHelper.addIndent(2);
            return `while (${cond}) {`;
        },
        WhileWendBlock: loopBlock,
        Width(lit, num) {
            return notSupported(lit, num);
        },
        Window_def(lit, stream, comma0, num, comma, num2, comma2, num3, comma3, num4) {
            return notSupported(lit, stream, comma0, num, comma, num2, comma2, num3, comma3, num4);
        },
        Window_swap(lit, swapLit, num, comma, num2) {
            return notSupported(lit, swapLit, num, comma, num2);
        },
        Write(_printLit, stream, _comma, args) {
            var _a;
            const writeInst = semanticsHelper.getTag() ? "writeTag" : "write";
            semanticsHelper.addInstr(writeInst);
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const parameterString = evalChildren(args.asIteration().children).join(', ');
            return `${writeInst}(${streamStr}${parameterString})`;
        },
        Xpos(_xposLit) {
            semanticsHelper.addInstr("xpos");
            return `xpos()`;
        },
        Ypos(_xposLit) {
            semanticsHelper.addInstr("ypos");
            return `ypos()`;
        },
        Zone(_lit, num) {
            semanticsHelper.addInstr("zone");
            return `zone(${num.eval()})`;
        },
        AndExp_and(a, _op, b) {
            return `${a.eval()} & ${b.eval()}`;
        },
        NotExp_not(_op, e) {
            return `~(${e.eval()})`;
        },
        OrExp_or(a, _op, b) {
            return `${a.eval()} | ${b.eval()}`;
        },
        XorExp_xor(a, _op, b) {
            return `${a.eval()} ^ ${b.eval()}`;
        },
        AddExp_minus(a, _op, b) {
            return `${a.eval()} - ${b.eval()}`;
        },
        AddExp_plus(a, _op, b) {
            return `${a.eval()} + ${b.eval()}`;
        },
        CmpExp_eq(a, _op, b) {
            return createComparisonExpression(a, "===", b);
        },
        CmpExp_ge(a, _op, b) {
            return createComparisonExpression(a, ">=", b);
        },
        CmpExp_gt(a, _op, b) {
            return createComparisonExpression(a, ">", b);
        },
        CmpExp_le(a, _op, b) {
            return createComparisonExpression(a, "<=", b);
        },
        CmpExp_lt(a, _op, b) {
            return createComparisonExpression(a, "<", b);
        },
        CmpExp_ne(a, _op, b) {
            return createComparisonExpression(a, "!==", b);
        },
        DivExp_div(a, _op, b) {
            return `((${a.eval()} / ${b.eval()}) | 0)`;
        },
        ExpExp_power(a, _, b) {
            return `Math.pow(${a.eval()}, ${b.eval()})`;
        },
        ModExp_mod(a, _op, b) {
            return `${a.eval()} % ${b.eval()}`;
        },
        MulExp_divide(a, _op, b) {
            return `${a.eval()} / ${b.eval()}`;
        },
        MulExp_times(a, _op, b) {
            return `${a.eval()} * ${b.eval()}`;
        },
        PriExp_neg(_op, e) {
            return `-${e.eval()}`;
        },
        PriExp_paren(_open, e, _close) {
            return `(${e.eval()})`;
        },
        PriExp_pos(_op, e) {
            return `+${e.eval()}`;
        },
        StrAddExp_plus(a, _op, b) {
            return `${a.eval()} + ${b.eval()}`;
        },
        StrCmpExp_eq(a, _op, b) {
            return `-(${a.eval()} === ${b.eval()})`;
        },
        StrCmpExp_ge(a, _op, b) {
            return `-(${a.eval()} >= ${b.eval()})`;
        },
        StrCmpExp_gt(a, _op, b) {
            return `-(${a.eval()} > ${b.eval()})`;
        },
        StrCmpExp_le(a, _op, b) {
            return `-(${a.eval()} <= ${b.eval()})`;
        },
        StrCmpExp_lt(a, _op, b) {
            return `-(${a.eval()} < ${b.eval()})`;
        },
        StrCmpExp_ne(a, _op, b) {
            return `-(${a.eval()} !== ${b.eval()})`;
        },
        StrPriExp_paren(_open, e, _close) {
            return `(${e.eval()})`;
        },
        ArrayArgs(args) {
            return evalChildren(args.asIteration().children).join("][");
        },
        ArrayIdent(ident, _open, e, _close) {
            const name = semanticsHelper.getVariable(ident.eval(), "A");
            return `${name}[${e.eval()}]`;
        },
        DimArrayArgs(args) {
            return evalChildren(args.asIteration().children).join(", ");
        },
        DimArrayIdent(ident, _open, indices, _close) {
            const identStr = semanticsHelper.getVariable(ident.eval(), "A");
            const indicesStr = indices.eval();
            const isMultiDimensional = indicesStr.includes(","); // also for expressions containing comma
            const isStringIdent = identStr.endsWith("$");
            const valueStr = isStringIdent ? ', ""' : "";
            const indicesStr2 = isMultiDimensional ? `[${indicesStr}]` : indicesStr;
            let instr = "";
            if (isMultiDimensional) {
                instr = "dim";
            }
            else if (!isStringIdent && semanticsHelper.getVarLetterType(identStr) === "I") { // defint seen?
                instr = "dim1i16";
            }
            else {
                instr = "dim1";
            }
            semanticsHelper.addInstr(instr);
            return `${identStr} = ${instr}(${indicesStr2}${valueStr})`;
        },
        StrArrayIdent(ident, _open, e, _close) {
            const name = semanticsHelper.getVariable(ident.eval(), "A");
            return `${name}[${e.eval()}]`;
        },
        EraseIdent(ident) {
            const name = semanticsHelper.getVariable(ident.eval(), "A"); // for erase we have arrayvariables but withoutt indices
            return name;
        },
        CondExp(e) {
            return e.eval().replace(/^-?(\(.*\))$/, '$1'); // remove "-" in top-level condition
        },
        dataUnquoted(data) {
            const str = data.sourceString;
            if (!isNaN(Number(str))) {
                return str;
            }
            return notSupported(data) + `"${str}"`;
        },
        decimalValue(value) {
            const valueStr = value.sourceString.replace(/^(-?)(0+)(\d)/, "$1$3"); // avoid octal numbers: remove leading zeros, but keep sign
            if (valueStr !== value.sourceString) {
                notSupported(value);
            }
            return valueStr;
        },
        hexValue(_prefix, value) {
            return `0x${value.sourceString}`;
        },
        binaryValue(_prefix, value) {
            return `0b${value.sourceString}`;
        },
        string(_quote1, e, quote2) {
            const str = e.sourceString.replace(/\\/g, "\\\\"); // escape backslashes
            const varStr = quote2.sourceString !== '"' ? notSupported(quote2).replace("\n", "eol") : "";
            return `"${str}"${varStr}`;
        },
        PlainIdent(ident) {
            const name = ident.eval();
            return semanticsHelper.getVariable(name);
        },
        StrPlainIdent(ident) {
            const name = ident.eval();
            return semanticsHelper.getVariable(name);
        },
        ident(ident, suffix) {
            var _a;
            const name = adaptIdentName(ident.sourceString);
            const suffixStr = (_a = suffix.child(0)) === null || _a === void 0 ? void 0 : _a.sourceString;
            if (suffixStr !== undefined) { // real or integer suffix
                return name + notSupported(suffix);
            }
            return name; //semanticsHelper.getVariable(name);
        },
        fnIdent(fn, _space, ident, suffix) {
            var _a;
            const name = fn.sourceString + adaptIdentName(ident.sourceString);
            const suffixStr = (_a = suffix.child(0)) === null || _a === void 0 ? void 0 : _a.sourceString;
            if (suffixStr !== undefined) { // real or integer suffix
                return semanticsHelper.getVariable(name) + notSupported(suffix);
            }
            return semanticsHelper.getVariable(name);
        },
        strIdent(ident, typeSuffix) {
            const name = adaptIdentName(ident.sourceString) + typeSuffix.sourceString;
            return name; //semanticsHelper.getVariable(name);
        },
        strFnIdent(fn, _space, ident, typeSuffix) {
            const name = fn.sourceString + adaptIdentName(ident.sourceString) + typeSuffix.sourceString;
            return semanticsHelper.getVariable(name);
        }
    };
    return semantics;
}
export class Semantics {
    constructor() {
        this.helper = new SemanticsHelper();
    }
    resetParser() {
        this.helper.resetParser();
    }
    getUsedLabels() {
        return this.helper.getUsedLabels();
    }
    getSemanticsActions() {
        return getSemanticsActions(this.helper);
    }
    getSemanticsActionDict() {
        return this.getSemanticsActions();
    }
    getHelper() {
        return this.helper;
    }
}
//# sourceMappingURL=Semantics.js.map