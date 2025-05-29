import { SemanticsHelper } from "./SemanticsHelper";
export const CommaOpChar = "\u2192"; // Unicode arrow right
export const TabOpChar = "\u21d2"; // Unicode double arrow right
const codeSnippetsData = {
    _o: {},
    _d: {},
    cls() { }, // dummy
    async frame() { }, // dummy
    printText(_text) { }, // eslint-disable-line @typescript-eslint/no-unused-vars
    remain(timer) { return timer; }, // dummy
    resetText() { }, // dummy
};
function getCodeSnippets(snippetsData) {
    const { _o, _d, cls, frame, printText, remain, resetText } = snippetsData;
    // We grab functions as Strings from the codeSnippets object so we need function names.
    const codeSnippets = {
        resetText: function resetText() {
            Object.assign(_d, {
                output: "",
                pos: 0,
                tag: false,
                vpos: 0,
                zone: 13
            });
        },
        after: function after(timeout, timer, fn) {
            remain(timer);
            _d.timerMap[timer] = setTimeout(() => fn(), timeout * 20);
        },
        bin$: function bin$(num, pad = 0) {
            return num.toString(2).toUpperCase().padStart(pad, "0");
        },
        cls: function cls() {
            resetText();
            _o.cls();
        },
        dec$: function dec$(num, format) {
            const decimals = (format.split(".")[1] || "").length;
            const str = num.toFixed(decimals);
            const pad = " ".repeat(Math.max(0, format.length - str.length));
            return pad + str;
        },
        dim: function dim(dims, value = 0) {
            const createRecursiveArray = (depth) => {
                const length = dims[depth] + 1;
                const array = new Array(length);
                depth += 1;
                if (depth < dims.length) {
                    for (let i = 0; i < length; i += 1) {
                        array[i] = createRecursiveArray(depth);
                    }
                }
                else {
                    array.fill(value);
                }
                return array;
            };
            return createRecursiveArray(0);
        },
        dim1: function dim1(dim, value = 0) {
            return new Array(dim + 1).fill(value);
        },
        draw: function draw(x, y, pen) {
            _o.drawMovePlot("L", x, y, pen);
        },
        drawr: function drawr(x, y, pen) {
            _o.drawMovePlot("l", x, y, pen);
        },
        end: function end() {
            _o.flush();
            return "end";
        },
        every: function every(timeout, timer, fn) {
            remain(timer);
            _d.timerMap[timer] = setInterval(() => fn(), timeout * 20);
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
        instr: function instr(str, find, len) {
            return str.indexOf(find, len !== undefined ? len - 1 : len) + 1;
        },
        /*
        instrLen: function instrLen(str: string, find: string, len: number) {
            return str.indexOf(find, len - 1) + 1;
        },
        */
        left$: function left$(str, num) {
            return str.slice(0, num);
        },
        mid$: function mid$(str, pos, len) {
            return str.substr(pos - 1, len);
        },
        mid$Assign: function mid$Assign(s, start, newString, len) {
            start -= 1;
            len = Math.min(len !== null && len !== void 0 ? len : newString.length, newString.length, s.length - start);
            return s.substring(0, start) + newString.substring(0, len) + s.substring(start + len);
        },
        mode: function mode(num) {
            _o.mode(num);
            cls();
        },
        move: function move(x, y, pen) {
            _o.drawMovePlot("M", x, y, pen);
        },
        mover: function mover(x, y, pen) {
            _o.drawMovePlot("m", x, y, pen);
        },
        origin: function origin(x, y) {
            _o.origin(x, y);
        },
        paper: function paper(n) {
            _d.output += _o.getColorForPen(n, true);
        },
        pen: function pen(n) {
            _d.output += _o.getColorForPen(n);
        },
        plot: function plot(x, y, pen) {
            _o.drawMovePlot("P", x, y, pen);
        },
        plotr: function plotr(x, y, pen) {
            _o.drawMovePlot("p", x, y, pen);
        },
        pos: function pos() {
            return _d.pos + 1;
        },
        printText: function printText(text) {
            _d.output += _o.escapeText(text);
            const lines = text.split("\n");
            if (lines.length > 1) {
                _d.vpos += lines.length - 1;
                _d.pos = lines[lines.length - 1].length;
            }
            else {
                _d.pos += text.length;
            }
        },
        print: function print(...args) {
            const formatNumber = (arg) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
            const text = args.map((arg) => (typeof arg === "number") ? formatNumber(arg) : arg).join("");
            if (_d.tag) {
                return _o.printGraphicsText(_o.escapeText(text, true));
            }
            printText(text);
        },
        // printTab: print with commaOp or tabOp
        // For graphics output the text position does not change, so we can output all at once.
        printTab: function printTab(...args) {
            const formatNumber = (arg) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
            const strArgs = args.map((arg) => (typeof arg === "number") ? formatNumber(arg) : arg);
            const formatCommaOrTab = (str) => {
                if (str === CommaOpChar) {
                    return " ".repeat(_d.zone - (_d.pos % _d.zone));
                }
                else if (str.charAt(0) === TabOpChar) {
                    const tabSize = Number(str.substring(1));
                    return " ".repeat(tabSize - 1 - _d.pos);
                }
                return str;
            };
            if (_d.tag) {
                return _o.printGraphicsText(_o.escapeText(strArgs.map(arg => formatCommaOrTab(arg)).join(""), true));
            }
            for (const str of strArgs) {
                printText(formatCommaOrTab(str));
            }
        },
        read: function read() {
            return _d.data[_d.dataPtr++];
        },
        // remain: the return value is not really the remaining time
        remain: function remain(timer) {
            const value = _d.timerMap[timer];
            if (value !== undefined) {
                clearTimeout(value);
                clearInterval(value);
                delete _d.timerMap[timer];
            }
            return value;
        },
        restore: function restore(label) {
            _d.dataPtr = _d.restoreMap[label];
        },
        right$: function right$(str, num) {
            return str.substring(str.length - num);
        },
        round: function round(num, dec) {
            return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        },
        rsxCall: async function rsxCall(cmd, ...args) {
            return _o.rsx(cmd, args);
        },
        stop: function stop() {
            _o.flush();
            return "stop";
        },
        str$: function str$(num) {
            return num >= 0 ? ` ${num}` : String(num);
        },
        tag: function tag(active) {
            _d.tag = active;
        },
        time: function time() {
            return ((Date.now() - _d.startTime) * 3 / 10) | 0;
        },
        val: function val(str) {
            return Number(str.replace("&x", "0b").replace("&", "0x"));
        },
        vpos: function vpos() {
            return _d.vpos + 1;
        },
        write: function write(...args) {
            const text = args.map((arg) => (typeof arg === "string") ? `"${arg}"` : `${arg}`).join(",") + "\n";
            if (_d.tag) {
                return _o.printGraphicsText(_o.escapeText(text, true));
            }
            printText(text);
        },
        xpos: function xpos() {
            return _o.xpos();
        },
        ypos: function ypos() {
            return _o.ypos();
        },
        zone: function zone(num) {
            _d.zone = num;
        },
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
function evalOptionalArg(arg) {
    var _a;
    const argEval = (_a = arg.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
    return argEval !== undefined ? `, ${argEval}` : "";
}
function createComparisonExpression(a, op, b) {
    return `-(${a.eval()} ${op} ${b.eval()})`;
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
        return semanticsHelper.getDeg() ? `Math.${func}((${num.eval()}) * Math.PI / 180)` : `Math.${func}(${num.eval()})`;
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
    function processSubroutines(lineList, definedLabels) {
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
                let hasAwait = false;
                for (let i = first; i <= label.last; i += 1) {
                    if (lineList[i].includes("await ")) {
                        hasAwait = true; // quick check
                    }
                    lineList[i] = "  " + lineList[i]; // indent
                    lineList[i] = lineList[i].replace(/\n/g, "\n  ");
                }
                const asyncStr = hasAwait ? "async " : "";
                lineList[first] = `${indentStr}${asyncStr}function _${subroutineStart.label}() {${indentStr}\n` + lineList[first];
                lineList[label.last] = lineList[label.last].replace(`${indentStr}  return;`, `${indentStr}}`); // end of subroutine: replace "return" by "}" (can also be on same line)
                if (hasAwait) {
                    awaitLabels.push(subroutineStart.label);
                }
                subroutineStart = undefined;
            }
        }
        return awaitLabels;
    }
    const semantics = {
        Program(lines) {
            const lineList = evalChildren(lines.children);
            const variableList = semanticsHelper.getVariables();
            const variableDeclarations = variableList.length ? "let " + variableList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";" : "";
            const definedLabels = semanticsHelper.getDefinedLabels();
            const awaitLabels = processSubroutines(lineList, definedLabels);
            const instrMap = semanticsHelper.getInstrMap();
            semanticsHelper.addInstr("resetText");
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
	_d.data = [
${dataList.join(",\n")}
	];
	_d.restoreMap = ${JSON.stringify(restoreMap)};
	_d.dataPtr = 0;
}
`;
            }
            const codeSnippets = getCodeSnippets(codeSnippetsData);
            const librarySnippet = Object.keys(codeSnippets)
                .filter(key => instrMap[key])
                .map(key => trimIndent(String(codeSnippets[key])))
                .join('\n');
            const needsAsync = Object.keys(codeSnippets).some(key => instrMap[key] && trimIndent(String(codeSnippets[key])).startsWith("async "));
            const needsTimerMap = instrMap["after"] || instrMap["every"] || instrMap["remain"];
            const needsCommaOrTabOpChar = instrMap["printTab"];
            // Assemble code lines
            const codeLines = [
                needsAsync ? 'return async function() {' : '',
                '"use strict";',
                `const _d = _o.getSnippetData(); resetText();${dataList.length ? ' _defineData();' : ''}`,
                instrMap["time"] ? '_d.startTime = Date.now();' : '',
                needsTimerMap ? '_d.timerMap = {};' : '',
                needsCommaOrTabOpChar ? `const CommaOpChar = "${CommaOpChar}", TabOpChar = "${TabOpChar}";` : '',
                variableDeclarations,
                ...lineList.filter(line => line.trimEnd() !== ''),
                !instrMap["end"] ? `return _o.flush();` : "",
                dataListSnippet,
                '// library',
                librarySnippet,
                needsAsync ? '}();' : ''
            ].filter(Boolean);
            let lineStr = codeLines.join('\n');
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
            const variableName = ident.eval();
            const resolvedVariableName = semanticsHelper.getVariable(variableName);
            const value = e.eval();
            return `${resolvedVariableName} = ${value}`;
        },
        LoopBlockContent(separator, stmts) {
            const separatorStr = separator.eval();
            const lineStr = stmts.eval();
            return `${separatorStr}${lineStr}`;
        },
        LoopBlockSeparator_colon(_colonLit) {
            return "";
        },
        LoopBlockSeparator_newline(comment, eol, _label) {
            // labels in blocks are ignored
            const commentStr = comment.sourceString ? ` //${comment.sourceString.substring(1)}` : "";
            const eolStr = eol.sourceString + semanticsHelper.getIndentStr();
            return `${commentStr}${eolStr}`;
        },
        Abs(_absLit, _open, e, _close) {
            return `Math.abs(${e.eval()})`;
        },
        AddressOf(op, ident) {
            return notSupported(op, ident) + "0";
        },
        After(_afterLit, e1, _comma1, e2, _gosubLit, label) {
            var _a;
            semanticsHelper.addInstr("after");
            semanticsHelper.addInstr("remain"); // we also call "remain"
            const timeout = e1.eval();
            const timer = ((_a = e2.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || 0;
            const labelString = label.sourceString;
            semanticsHelper.addUsedLabel(labelString, "gosub");
            return `after(${timeout}, ${timer}, _${labelString})`;
        },
        Asc(_ascLit, _open, str, _close) {
            return `(${str.eval()}).charCodeAt(0)`;
        },
        Atn(_atnLit, _open, num, _close) {
            return semanticsHelper.getDeg() ? `(Math.atan(${num.eval()}) * 180 / Math.PI)` : `Math.atan(${num.eval()})`;
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
            return notSupported(lit, args.asIteration());
        },
        Cat: notSupported,
        Chain(lit, merge, file, comma, num, comma2, del, num2) {
            return notSupported(lit, merge, file, comma, num, comma2, del, num2);
        },
        ChrS(_chrLit, _open, e, _close) {
            return `String.fromCharCode(${e.eval()})`;
        },
        Cint(_cintLit, _open, e, _close) {
            return `Math.round(${e.eval()})`;
        },
        Clear: notSupported,
        Clear_input(lit, inputLit) {
            return notSupported(lit, inputLit);
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
            return `${num.eval()}`;
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
            const fnIdent = semanticsHelper.getVariable(`fn${ident.eval()}`);
            semanticsHelper.setDefContext(true); // do not create global variables in this context
            const argStr = evalChildren(args.children).join(", ") || "()";
            const defBody = e.eval();
            semanticsHelper.setDefContext(false);
            return `${fnIdent} = ${argStr} => ${defBody}`;
        },
        Defint(lit, letterRange) {
            return notSupported(lit, letterRange.asIteration());
        },
        Defreal(lit, letterRange) {
            return notSupported(lit, letterRange.asIteration());
        },
        Defstr(lit, letterRange) {
            return notSupported(lit, letterRange.asIteration());
        },
        Deg(_degLit) {
            semanticsHelper.setDeg(true);
            return `/* deg active */`;
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
            semanticsHelper.addInstr("remain"); // we also call this
            const timeout = e1.eval();
            const timer = ((_a = e2.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || 0;
            const labelString = label.sourceString;
            semanticsHelper.addUsedLabel(labelString, "gosub");
            return `every(${timeout}, ${timer}, _${labelString})`;
        },
        Exp(_expLit, _open, e, _close) {
            return `Math.exp(${e.eval()})`;
        },
        Fill(lit, num) {
            return notSupported(lit, num);
        },
        Fix(_fixLit, _open, num, _close) {
            return `Math.trunc(${num.eval()})`;
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
        If(_iflit, condExp, thenStat, elseLit, elseStat) {
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
            semanticsHelper.addInstr("frame");
            return `await inkey$()`;
        },
        Inp(lit, open, num, close) {
            return notSupported(lit, open, num, close) + "0";
        },
        Input(_inputLit, stream, _comma, message, _semi, ids) {
            var _a;
            semanticsHelper.addInstr("input");
            semanticsHelper.addInstr("frame");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const messageString = message.sourceString.replace(/\s*[;,]$/, "") || '""';
            const identifiers = evalChildren(ids.asIteration().children);
            const isNumberString = identifiers[0].includes("$") ? "" : ", true"; // TODO
            if (identifiers.length > 1) {
                const identifierStr = `[${identifiers.join(", ")}]`;
                return `${identifierStr} = (await input(${streamStr}${messageString}${isNumberString})).split(",")`;
            }
            return `${identifiers[0]} = await input(${streamStr}${messageString}${isNumberString})`;
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
            return `Math.floor(${num.eval()})`;
        },
        Joy(lit, open, num, close) {
            return notSupported(lit, open, num, close) + "0";
        },
        Key_key(lit, num, comma, str) {
            return notSupported(lit, num, comma, str);
        },
        Key_def(lit, defLit, nums) {
            return notSupported(lit, defLit, nums.asIteration());
        },
        LeftS(_leftLit, _open, pos, _comma, len, _close) {
            semanticsHelper.addInstr("left$");
            return `left$(${pos.eval()}, ${len.eval()})`;
        },
        Len(_lenLit, _open, str, _close) {
            return `(${str.eval()}).length`;
        },
        Let(_letLit, assign) {
            return `${assign.eval()}`;
        },
        LineInput(lit, inputLit, stream, comma, message, semi, e) {
            return notSupported(lit, inputLit, stream, comma, message, semi, e);
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
            return `Math.log(${num.eval()})`;
        },
        Log10(_log10Lit, _open, num, _close) {
            return `Math.log10(${num.eval()})`;
        },
        LowerS(_lowerLit, _open, str, _close) {
            return `(${str.eval()}).toLowerCase()`;
        },
        Mask(lit, num, comma, num2, comma2, num3) {
            return notSupported(lit, num, comma, num2, comma2, num3);
        },
        Max(_maxLit, _open, args, _close) {
            return `Math.max(${evalChildren(args.asIteration().children)})`;
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
            const resolvedVariableName = semanticsHelper.getVariable(variableName);
            return `${resolvedVariableName} = mid$Assign(${resolvedVariableName}, ${start.eval()}, ${newStr.eval()}${evalOptionalArg(len)})`;
        },
        Min(_minLit, _open, args, _close) {
            return `Math.min(${evalChildren(args.asIteration().children)})`;
        },
        Mode(_modeLit, num) {
            semanticsHelper.addInstr("mode");
            semanticsHelper.addInstr("cls");
            return `mode(${num.eval()})`;
        },
        Move: drawMovePlot,
        Mover: drawMovePlot,
        New: notSupported,
        Next(_nextLit, _variable, _comma, vars) {
            semanticsHelper.addIndent(-2);
            const varStr = vars.child(0) ? notSupported(vars.child(0)) : "";
            return `${varStr}}`;
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
        On_numGoto(lit, num, gotoLit, labels) {
            return notSupported(lit, num, gotoLit, labels.asIteration());
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
            return "Math.PI";
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
            semanticsHelper.addInstr("dec$");
            const formatString = format.eval();
            const argumentList = evalChildren(numArgs.asIteration().children);
            const parameterString = argumentList.map((arg) => `dec$(${arg}, ${formatString})`).join(', ');
            return parameterString;
        },
        PrintArg_commaOp(_comma) {
            return `"${CommaOpChar}"`; // Unicode arrow right
        },
        StreamArg(streamLit, stream) {
            return notSupported(streamLit, stream) + "";
        },
        Print(_printLit, stream, _comma, args, semi) {
            var _a;
            semanticsHelper.addInstr("printText");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const argumentList = evalChildren(args.asIteration().children);
            const parameterString = argumentList.join(', ') || "";
            const hasCommaOrTab = parameterString.includes(`"${CommaOpChar}`) || parameterString.includes(`"${TabOpChar}`);
            if (hasCommaOrTab) {
                semanticsHelper.addInstr("printTab");
            }
            else {
                semanticsHelper.addInstr("print");
            }
            let newlineString = "";
            if (!semi.sourceString) {
                newlineString = parameterString ? `, "\\n"` : `"\\n"`;
            }
            return `${hasCommaOrTab ? "printTab" : "print"}(${streamStr}${parameterString}${newlineString})`;
        },
        Rad(_radLit) {
            semanticsHelper.setDeg(false);
            return `/* rad active */`;
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
        Rnd(_rndLit, _open, _e, _close) {
            // args are ignored
            return `Math.random()`;
        },
        Round(_roundLit, _open, num, _comma, decimals, _close) {
            const decimalPlaces = evalOptionalArg(decimals);
            if (decimalPlaces) {
                semanticsHelper.addInstr("round");
                return `round(${num.eval()}${decimalPlaces})`;
            }
            return `Math.round(${num.eval()})`; // common round without decimals places
            // A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
        },
        Rsx(_rsxLit, cmd, e) {
            var _a;
            semanticsHelper.addInstr("rsxCall");
            const cmdString = adaptIdentName(cmd.sourceString).toLowerCase();
            const rsxArgs = ((_a = e.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            if (rsxArgs === "") {
                return `await rsxCall("${cmdString}"${rsxArgs})`;
            }
            // need assign, not so nice to use <RSXFUNCTION>" as separator
            return rsxArgs.replace("<RSXFUNCTION>", `await rsxCall("${cmdString}"`) + ")";
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
            const result = `${assignments}<RSXFUNCTION>, ${argumentListNoAddr.join(", ")}`;
            return result;
        },
        Run(lit, labelOrFileOrNoting) {
            return notSupported(lit, labelOrFileOrNoting);
        },
        Save(lit, file, comma, type, comma2, num, comma3, num2, comma4, num3) {
            return notSupported(lit, file, comma, type, comma2, num, comma3, num2, comma4, num3);
        },
        Sgn(_sgnLit, _open, num, _close) {
            return `Math.sign(${num.eval()})`;
        },
        Sin: cosSinTan,
        Sound(lit, args) {
            return notSupported(lit, args.asIteration());
        },
        SpaceS(_stringLit, _open, len, _close) {
            return `" ".repeat(${len.eval()})`;
        },
        Spc(_lit, _open, len, _close) {
            return `" ".repeat(${len.eval()})`;
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
        Sqr(_sqrLit, _open, e, _close) {
            return `Math.sqrt(${e.eval()})`;
        },
        Stop(_stopLit) {
            semanticsHelper.addInstr("stop");
            return `return stop()`;
        },
        StrS(_strLit, _open, num, _close) {
            const argument = num.eval();
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
        Symbol_def(lit, args) {
            return notSupported(lit, args.asIteration());
        },
        Symbol_after(lit, afterLit, num) {
            return notSupported(lit, afterLit, num);
        },
        Tab(_lit, _open, num, _close) {
            return `"${TabOpChar}${num.eval()}"`; // Unicode double arrow right
        },
        Tag(_tagLit, stream) {
            var _a;
            semanticsHelper.addInstr("tag");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            return `tag(true${streamStr})`;
        },
        Tagoff(_tagoffLit, stream) {
            var _a;
            semanticsHelper.addInstr("tag");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            return `tag(false${streamStr})`;
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
            return `${num.eval()}`;
        },
        UpperS(_upperLit, _open, str, _close) {
            return `(${str.eval()}).toUpperCase()`;
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
            semanticsHelper.addInstr("write");
            semanticsHelper.addInstr("printText");
            const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            const parameterString = evalChildren(args.asIteration().children).join(', ');
            return `write(${streamStr}${parameterString})`;
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
            return `${ident.eval()}[${e.eval()}]`;
        },
        DimArrayArgs(args) {
            return evalChildren(args.asIteration().children).join(", ");
        },
        DimArrayIdent(ident, _open, indices, _close) {
            const identStr = ident.eval();
            const indicesStr = indices.eval();
            const isMultiDimensional = indicesStr.includes(","); // also for expressions containing comma
            const valueStr = identStr.endsWith("$") ? ', ""' : "";
            if (isMultiDimensional) { // one value (not detected for expressions containing comma)
                semanticsHelper.addInstr("dim");
                return `${identStr} = dim([${indicesStr}]${valueStr})`;
            }
            semanticsHelper.addInstr("dim1");
            return `${identStr} = dim1(${indicesStr}${valueStr})`;
        },
        StrArrayIdent(ident, _open, e, _close) {
            return `${ident.eval()}[${e.eval()}]`;
        },
        dataUnquoted(data) {
            const str = data.sourceString;
            if (!isNaN(Number(str))) {
                return str;
            }
            return notSupported(data) + `"${str}"`;
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
            const str = e.sourceString.replace(/\\/g, "\\\\"); // escape backslashes
            return `"${str}"`;
        },
        ident(ident, suffix) {
            var _a;
            const name = adaptIdentName(ident.sourceString);
            const suffixStr = (_a = suffix.child(0)) === null || _a === void 0 ? void 0 : _a.sourceString;
            if (suffixStr !== undefined) { // real or integer suffix
                return semanticsHelper.getVariable(name) + notSupported(suffix);
            }
            return semanticsHelper.getVariable(name);
        },
        fnIdent(fn, ident, suffix) {
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
            return semanticsHelper.getVariable(name);
        },
        strFnIdent(fn, ident, typeSuffix) {
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
    getCodeSnippets4Test(data) {
        return getCodeSnippets(data);
    }
}
//# sourceMappingURL=Semantics.js.map