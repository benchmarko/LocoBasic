import type { ActionDict, Node } from "ohm-js";
import type { IVm, DefinedLabelEntryType, ISemantics, SnippetDataType, UsedLabelEntryType } from "./Interfaces";
import { SemanticsHelper } from "./SemanticsHelper";

type RecursiveArray<T> = T | RecursiveArray<T>[];

export const CommaOpChar = "\u2192"; // Unicode arrow right
export const TabOpChar = "\u21d2"; // Unicode double arrow right

const codeSnippetsData = {
	_o: {} as IVm,
	_d: {} as SnippetDataType,
	cls() { }, // dummy
	async frame() { }, // dummy
	printText(_text: string) { }, // eslint-disable-line @typescript-eslint/no-unused-vars
	remain(timer: number) { return timer; }, // dummy
	resetText() { }, // dummy
};

function getCodeSnippets(snippetsData: typeof codeSnippetsData) {
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
		after: function after(timeout: number, timer: number, fn: () => void) {
			remain(timer);
			_d.timerMap[timer] = setTimeout(() => fn(), timeout * 20);
		},
		bin$: function bin$(num: number, pad: number = 0): string {
			return num.toString(2).toUpperCase().padStart(pad, "0");
		},
		cls: function cls() {
			resetText();
			_o.cls();
		},
		dec$: function dec$(num: number, format: string) {
			const decimals = (format.split(".")[1] || "").length;
			const str = num.toFixed(decimals);
			const pad = " ".repeat(Math.max(0, format.length - str.length));
			return pad + str;
		},
		dim: function dim(dims: number[], value: string | number = 0) {
			const createRecursiveArray = (depth: number): RecursiveArray<string | number> => {
				const length = dims[depth] + 1;
				const array: RecursiveArray<string | number> = new Array(length);
				depth += 1;
				if (depth < dims.length) {
					for (let i = 0; i < length; i += 1) {
						array[i] = createRecursiveArray(depth);
					}
				} else {
					array.fill(value);
				}
				return array;
			};
			return createRecursiveArray(0);
		},
		dim1: function dim1(dim: number, value: string | number = 0) {
			return new Array(dim + 1).fill(value);
		},
		draw: function draw(x: number, y: number, pen?: number) {
			_o.drawMovePlot("L", x, y, pen);
		},
		drawr: function drawr(x: number, y: number, pen?: number) {
			_o.drawMovePlot("l", x, y, pen);
		},
		end: function end() {
			_o.flush();
			return "end";
		},
		every: function every(timeout: number, timer: number, fn: () => void) {
			remain(timer);
			_d.timerMap[timer] = setInterval(() => fn(), timeout * 20);
		},
		frame: async function frame() {
			_o.flush();
			if (_o.getEscape()) {
				throw new Error("INFO: Program stopped");
			}
			return new Promise<void>(resolve => setTimeout(() => resolve(), Date.now() % 50));
		},
		graphicsPen: function graphicsPen(num: number) {
			_o.graphicsPen(num);
		},
		hex$: function hex$(num: number, pad?: number) {
			return num.toString(16).toUpperCase().padStart(pad || 0, "0");
		},
		ink: function ink(num: number, col: number) {
			_o.ink(num, col);
		},
		inkey$: async function inkey$() {
			await frame();
			return await _o.inkey$();
		},
		input: async function input(msg: string, isNum: boolean) {
			const input = await _o.input(msg);
			if (input === null) {
				throw new Error("INFO: Input canceled");
			} else if (isNum && isNaN(Number(input))) {
				throw new Error("Invalid number input");
			} else {
				return isNum ? Number(input) : input;
			}
		},
		instr: function instr(str: string, find: string, len: number) {
			return str.indexOf(find, len !== undefined ? len - 1 : len) + 1;
		},
		left$: function left$(str: string, num: number) {
			return str.slice(0, num);
		},
		mid$: function mid$(str: string, pos: number, len?: number) {
			return str.substr(pos - 1, len);
		},
		mid$Assign: function mid$Assign(s: string, start: number, newString: string, len?: number) {
			start -= 1;
			len = Math.min(len ?? newString.length, newString.length, s.length - start);
			return s.substring(0, start) + newString.substring(0, len) + s.substring(start + len);
		},
		mode: function mode(num: number) {
			_o.mode(num);
			cls();
		},
		move: function move(x: number, y: number, pen?: number) {
			_o.drawMovePlot("M", x, y, pen);
		},
		mover: function mover(x: number, y: number, pen?: number) {
			_o.drawMovePlot("m", x, y, pen);
		},
		origin: function origin(x: number, y: number) {
			_o.origin(x, y);
		},
		paper: function paper(n: number) {
			_d.output += _o.getColorForPen(n, true);
		},
		pen: function pen(n: number) {
			_d.output += _o.getColorForPen(n);
		},
		plot: function plot(x: number, y: number, pen?: number) {
			_o.drawMovePlot("P", x, y, pen);
		},
		plotr: function plotr(x: number, y: number, pen?: number) {
			_o.drawMovePlot("p", x, y, pen);
		},
		pos: function pos() {
			return _d.pos + 1;
		},
		printText: function printText(text: string) {
			_d.output += _o.escapeText(text);
			const lines = text.split("\n");
			if (lines.length > 1) {
				_d.vpos += lines.length - 1;
				_d.pos = lines[lines.length - 1].length;
			} else {
				_d.pos += text.length;
			}
		},
		print: function print(...args: (string | number)[]) {
			const formatNumber = (arg: number) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
			const text = args.map((arg) => (typeof arg === "number") ? formatNumber(arg) : arg).join("");
			if (_d.tag) {
				return _o.printGraphicsText(_o.escapeText(text, true));
			}
			printText(text);
		},
		// printTab: print with commaOp or tabOp
		// For graphics output the text position does not change, so we can output all at once.
		printTab: function printTab(...args: (string | number)[]) {
			const formatNumber = (arg: number) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
			const strArgs = args.map((arg) => (typeof arg === "number") ? formatNumber(arg) : arg);
			const formatCommaOrTab = (str: string) => {
				if (str === CommaOpChar) {
					return " ".repeat(_d.zone - (_d.pos % _d.zone));
				} else if (str.charAt(0) === TabOpChar) {
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
		remain: function remain(timer: number) {
			const value = _d.timerMap[timer];
			if (value !== undefined) {
				clearTimeout(value);
				clearInterval(value);
				delete _d.timerMap[timer];
			}
			return value;
		},
		restore: function restore(label: string) {
			_d.dataPtr = _d.restoreMap[label];
		},
		right$: function right$(str: string, num: number) {
			return str.substring(str.length - num);
		},
		round: function round(num: number, dec: number) {
			return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
		},
		rsxCall: async function rsxCall(cmd: string, ...args: (string | number)[]) {
			return _o.rsx(cmd, args);
		},
		stop: function stop() {
			_o.flush();
			return "stop";
		},
		str$: function str$(num: number) {
			return num >= 0 ? ` ${num}` : String(num);
		},
		tag: function tag(active: boolean) {
			_d.tag = active;
		},
		time: function time() {
			return ((Date.now() - _d.startTime) * 3 / 10) | 0;
		},
		val: function val(str: string) {
			return Number(str.replace("&x", "0b").replace("&", "0x"));
		},
		vpos: function vpos() {
			return _d.vpos + 1;
		},
		write: function write(...args: (string | number)[]) {
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
		zone: function zone(num: number) {
			_d.zone = num;
		},
	};
	return codeSnippets;
}

function trimIndent(code: string): string {
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

function evalChildren(children: Node[]): string[] {
	return children.map(child => child.eval());
}

function evalOptionalArg(arg: Node): string {
	const argEval = arg.child(0)?.eval();
	return argEval !== undefined ? `, ${argEval}` : "";
}

function createComparisonExpression(a: Node, op: string, b: Node): string {
	return `-(${a.eval()} ${op} ${b.eval()})`;
}

function getSemanticsActions(semanticsHelper: SemanticsHelper) {
	const adaptIdentName = (str: string) => str.replace(/\./g, "_");

	const drawMovePlot = (lit: Node, x: Node, _comma1: Node, y: Node, _comma2: Node, pen: Node, _comma3: Node, mode: Node) => {
		const command = lit.sourceString.toLowerCase();
		semanticsHelper.addInstr(command);
		const modeStr = mode.child(0) ? notSupported(mode.child(0)) : "";
		return `${command}(${x.eval()}, ${y.eval()}${evalOptionalArg(pen)}${modeStr})`;
	};

	const cosSinTan = (lit: Node, _open: Node, num: Node, _close: Node) => { // eslint-disable-line @typescript-eslint/no-unused-vars
		const func = lit.sourceString.toLowerCase();
		return semanticsHelper.getDeg() ? `Math.${func}((${num.eval()}) * Math.PI / 180)` : `Math.${func}(${num.eval()})`;
	};

	const loopBlock = (startNode: Node, content: Node, separator: Node, endNode: Node) => {
		const startStr = startNode.eval();
		const contentStr = evalChildren(content.children).join(';');
		const endStr = endNode.eval();

		let separatorStr = separator.eval();
		if (contentStr && !contentStr.endsWith("}")) {
			separatorStr = ";" + separatorStr;
		}
		return `${startStr}${contentStr}${separatorStr}${endStr}`;
	};

	const uncommentNotSupported = (str: string) => {
		const regExpNotSupp = new RegExp("/\\* not supported: (.*) \\*/");
		if (regExpNotSupp.test(str)) {
			return str.replace(regExpNotSupp, "$1");
		}
		return str;
	};

	const evalAnyFn = (arg: Node): string => {
		if (arg.isIteration()) {
			return arg.children.map(evalAnyFn).join(",");
		} else if (arg.isLexical() || arg.isTerminal()) {
			return arg.sourceString;
		}
		const argStr = arg.eval() as string;
		return uncommentNotSupported(argStr);
	};

	const notSupported = (str: Node, ...args: Node[]) => {
		const name = evalAnyFn(str);

		const argList = args.map(evalAnyFn);
		const argStr = argList.length ? ` ${argList.join(" ")}` : "";

		const message = str.source.getLineAndColumnMessage();
		semanticsHelper.addCompileMessage(`WARNING: Not supported: ${message}`);

		return `/* not supported: ${name}${uncommentNotSupported(argStr)} */`;
	};

	function processSubroutines(lineList: string[], definedLabels: DefinedLabelEntryType[]): string[] {
		const usedLabels = semanticsHelper.getUsedLabels();
		const gosubLabels = usedLabels["gosub"] || {};

		const awaitLabels: string[] = [];
		let subroutineStart: DefinedLabelEntryType | undefined;
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
		Program(lines: Node) {
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
				.map(key => trimIndent(String(codeSnippets[key as keyof typeof codeSnippets])))
				.join('\n');

			const needsAsync = Object.keys(codeSnippets).some(key =>
				instrMap[key] && trimIndent(String(codeSnippets[key as keyof typeof codeSnippets])).startsWith("async ")
			);

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

		LabelRange(start: Node, minus: Node, end: Node) {
			return [start, minus, end].map((node) => evalAnyFn(node)).join("");
		},

		LetterRange(start: Node, minus: Node, end: Node) {
			return [start, minus, end].map((node) => evalAnyFn(node)).join("");
		},

		Line(label: Node, stmts: Node, comment: Node, _eol: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
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

		Statements(stmt: Node, _stmtSep: Node, stmts: Node) {
			// separate statements, use ";", if the last stmt does not end with "{"
			const statements = [stmt.eval(), ...evalChildren(stmts.children)];
			return statements.reduce((acc, current) => acc.endsWith("{") ? `${acc} ${current}` : `${acc}; ${current}`);
		},

		ArrayAssign(ident: Node, _op: Node, e: Node): string {
			return `${ident.eval()} = ${e.eval()}`;
		},

		Assign(ident: Node, _op: Node, e: Node): string {
			const variableName = ident.eval();
			const resolvedVariableName = semanticsHelper.getVariable(variableName);
			const value = e.eval();
			return `${resolvedVariableName} = ${value}`;
		},

		LoopBlockContent(separator: Node, stmts: Node) {
			const separatorStr = separator.eval();
			const lineStr = stmts.eval();

			return `${separatorStr}${lineStr}`;
		},

		LoopBlockSeparator_colon(_colonLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "";
		},

		LoopBlockSeparator_newline(comment: Node, eol: Node, _label: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// labels in blocks are ignored
			const commentStr = comment.sourceString ? ` //${comment.sourceString.substring(1)}` : "";
			const eolStr = eol.sourceString + semanticsHelper.getIndentStr();
			return `${commentStr}${eolStr}`;
		},

		Abs(_absLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.abs(${e.eval()})`;
		},

		AddressOf(op: Node, ident: Node) {
			return notSupported(op, ident) + "0";
		},

		After(_afterLit: Node, e1: Node, _comma1: Node, e2: Node, _gosubLit: Node, label: Node) {
			semanticsHelper.addInstr("after");
			semanticsHelper.addInstr("remain"); // we also call "remain"
			const timeout = e1.eval();
			const timer = e2.child(0)?.eval() || 0;
			const labelString = label.sourceString;
			semanticsHelper.addUsedLabel(labelString, "gosub");
			return `after(${timeout}, ${timer}, _${labelString})`;
		},

		Asc(_ascLit: Node, _open: Node, str: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${str.eval()}).charCodeAt(0)`;
		},

		Atn(_atnLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return semanticsHelper.getDeg() ? `(Math.atan(${num.eval()}) * 180 / Math.PI)` : `Math.atan(${num.eval()})`;
		},

		Auto(lit: Node, label: Node, comma: Node, step: Node) {
			return notSupported(lit, label, comma, step);
		},

		BinS(_binLit: Node, _open: Node, num: Node, _comma: Node, pad: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("bin$");
			return `bin$(${num.eval()}${evalOptionalArg(pad)})`;
		},

		Border(lit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, num, comma, num2);
		},

		Call(lit: Node, args: Node) {
			return notSupported(lit, args.asIteration());
		},

		Cat: notSupported,

		Chain(lit: Node, merge: Node, file: Node, comma: Node, num: Node, comma2: Node, del: Node, num2: Node) {
			return notSupported(lit, merge, file, comma, num, comma2, del, num2);
		},

		ChrS(_chrLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `String.fromCharCode(${e.eval()})`;
		},

		Cint(_cintLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.round(${e.eval()})`;
		},

		Clear: notSupported,

		Clear_input(lit: Node, inputLit: Node) {
			return notSupported(lit, inputLit);
		},

		Clg(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Closein: notSupported,

		Closeout: notSupported,

		Cls(_clsLit: Node, stream: Node) {
			semanticsHelper.addInstr("cls");
			const streamStr = stream.child(0)?.eval() || "";
			return `cls(${streamStr})`;
		},

		Comment(_commentLit: Node, remain: Node) {
			return `//${remain.sourceString}`;
		},

		Cont: notSupported,

		CopychrS(lit: Node, open: Node, stream: Node, close: Node) {
			return notSupported(lit, open, stream, close) + '" "';
		},

		Cos: cosSinTan,

		Creal(_lit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${num.eval()}`;
		},

		Cursor(lit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, num, comma, num2);
		},

		Data(_datalit: Node, args: Node) {
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

		DecS(_decLit: Node, _open: Node, num: Node, _comma: Node, format: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("dec$");
			return `dec$(${num.eval()}, ${format.eval()})`;
		},

		Def(_defLit: Node, _fnLit: Node, assign: Node) {
			return `${assign.eval()}`;
		},

		DefArgs(_open: Node, arrayIdents: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argList = evalChildren(arrayIdents.asIteration().children);

			return `(${argList.join(", ")})`;
		},

		DefAssign(ident: Node, args: Node, _equal: Node, e: Node) {
			const fnIdent = semanticsHelper.getVariable(`fn${ident.eval()}`);

			semanticsHelper.setDefContext(true); // do not create global variables in this context
			const argStr = evalChildren(args.children).join(", ") || "()";

			const defBody = e.eval();
			semanticsHelper.setDefContext(false);

			return `${fnIdent} = ${argStr} => ${defBody}`;
		},

		Defint(lit: Node, letterRange: Node) {
			return notSupported(lit, letterRange.asIteration());
		},

		Defreal(lit: Node, letterRange: Node) {
			return notSupported(lit, letterRange.asIteration());
		},

		Defstr(lit: Node, letterRange: Node) {
			return notSupported(lit, letterRange.asIteration());
		},

		Deg(_degLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.setDeg(true);
			return `/* deg active */`;
		},

		Delete(lit: Node, labelRange: Node) {
			return notSupported(lit, labelRange);
		},

		Derr(lit: Node) {
			return notSupported(lit) + "0";
		},

		Di: notSupported,

		Dim(_dimLit: Node, dimArgs: Node) {
			const argumentList: string[] = evalChildren(dimArgs.asIteration().children);
			return argumentList.join("; ");
		},

		Draw: drawMovePlot,

		Drawr: drawMovePlot,

		Edit(lit: Node, label: Node) {
			return notSupported(lit, label);
		},

		Ei: notSupported,

		End(_endLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("end");
			return `return end()`;
		},

		Ent(lit: Node, nums: Node) { // TODO: separator
			return notSupported(lit, nums.asIteration());
		},

		Env(lit: Node, nums: Node) { // TODO: separator
			return notSupported(lit, nums.asIteration());
		},

		Eof(lit: Node) {
			return notSupported(lit) + "-1";
		},

		Erase(_eraseLit: Node, arrayIdents: Node) { // erase not really needed
			const arrayIdentifiers: string[] = evalChildren(arrayIdents.asIteration().children);
			const results: string[] = [];

			for (const ident of arrayIdentifiers) {
				const initValStr = ident.endsWith("$") ? '""' : '0';
				results.push(`${ident} = ${initValStr}`);
			}

			return results.join("; ");
		},

		Erl(lit: Node) {
			return notSupported(lit) + "0";
		},

		Err(lit: Node) {
			return notSupported(lit) + "0";
		},

		Error(_errorLit: Node, e: Node) {
			return `throw new Error(${e.eval()})`;
		},

		Every(_everyLit: Node, e1: Node, _comma1: Node, e2: Node, _gosubLit: Node, label: Node) {
			semanticsHelper.addInstr("every");
			semanticsHelper.addInstr("remain"); // we also call this
			const timeout = e1.eval();
			const timer = e2.child(0)?.eval() || 0;
			const labelString = label.sourceString;
			semanticsHelper.addUsedLabel(labelString, "gosub");
			return `every(${timeout}, ${timer}, _${labelString})`;
		},

		Exp(_expLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.exp(${e.eval()})`;
		},

		Fill(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Fix(_fixLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.trunc(${num.eval()})`;
		},

		Fre(lit: Node, open: Node, e: Node, close: Node) {
			return notSupported(lit, open, e, close) + "0";
		},

		AnyFnArgs(_open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argumentList = evalChildren(args.asIteration().children);
			return `(${argumentList.join(", ")})`;
		},


		FnIdent(fnIdent: Node, args: Node) {
			const argumentString = args.child(0)?.eval() || "()";
			return `${fnIdent.eval()}${argumentString}`;
		},

		StrFnIdent(fnIdent: Node, args: Node) {
			const argStr = args.child(0)?.eval() || "()";
			return `${fnIdent.eval()}${argStr}`;
		},

		For(_forLit: Node, variable: Node, _eqSign: Node, start: Node, _dirLit: Node, end: Node, _stepLit: Node, step: Node) {
			const variableExpression = variable.eval();
			const startExpression = start.eval();
			const endExpression = end.eval();
			const stepExpression = step.child(0)?.eval() || "1";

			const stepAsNumber = Number(stepExpression);

			let comparisonStatement = "";
			if (isNaN(stepAsNumber)) {
				comparisonStatement = `${stepExpression} >= 0 ? ${variableExpression} <= ${endExpression} : ${variableExpression} >= ${endExpression}`;
			} else {
				comparisonStatement = stepAsNumber >= 0 ? `${variableExpression} <= ${endExpression}` : `${variableExpression} >= ${endExpression}`;
			}

			semanticsHelper.addIndent(2);
			const result = `for (${variableExpression} = ${startExpression}; ${comparisonStatement}; ${variableExpression} += ${stepExpression}) {`;

			return result;
		},

		ForNextBlock: loopBlock,

		Frame(_frameLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("frame");
			return `await frame()`;
		},

		Gosub(_gosubLit: Node, e: Node) {
			const labelString = e.sourceString;
			semanticsHelper.addUsedLabel(labelString, "gosub");

			return `_${labelString}()`;
		},

		Goto(lit: Node, label: Node) {
			return notSupported(lit, label);
		},

		GraphicsPaper(lit: Node, paperLit: Node, num: Node) {
			return notSupported(lit, paperLit, num);
		},

		GraphicsPen(_graphicsLit: Node, _penLit: Node, num: Node, _comma: Node, mode: Node) {
			semanticsHelper.addInstr("graphicsPen");
			const modeStr = mode.child(0) ? notSupported(mode.child(0)) : "";
			return `graphicsPen(${num.eval()}${modeStr})`;
		},

		HexS(_hexLit: Node, _open: Node, num: Node, _comma: Node, pad: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("hex$");
			return `hex$(${num.eval()}${evalOptionalArg(pad)})`;
		},

		Himem(lit: Node) {
			return notSupported(lit) + "0";
		},

		IfExp_label(label: Node) {
			return notSupported(label);
		},

		IfThen_then(_thenLit: Node, thenStat: Node) {
			const thenStatement = thenStat.eval();
			return thenStatement;
		},

		If(_iflit: Node, condExp: Node, thenStat: Node, elseLit: Node, elseStat: Node) {
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

		Ink(_inkLit: Node, num: Node, _comma: Node, col: Node, _comma2: Node, col2: Node) {
			semanticsHelper.addInstr("ink");
			const col2Str = col2.child(0) ? notSupported(col2.child(0)) : "";
			return `ink(${num.eval()}, ${col.eval()}${col2Str})`;
		},

		Inkey(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		InkeyS(_inkeySLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("inkey$");
			semanticsHelper.addInstr("frame");
			return `await inkey$()`;
		},

		Inp(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		Input(_inputLit: Node, stream: Node, _comma: Node, message: Node, _semi: Node, ids: Node) {
			semanticsHelper.addInstr("input");
			const streamStr = stream.child(0)?.eval() || "";

			const messageString = message.sourceString.replace(/\s*[;,]$/, "") || '""';
			const identifiers = evalChildren(ids.asIteration().children);
			const isNumberString = identifiers[0].includes("$") ? "" : ", true"; // TODO
			if (identifiers.length > 1) {
				const identifierStr = `[${identifiers.join(", ")}]`;
				return `${identifierStr} = (await input(${streamStr}${messageString}${isNumberString})).split(",")`;
			}

			return `${identifiers[0]} = await input(${streamStr}${messageString}${isNumberString})`;
		},

		Instr_noLen(_instrLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("instr");
			return `instr(${e1.eval()}, ${e2.eval()})`;
		},

		Instr_len(_instrLit: Node, _open: Node, len: Node, _comma1: Node, e1: Node, _comma2: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("instr");
			return `instr(${e1.eval()}, ${e2.eval()}, ${len.eval()})`;
		},

		Int(_intLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.floor(${num.eval()})`;
		},

		Joy(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		Key_key(lit: Node, num: Node, comma: Node, str: Node) {
			return notSupported(lit, num, comma, str);
		},

		Key_def(lit: Node, defLit: Node, nums: Node) {
			return notSupported(lit, defLit, nums.asIteration());
		},

		LeftS(_leftLit: Node, _open: Node, pos: Node, _comma: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("left$");
			return `left$(${pos.eval()}, ${len.eval()})`;
		},

		Len(_lenLit: Node, _open: Node, str: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${str.eval()}).length`;
		},

		Let(_letLit: Node, assign: Node) {
			return `${assign.eval()}`;
		},

		LineInput(lit: Node, inputLit: Node, stream: Node, comma: Node, message: Node, semi: Node, e: Node) {
			return notSupported(lit, inputLit, stream, comma, message, semi, e);
		},

		List(lit: Node, labelRange: Node, comma: Node, stream: Node) {
			return notSupported(lit, labelRange, comma, stream);
		},

		Load(lit: Node, file: Node, comma: Node, address: Node) {
			return notSupported(lit, file, comma, address);
		},

		Locate(lit: Node, stream: Node, comma: Node, x: Node, comma2: Node, y: Node) {
			return notSupported(lit, stream, comma, x, comma2, y);
		},

		Log(_logLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.log(${num.eval()})`;
		},

		Log10(_log10Lit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.log10(${num.eval()})`;
		},

		LowerS(_lowerLit: Node, _open: Node, str: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${str.eval()}).toLowerCase()`;
		},

		Mask(lit: Node, num: Node, comma: Node, num2: Node, comma2: Node, num3: Node) {
			return notSupported(lit, num, comma, num2, comma2, num3);
		},

		Max(_maxLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.max(${evalChildren(args.asIteration().children)})`;
		},

		Memory(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Merge(lit: Node, file: Node) {
			return notSupported(lit, file);
		},

		MidS(_midLit: Node, _open: Node, str: Node, _comma1: Node, start: Node, _comma2: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("mid$");
			return `mid$(${str.eval()}, ${start.eval()}${evalOptionalArg(len)})`;
		},

		MidSAssign(_midLit: Node, _open: Node, ident: Node, _comma1: Node, start: Node, _comma2: Node, len: Node, _close: Node, _op: Node, newStr: Node) {
			semanticsHelper.addInstr("mid$Assign");
			const variableName = ident.eval();
			return `${variableName} = mid$Assign(${variableName}, ${start.eval()}, ${newStr.eval()}${evalOptionalArg(len)})`;
		},

		Min(_minLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.min(${evalChildren(args.asIteration().children)})`;
		},

		Mode(_modeLit: Node, num: Node) {
			semanticsHelper.addInstr("mode");
			semanticsHelper.addInstr("cls");
			return `mode(${num.eval()})`;
		},

		Move: drawMovePlot,

		Mover: drawMovePlot,

		New: notSupported,

		Next(_nextLit: Node, _variable: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// we cannot parse NEXT with multiple variables, if we want to match FOR and NEXT
			semanticsHelper.addIndent(-2);
			return `}`;
		},

		On_numGosub(_onLit: Node, e1: Node, _gosubLit: Node, args: Node) {
			const index = e1.eval();
			const argumentList = args.asIteration().children.map(child => child.sourceString);

			for (let i = 0; i < argumentList.length; i += 1) {
				const labelString = argumentList[i];
				semanticsHelper.addUsedLabel(labelString, "gosub");
			}

			return `([${argumentList.map((label) => `_${label}`).join(",")}]?.[${index} - 1] || (() => undefined))()`; // 1-based index
		},

		On_numGoto(lit: Node, num: Node, gotoLit: Node, labels: Node) {
			return notSupported(lit, num, gotoLit, labels.asIteration());
		},

		On_breakCont(lit: Node, breakLit: Node, contLit: Node) {
			return notSupported(lit, breakLit, contLit);
		},

		On_breakGosub(lit: Node, breakLit: Node, gosubLit: Node, label: Node) {
			return notSupported(lit, breakLit, gosubLit, label);
		},

		On_breakStop(lit: Node, breakLit: Node, stopLit: Node) {
			return notSupported(lit, breakLit, stopLit);
		},

		On_errorGoto(lit: Node, errorLit: Node, gotoLit: Node, label: Node) {
			return notSupported(lit, errorLit, gotoLit, label);
		},

		Openin(lit: Node, file: Node) {
			return notSupported(lit, file);
		},

		Openout(lit: Node, file: Node) {
			return notSupported(lit, file);
		},

		Origin(_originLit: Node, x: Node, _comma: Node, y: Node, _comma2: Node, win: Node,) {
			semanticsHelper.addInstr("origin");
			const winStr = win.child(0) ? notSupported(win.child(0)) : "";
			return `origin(${x.eval()}, ${y.eval()}${winStr})`;
		},

		Out(lit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, num, comma, num2);
		},

		Paper(_paperLit: Node, stream: Node, _comma: Node, e: Node) {
			semanticsHelper.addInstr("paper");
			const streamStr = stream.child(0)?.eval() || "";
			return `paper(${streamStr}${e.eval()})`;
		},

		Peek(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		Pen(_penLit: Node, stream: Node, _comma: Node, e: Node, _comma2: Node, e2: Node) {
			semanticsHelper.addInstr("pen");
			const streamStr = stream.child(0)?.eval() || "";
			const modeStr = e2.child(0) ? notSupported(e2.child(0)) : "";
			return `pen(${streamStr}${e.eval()}${modeStr})`;
		},

		Pi(_piLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "Math.PI";
		},

		Plot: drawMovePlot,

		Plotr: drawMovePlot,

		Poke(lit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, num, comma, num2);
		},

		Pos(lit: Node, open: Node, streamLit: Node, num: Node, close: Node) {
			if (num.eval() !== "0") {
				return notSupported(lit, open, streamLit, num, close) + "0";
			}
			semanticsHelper.addInstr("pos");
			return "pos()";
		},

		PrintArg_strCmp(_cmp: Node, args: Node) {
			const parameterString = args.children[0].eval();
			return parameterString;
		},

		PrintArg_usingNum(_printLit: Node, format: Node, _semi: Node, numArgs: Node) {
			semanticsHelper.addInstr("dec$");
			const formatString = format.eval();
			const argumentList = evalChildren(numArgs.asIteration().children);
			const parameterString = argumentList.map((arg) => `dec$(${arg}, ${formatString})`).join(', ');
			return parameterString;
		},

		PrintArg_commaOp(_comma: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `"${CommaOpChar}"`; // Unicode arrow right
		},

		StreamArg(streamLit: Node, stream: Node) {
			return notSupported(streamLit, stream) + "";
		},

		Print(_printLit: Node, stream: Node, _comma: Node, args: Node, semi: Node) {
			semanticsHelper.addInstr("printText");
			const streamStr = stream.child(0)?.eval() || "";
			const argumentList = evalChildren(args.asIteration().children);
			const parameterString = argumentList.join(', ') || "";

			const hasCommaOrTab = parameterString.includes(`"${CommaOpChar}`) || parameterString.includes(`"${TabOpChar}`);
			if (hasCommaOrTab) {
				semanticsHelper.addInstr("printTab");
			} else {
				semanticsHelper.addInstr("print");
			}

			let newlineString = "";
			if (!semi.sourceString) {
				newlineString = parameterString ? `, "\\n"` : `"\\n"`;
			}
			return `${hasCommaOrTab ? "printTab" : "print"}(${streamStr}${parameterString}${newlineString})`;
		},

		Rad(_radLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.setDeg(false);
			return `/* rad active */`;
		},

		Randomize(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Read(_readlit: Node, args: Node) {
			semanticsHelper.addInstr("read");
			const argumentList = evalChildren(args.asIteration().children);
			const results = argumentList.map(identifier => `${identifier} = read()`);
			return results.join("; ");
		},

		Release(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Rem(_remLit: Node, remain: Node) {
			return `// ${remain.sourceString}`;
		},

		Remain(_remainLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("remain");
			return `remain(${e.eval()})`;
		},

		Renum(lit: Node, num: Node, comma: Node, num2: Node, comma2: Node, num3: Node) {
			return notSupported(lit, num, comma, num2, comma2, num3);
		},

		Restore(_restoreLit: Node, e: Node) {
			const labelString = e.sourceString || "0";
			semanticsHelper.addRestoreLabel(labelString);
			semanticsHelper.addUsedLabel(labelString, "restore");

			semanticsHelper.addInstr("restore");
			return `restore(${labelString})`;
		},

		Resume(lit: Node, labelOrNext: Node) {
			return notSupported(lit, labelOrNext);
		},

		Return(_returnLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "return";
		},

		RightS(_rightLit: Node, _open: Node, str: Node, _comma: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("right$");
			return `right$(${str.eval()}, ${len.eval()})`;
		},

		Rnd(_rndLit: Node, _open: Node, _e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// args are ignored
			return `Math.random()`;
		},

		Round(_roundLit: Node, _open: Node, num: Node, _comma: Node, decimals: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const decimalPlaces = evalOptionalArg(decimals);
			if (decimalPlaces) {
				semanticsHelper.addInstr("round");
				return `round(${num.eval()}${decimalPlaces})`;
			}
			return `Math.round(${num.eval()})`; // common round without decimals places
			// A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
		},

		Rsx(_rsxLit: Node, cmd: Node, e: Node) {
			semanticsHelper.addInstr("rsxCall");
			const cmdString = adaptIdentName(cmd.sourceString).toLowerCase();
			const rsxArgs: string = e.child(0)?.eval() || "";

			if (rsxArgs === "") {
				return `await rsxCall("${cmdString}"${rsxArgs})`;
			}
			// need assign, not so nice to use <RSXFUNCTION>" as separator
			return rsxArgs.replace("<RSXFUNCTION>", `await rsxCall("${cmdString}"`) + ")";
		},

		RsxAddressOf(_adressOfLit: Node, ident: Node) {
			const identString = ident.eval().toLowerCase();
			return `@${identString}`;
		},

		RsxArgs(_comma: Node, args: Node) {
			const argumentList = evalChildren(args.asIteration().children);

			// Remove "@" prefix from arguments
			const argumentListNoAddr = argumentList.map(arg =>
				arg.startsWith("@") ? arg.substring(1) : arg
			);

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

		Run(lit: Node, labelOrFileOrNoting: Node) {
			return notSupported(lit, labelOrFileOrNoting);
		},

		Save(lit: Node, file: Node, comma: Node, type: Node, comma2: Node, num: Node, comma3: Node, num2: Node, comma4: Node, num3: Node) {
			return notSupported(lit, file, comma, type, comma2, num, comma3, num2, comma4, num3);
		},

		Sgn(_sgnLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.sign(${num.eval()})`;
		},

		Sin: cosSinTan,

		Sound(lit: Node, args: Node) {
			return notSupported(lit, args.asIteration());
		},

		SpaceS(_stringLit: Node, _open: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `" ".repeat(${len.eval()})`;
		},

		Spc(_lit: Node, _open: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `" ".repeat(${len.eval()})`;
		},

		Speed_ink(lit: Node, inkLit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, inkLit, num, comma, num2);
		},

		Speed_key(lit: Node, keyLit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, keyLit, num, comma, num2);
		},

		Speed_write(lit: Node, writeLit: Node, num: Node) {
			return notSupported(lit, writeLit, num);
		},

		Sq(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		Sqr(_sqrLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.sqrt(${e.eval()})`;
		},

		Stop(_stopLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("stop");
			return `return stop()`;
		},

		StrS(_strLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argument = num.eval();

			if (isNaN(Number(argument))) {
				semanticsHelper.addInstr("str$");
				return `str$(${argument})`;
			}
			// simplify if we know at compile time that arg is a positive number
			return argument >= 0 ? `(" " + String(${argument}))` : `String(${argument})`;
		},

		StringS_str(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, chr: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// Note: we do not use charAt(0) to get just one char
			return `(${chr.eval()}).repeat(${len.eval()})`;
		},

		StringS_num(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `String.fromCharCode(${num.eval()}).repeat(${len.eval()})`;
		},

		Symbol_def(lit: Node, args: Node) {
			return notSupported(lit, args.asIteration());
		},

		Symbol_after(lit: Node, afterLit: Node, num: Node) {
			return notSupported(lit, afterLit, num);
		},

		Tab(_lit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `"${TabOpChar}${num.eval()}"`; // Unicode double arrow right
		},

		Tag(_tagLit: Node, stream: Node) {
			semanticsHelper.addInstr("tag");
			const streamStr = stream.child(0)?.eval() || "";
			return `tag(true${streamStr})`;
		},

		Tagoff(_tagoffLit: Node, stream: Node) {
			semanticsHelper.addInstr("tag");
			const streamStr = stream.child(0)?.eval() || "";
			return `tag(false${streamStr})`;
		},

		Tan: cosSinTan,

		Test(lit: Node, open: Node, num: Node, comma: Node, num2: Node, close: Node) {
			return notSupported(lit, open, num, comma, num2, close) + "0";
		},

		Testr(lit: Node, open: Node, num: Node, comma: Node, num2: Node, close: Node) {
			return notSupported(lit, open, num, comma, num2, close) + "0";
		},

		Time(_timeLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("time");
			return `time()`;
		},

		Troff: notSupported,

		Tron: notSupported,

		Unt(_lit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${num.eval()}`;
		},

		UpperS(_upperLit: Node, _open: Node, str: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${str.eval()}).toUpperCase()`;
		},

		Val(_upperLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
			const numStr = String(e.eval());

			if (numPattern.test(numStr)) {
				return `Number(${numStr})`; // for non-hex/bin number strings we can use this simple version
			}
			semanticsHelper.addInstr("val");
			return `val(${numStr})`;
		},

		Vpos(lit: Node, open: Node, streamLit: Node, num: Node, close: Node) {
			if (num.eval() !== "0") {
				return notSupported(lit, open, streamLit, num, close) + "0";
			}
			semanticsHelper.addInstr("vpos");
			return "vpos()";
		},

		Wait(lit: Node, num: Node, comma: Node, num2: Node, comma2: Node, num3: Node) {
			return notSupported(lit, num, comma, num2, comma2, num3);
		},

		Wend(_wendLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addIndent(-2);
			return '}';
		},

		While(_whileLit: Node, e: Node) {
			const cond = e.eval();
			semanticsHelper.addIndent(2);
			return `while (${cond}) {`;
		},

		WhileWendBlock: loopBlock,

		Width(lit: Node, num: Node,) {
			return notSupported(lit, num);
		},

		Window_def(lit: Node, stream: Node, comma0: Node, num: Node, comma: Node, num2: Node, comma2: Node, num3: Node, comma3: Node, num4: Node) {
			return notSupported(lit, stream, comma0, num, comma, num2, comma2, num3, comma3, num4);
		},

		Window_swap(lit: Node, swapLit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, swapLit, num, comma, num2);
		},

		Write(_printLit: Node, stream: Node, _comma: Node, args: Node) {
			semanticsHelper.addInstr("write");
			semanticsHelper.addInstr("printText");
			const streamStr = stream.child(0)?.eval() || "";
			const parameterString = evalChildren(args.asIteration().children).join(', ');
			return `write(${streamStr}${parameterString})`;
		},

		Xpos(_xposLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("xpos");
			return `xpos()`;
		},

		Ypos(_xposLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("ypos");
			return `ypos()`;
		},

		Zone(_lit: Node, num: Node) {
			semanticsHelper.addInstr("zone");
			return `zone(${num.eval()})`;
		},

		AndExp_and(a: Node, _op: Node, b: Node) {
			return `${a.eval()} & ${b.eval()}`;
		},

		NotExp_not(_op: Node, e: Node) {
			return `~(${e.eval()})`;
		},

		OrExp_or(a: Node, _op: Node, b: Node) {
			return `${a.eval()} | ${b.eval()}`;
		},

		XorExp_xor(a: Node, _op: Node, b: Node) {
			return `${a.eval()} ^ ${b.eval()}`;
		},


		AddExp_minus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} - ${b.eval()}`;
		},
		AddExp_plus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} + ${b.eval()}`;
		},

		CmpExp_eq(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "===", b);
		},
		CmpExp_ge(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, ">=", b);
		},
		CmpExp_gt(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, ">", b);
		},
		CmpExp_le(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "<=", b);
		},
		CmpExp_lt(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "<", b);
		},
		CmpExp_ne(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "!==", b);
		},

		DivExp_div(a: Node, _op: Node, b: Node) {
			return `((${a.eval()} / ${b.eval()}) | 0)`;
		},

		ExpExp_power(a: Node, _: Node, b: Node) {
			return `Math.pow(${a.eval()}, ${b.eval()})`;
		},

		ModExp_mod(a: Node, _op: Node, b: Node) {
			return `${a.eval()} % ${b.eval()}`;
		},

		MulExp_divide(a: Node, _op: Node, b: Node) {
			return `${a.eval()} / ${b.eval()}`;
		},

		MulExp_times(a: Node, _op: Node, b: Node) {
			return `${a.eval()} * ${b.eval()}`;
		},

		PriExp_neg(_op: Node, e: Node) {
			return `-${e.eval()}`;
		},
		PriExp_paren(_open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()})`;
		},
		PriExp_pos(_op: Node, e: Node) {
			return `+${e.eval()}`;
		},

		StrAddExp_plus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} + ${b.eval()}`;
		},
		StrCmpExp_eq(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} === ${b.eval()})`;
		},
		StrCmpExp_ge(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} >= ${b.eval()})`;
		},
		StrCmpExp_gt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} > ${b.eval()})`;
		},
		StrCmpExp_le(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} <= ${b.eval()})`;
		},
		StrCmpExp_lt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} < ${b.eval()})`;
		},
		StrCmpExp_ne(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} !== ${b.eval()})`;
		},

		StrPriExp_paren(_open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()})`;
		},

		ArrayArgs(args: Node) {
			return evalChildren(args.asIteration().children).join("][");
		},

		ArrayIdent(ident: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${ident.eval()}[${e.eval()}]`;
		},

		DimArrayArgs(args: Node) {
			return evalChildren(args.asIteration().children).join(", ");
		},

		DimArrayIdent(ident: Node, _open: Node, indices: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
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

		StrArrayIdent(ident: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${ident.eval()}[${e.eval()}]`;
		},

		dataUnquoted(data: Node) {
			const str = data.sourceString;
			if (!isNaN(Number(str))) {
				return str;
			}
			return notSupported(data) + `"${str}"`;
		},

		decimalValue(value: Node) {
			return value.sourceString.replace(/^(-?)(0+)(\d)/, "$1$3"); // avoid actal numbers: remove leading zeros, but keep sign
		},

		hexValue(_prefix: Node, value: Node) {
			return `0x${value.sourceString}`;
		},

		binaryValue(_prefix: Node, value: Node) {
			return `0b${value.sourceString}`;
		},

		signedDecimal(sign: Node, value: Node) {
			return `${sign.sourceString}${value.sourceString}`;
		},

		string(_quote1: Node, e: Node, quote2: Node) {
			const str = e.sourceString.replace(/\\/g, "\\\\"); // escape backslashes
			const varStr = quote2.sourceString !== '"' ? notSupported(quote2).replace("\n", "eol") : "";
			return `"${str}"${varStr}`;
		},

		ident(ident: Node, suffix: Node) {
			const name = adaptIdentName(ident.sourceString);
			const suffixStr = suffix.child(0)?.sourceString;
			if (suffixStr !== undefined) { // real or integer suffix
				return semanticsHelper.getVariable(name) + notSupported(suffix);
			}
			return semanticsHelper.getVariable(name);
		},

		fnIdent(fn: Node, _space: Node, ident: Node, suffix: Node) {
			const name = fn.sourceString + adaptIdentName(ident.sourceString);
			const suffixStr = suffix.child(0)?.sourceString;
			if (suffixStr !== undefined) { // real or integer suffix
				return semanticsHelper.getVariable(name) + notSupported(suffix);
			}
			return semanticsHelper.getVariable(name);
		},

		strIdent(ident: Node, typeSuffix: Node) {
			const name = adaptIdentName(ident.sourceString) + typeSuffix.sourceString;
			return semanticsHelper.getVariable(name);
		},

		strFnIdent(fn: Node, _space: Node, ident: Node, typeSuffix: Node) {
			const name = fn.sourceString + adaptIdentName(ident.sourceString) + typeSuffix.sourceString;
			return semanticsHelper.getVariable(name);
		}
	};
	return semantics;
}

export class Semantics implements ISemantics {
	private readonly helper: SemanticsHelper;

	constructor() {
		this.helper = new SemanticsHelper();
	}

	public resetParser(): void {
		this.helper.resetParser();
	}

	public getUsedLabels(): Record<string, Record<string, UsedLabelEntryType>> {
		return this.helper.getUsedLabels();
	}

	public getSemanticsActions() {
		return getSemanticsActions(this.helper);
	}

	public getSemanticsActionDict(): ActionDict<string> {
		return this.getSemanticsActions() as ActionDict<string>;
	}

	public getHelper(): SemanticsHelper {
		return this.helper;
	}

	public getCodeSnippets4Test(data: Partial<typeof codeSnippetsData>) {
		return getCodeSnippets(data as typeof codeSnippetsData);
	}
}
