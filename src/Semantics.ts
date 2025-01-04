// Semantics.ts

import type { ActionDict, Node } from "ohm-js";
import type { IVm } from "./Interfaces";

// Type definition for a defined label entry
type DefinedLabelEntryType = {
    label: string,
    first: number,
    last: number,
    dataIndex: number
}

// Type definition for a GOSUB label entry
type GosubLabelEntryType = {
    count: number
}

type RecursiveArray<T> = T | RecursiveArray<T>[];

// Interface for Semantics Helper
interface SemanticsHelper {
    addDataIndex(count: number): void,
    addDefinedLabel(label: string, line: number): void,
    addGosubLabel(label: string): void,
    addIndent(num: number): number,
    addInstr(name: string): number,
    addRestoreLabel(label: string): void,
    applyNextIndent(): void,
    getDataIndex(): number,
    getDataList(): (string | number)[],
    getDefinedLabels(): DefinedLabelEntryType[],
    getGosubLabels(): Record<string, GosubLabelEntryType>,
    getIndent(): number,
    getIndentStr(): string,
    getInstrMap(): Record<string, number>,
    getRestoreMap(): Record<string, number>,
    getVariable(name: string): string,
    getVariables(): string[],
    incrementLineIndex(): number,
    nextIndentAdd(num: number): void,
    setIndent(indent: number): void,
	setDeg(deg: boolean): void,
	getDeg(): boolean
}

function getCodeSnippets() {
	const _o = {} as IVm;
	let _data: (string | number)[] = [];
	let _dataPtr = 0;
	let _restoreMap: Record<string, number> = {};

	const codeSnippets: Record<string, (...args: any[]) => unknown> = {
		_setDataDummy: function _setDataDummy() { // not really used
			_data = [ ];
			_dataPtr = 0;
			_restoreMap = {};
			//Object.assign(_o, vm);
		},
		bin$: function bin$(num: number, pad: number = 0) {
			return num.toString(2).toUpperCase().padStart(pad, "0");
		},
		cls: function cls() {
			_o.cls();
		},
		dec$: function dec$(num: number, format: string) {
			const [, decimalPart] = format.split(".", 2);
			const decimals = decimalPart ? decimalPart.length : 0;
			const str = num.toFixed(decimals);
			const padLen = format.length - str.length;
			const pad = padLen > 0 ? " ".repeat(padLen) : "";
			return pad + str;
		},
		dim: function dim(dims: number[], initVal: string | number = 0) {
			const createRecursiveArray = (depth: number): RecursiveArray<string | number> => {
				const length = dims[depth] + 1; // +1 because of 0-based index
				const array = Array.from({ length }, () =>
					depth + 1 < dims.length ? createRecursiveArray(depth + 1) : initVal
				);
				return array;
			};
			return createRecursiveArray(0);
		},
		frame: function frame() { // async
			return new Promise<void>(resolve => setTimeout(() => resolve(), Date.now() % 50));
		},
		hex$: function hex$(num: number, pad?: number) {
			return num.toString(16).toUpperCase().padStart(pad || 0, "0");
		},
		input: function input(msg: string, isNum: boolean) { // async
			return new Promise(resolve => setTimeout(() => {
				const input = _o.prompt(msg);
				resolve(isNum ? Number(input) : input);
			}, 0));
		},
		mid$Assign: function mid$Assign(s: string, start: number, newString: string, len?: number) {
			start -= 1;
			len = Math.min(len ?? newString.length, newString.length, s.length - start);
			return s.substring(0, start) + newString.substring(0, len) + s.substring(start + len);
		},
		print: function print(...args: (string | number)[]) {
			const _printNumber = (arg: number) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
			const output = args.map((arg) => (typeof arg === "number") ? _printNumber(arg) : arg).join("");
			_o.print(output);
		},
		read: function read() {
			return _data[_dataPtr++];
		},
		restore: function restore(label: string) {
			_dataPtr = _restoreMap[label];
		},
		round: function round(num: number, dec: number) {
			return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
		},
		str$: function str$(num: number) {
			return num >= 0 ? ` ${num}`: String(num);
		},
		time: function time() {
			return (Date.now() * 3 / 10) | 0;
		},
		val: function val(str: string) {
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

function trimIndent(code: string) {
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


function evalChildren(children: Node[]) {
	return children.map(c => c.eval());
}

function getSemantics(semanticsHelper: SemanticsHelper) {
	// Semantics to evaluate an arithmetic expression
	const semantics: ActionDict<string | string[]> = {
		Program(lines: Node) {
			const lineList = evalChildren(lines.children);

			const variableList = semanticsHelper.getVariables();
			const variableDeclarations = variableList.length ? "let " + variableList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";" : "";

			// find subroutines
			const definedLabels = semanticsHelper.getDefinedLabels();
			const gosubLabels = semanticsHelper.getGosubLabels();
			const restoreMap = semanticsHelper.getRestoreMap();

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
					} else {
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
			semanticsHelper.applyNextIndent();

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
			const variableName = ident.sourceString;
			const resolvedVariableName = semanticsHelper.getVariable(variableName);
			const value = e.eval();
			return `${resolvedVariableName} = ${value}`;
		},

		Abs(_absLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.abs(${e.eval()})`;
		},

		Asc(_ascLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).charCodeAt(0)`;
		},

		Atn(_atnLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return semanticsHelper.getDeg() ? `(Math.atan(${e.eval()}) * 180 / Math.PI)` : `Math.atan(${e.eval()})`;
		},

		BinS(_binLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("bin$");
			const pad = n.child(0)?.eval();
			return pad !== undefined ? `bin$(${e.eval()}, ${pad})` : `bin$(${e.eval()})`
		},

		ChrS(_chrLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `String.fromCharCode(${e.eval()})`;
		},

		Comment(_commentLit: Node, remain: Node) {
			return `//${remain.sourceString}`;
		},

		Cos(_cosLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return semanticsHelper.getDeg() ? `Math.cos((${e.eval()}) * Math.PI / 180)` : `Math.cos(${e.eval()})`;
		},

		Cint(_cintLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.round(${e.eval()})`;
		},

		Cls(_clsLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("cls");
			return `cls()`;
		},

		Data(_datalit: Node, args: Node) {
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

		DecS(_decLit: Node, _open: Node, num: Node, _comma: Node, format: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("dec$");
			return `dec$(${num.eval()}, ${format.eval()})`;
		},

		Def(_defLit: Node, _fnLit: Node, assign: Node) {
			return `${assign.eval()}`;
		},

		DefArgs(_open: Node, arrayIdents: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argList = arrayIdents.asIteration().children.map(c => c.eval());

			return `(${argList.join(", ")})`;
		},

		DefAssign(ident: Node, args: Node, _equal: Node, e: Node) {
			const argStr = args.children.map(c => c.eval()).join(", ") || "()";
			const fnIdent = semanticsHelper.getVariable(`fn${ident.sourceString}`);

			return `${fnIdent} = ${argStr} => ${e.eval()}`;
		},

		Deg(_degLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.setDeg(true);
			return `/* deg active */`;
		},

		Dim(_dimLit: Node, arrayIdents: Node) {
			const argList = arrayIdents.asIteration().children.map(c => c.eval());
			const results: string[] = [];

			for (const arg of argList) {
				const [ident, ...indices] = arg;
				let createArrStr: string;
				if (indices.length > 1) { // multi-dimensional?
					const initValStr = ident.endsWith("$") ? ', ""' : '';
					createArrStr = `dim([${indices}]${initValStr})`; // indices are automatically joined with comma
					semanticsHelper.addInstr("dim");
				} else {
					const fillStr = ident.endsWith("$") ? `""` : "0";
					createArrStr = `new Array(${indices[0]} + 1).fill(${fillStr})`; // +1 because of 0-based index
				}
				results.push(`${ident} = ${createArrStr}`);
			}

			return results.join("; ");
		},

		End(_endLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `return "end"`;
		},

		Erase(_eraseLit: Node, arrayIdents: Node) { // erase not really needed
			const argList = arrayIdents.asIteration().children.map(c => c.eval());
			const results: string[] = [];

			for (const ident of argList) {
				const initValStr = ident.endsWith("$") ? '""' : '0';
				results.push(`${ident} = ${initValStr}`);
			}

			return results.join("; ");
		},

		Error(_errorLit: Node, e: Node) {
			return `throw new Error(${e.eval()})`;
		},

		Exp(_expLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.exp(${e.eval()})`;
		},

		Fix(_fixLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.trunc(${e.eval()})`;
		},

		FnArgs(_open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argList = args.asIteration().children.map(c => c.eval());

			return `(${argList.join(", ")})`;
		},

		StrFnArgs(_open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argList = args.asIteration().children.map(c => c.eval());

			return `(${argList.join(", ")})`;
		},

		FnIdent(fnIdent: Node, args: Node) {
			const argStr = args.child(0)?.eval() || "()";
			return `${fnIdent.eval()}${argStr}`;
		},

		StrFnIdent(fnIdent: Node, args: Node) {
			const argStr = args.child(0)?.eval() || "()";
			return `${fnIdent.eval()}${argStr}`;
		},

		For(_forLit: Node, variable: Node, _eqSign: Node, start: Node, _dirLit: Node, end: Node, _stepLit: Node, step: Node) {
			const varExp = variable.eval();
			const startExp = start.eval();
			const endExp = end.eval();
			const stepExp = step.child(0)?.eval() || "1";

			const stepAsNum = Number(stepExp);

			let cmpSt = "";
			if (isNaN(stepAsNum)) {
				cmpSt = `${stepExp} >= 0 ? ${varExp} <= ${endExp} : ${varExp} >= ${endExp}`
			} else {
				cmpSt = stepExp >= 0 ? `${varExp} <= ${endExp}` : `${varExp} >= ${endExp}`;
			}

			semanticsHelper.nextIndentAdd(2);
			const result = `for (${varExp} = ${startExp}; ${cmpSt}; ${varExp} += ${stepExp}) {`;

			return result;
		},

		Frame(_frameLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("frame");
			return `await frame()`;
		},

		Gosub(_gosubLit: Node, e: Node) {
			const labelStr = e.sourceString;
			semanticsHelper.addGosubLabel(labelStr);

			return `_${labelStr}()`;
		},

		HexS(_hexLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("hex$");
			const pad = n.child(0)?.eval();
			return pad !== undefined ? `hex$(${e.eval()}, ${pad})` : `hex$(${e.eval()})`
		},

		If(_iflit: Node, condExp: Node, _thenLit: Node, thenStat: Node, elseLit: Node, elseStat: Node) {
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

		Input(_inputLit: Node, message: Node, _semi: Node, e: Node) {
			semanticsHelper.addInstr("input");

			const msgStr = message.sourceString.replace(/\s*[;,]$/, "");
			const ident = e.eval();
			const isNumStr = ident.includes("$") ? "" : ", true";

			return `${ident} = await input(${msgStr}${isNumStr})`;
		},

		Instr_noLen(_instrLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `((${e1.eval()}).indexOf(${e2.eval()}) + 1)`;
		},

		Instr_len(_instrLit: Node, _open: Node, len: Node, _comma1: Node, e1: Node, _comma2: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `((${e1.eval()}).indexOf(${e2.eval()}, ${len.eval()} - 1) + 1)`;
		},

		Int(_intLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.floor(${e.eval()})`;
		},

		LeftS(_leftLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e1.eval()}).slice(0, ${e2.eval()})`;
		},

		Len(_lenLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).length`;
		},

		Log(_logLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.log(${e.eval()})`;
		},

		Log10(_log10Lit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.log10(${e.eval()})`;
		},

		LowerS(_lowerLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).toLowerCase()`;
		},

		Max(_maxLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
			return `Math.max(${argList})`;
		},

		MidS(_midLit: Node, _open: Node, e1: Node, _comma1: Node, e2: Node, _comma2: Node, e3: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const length = e3.child(0)?.eval();
			const lengthStr = length === undefined ? "" : `, ${length}`;
			return `(${e1.eval()}).substr(${e2.eval()} - 1${lengthStr})`;
		},

		MidSAssign(_midLit: Node, _open: Node, ident: Node, _comma1: Node, e2: Node, _comma2: Node, e3: Node, _close: Node, _op: Node, e: Node) {
			semanticsHelper.addInstr("mid$Assign");

			const variableName = ident.sourceString;
			const resolvedVariableName = semanticsHelper.getVariable(variableName);
			const start = e2.eval();
			const newString = e.eval();
			const length = e3.child(0)?.eval(); // also undefined possible

			return `${resolvedVariableName} = mid$Assign(${resolvedVariableName}, ${start}, ${newString}, ${length})`;
		},

		Min(_minLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
			return `Math.min(${argList})`;
		},

		Mode(_clsLit: Node, _num: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("cls"); // currently MODE is the same as CLS
			return `cls()`;
		},

		Next(_nextLit: Node, variables: Node) {
			const argList = variables.asIteration().children.map(c => c.eval());
			if (!argList.length) {
				argList.push("_any");
			}
			semanticsHelper.addIndent(-2 * argList.length);
			return '} '.repeat(argList.length).slice(0, -1);
		},

		On(_nLit: Node, e1: Node, _gosubLit: Node, args: Node) {
			const index = e1.eval();
			const argList = args.asIteration().children.map(c => c.sourceString);

			for (let i = 0; i < argList.length; i += 1) {
				semanticsHelper.addGosubLabel(argList[i]);
			}

			return `[${argList.map((label) => `_${label}`).join(",")}]?.[${index} - 1]()`; // 1-based index
		},

		Pi(_piLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "Math.PI";
		},

		PrintArg_strCmp(_cmp: Node, args: Node) {
			const paramStr = args.children[0].eval();
			return paramStr;
		},

		PrintArg_usingNum(_printLit: Node, format: Node, _semi: Node, num: Node) {
			semanticsHelper.addInstr("dec$");
			return `dec$(${num.eval()}, ${format.eval()})`;
		},

		Print(_printLit: Node, args: Node, semi: Node) {
			semanticsHelper.addInstr("print");
			const argList = args.asIteration().children.map(c => c.eval());
			const paramStr = argList.join(', ') || "";

			let newlineStr = "";
			if (!semi.sourceString) {
				newlineStr = paramStr ? `, "\\n"` : `"\\n"`;
			}
			return `print(${paramStr}${newlineStr})`;
		},

		Rad(_radLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.setDeg(false);
			return `/* rad active */`;
		},

		Read(_readlit: Node, args: Node) {
			semanticsHelper.addInstr("read");
			const argList = args.asIteration().children.map(c => c.eval());
			const results = argList.map(identifier => `${identifier} = read()`);
			return results.join("; ");
		},

		Rem(_remLit: Node, remain: Node) {
			return `// ${remain.sourceString}`;
		},

		Restore(_restoreLit: Node, e: Node) {
			const labelStr = e.sourceString || "0";
			semanticsHelper.addRestoreLabel(labelStr);

			semanticsHelper.addInstr("restore");
			return `restore(${labelStr})`;
		},

		Return(_returnLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "return";
		},

		RightS(_rightLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const str = e1.eval();
			const len = e2.eval();
			return `(${str}).substring((${str}).length - (${len}))`;
		},

		Rnd(_rndLit: Node, _open: Node, _e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// args are ignored
			return `Math.random()`;
		},

		Round(_roundLit: Node, _open: Node, value: Node, _comma: Node, decimals: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const decimalPlaces = decimals.child(0)?.eval();
			if (decimalPlaces) {
				semanticsHelper.addInstr("round");
				return `round(${value.eval()}, ${decimalPlaces})`;
			}
			return `Math.round(${value.eval()})`; // common round without decimals places
			// A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
		},

		Sgn(_sgnLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.sign(${e.eval()})`;
		},

		Sin(_sinLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return semanticsHelper.getDeg() ? `Math.sin((${e.eval()}) * Math.PI / 180)` : `Math.sin(${e.eval()})`;
		},

		SpaceS(_stringLit: Node, _open: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `" ".repeat(${len.eval()})`;
		},

		Sqr(_sqrLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.sqrt(${e.eval()})`;
		},

		Stop(_stopLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `return "stop"`;
		},

		StrS(_strLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const arg = e.eval();

			if (isNaN(Number(arg))) {
				semanticsHelper.addInstr("str$");
				return `str$(${arg})`;
			}
			// simplify if we know at compile time that arg is a positive number
			return arg >= 0 ? `(" " + String(${arg}))` : `String(${arg})`;
		},

		StringS_str(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, chr: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// Note: we do not use charAt(0) to get just one char
			return `(${chr.eval()}).repeat(${len.eval()})`;
		},

		StringS_num(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `String.fromCharCode(${num.eval()}).repeat(${len.eval()})`;
		},

		Tan(_tanLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return semanticsHelper.getDeg() ? `Math.tan((${e.eval()}) * Math.PI / 180)` : `Math.tan(${e.eval()})`;
		},

		Time(_timeLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("time");
			return `time()`;
		},

		UpperS(_upperLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).toUpperCase()`;
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

		Wend(_wendLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addIndent(-2);
			return '}';
		},

		While(_whileLit: Node, e: Node) {
			const cond = e.eval();
			semanticsHelper.nextIndentAdd(2);
			return `while (${cond}) {`;
		},

		XorExp_xor(a: Node, _op: Node, b: Node) {
			return `${a.eval()} ^ ${b.eval()}`;
		},

		OrExp_or(a: Node, _op: Node, b: Node) {
			return `${a.eval()} | ${b.eval()}`;
		},

		AndExp_and(a: Node, _op: Node, b: Node) {
			return `${a.eval()} & ${b.eval()}`;
		},

		NotExp_not(_op: Node, e: Node) {
			return `~(${e.eval()})`;
		},

		CmpExp_eq(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} === ${b.eval()})`; // or -Number(...), or -(...), or: ? -1 : 0
		},
		CmpExp_ne(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} !== ${b.eval()})`;
		},
		CmpExp_lt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} < ${b.eval()})`;
		},
		CmpExp_le(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} <= ${b.eval()})`;
		},
		CmpExp_gt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} > ${b.eval()})`;
		},
		CmpExp_ge(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} >= ${b.eval()})`;
		},

		AddExp_plus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} + ${b.eval()}`;
		},
		AddExp_minus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} - ${b.eval()}`;
		},

		ModExp_mod(a: Node, _op: Node, b: Node) {
			return `${a.eval()} % ${b.eval()}`;
		},

		DivExp_div(a: Node, _op: Node, b: Node) {
			return `((${a.eval()} / ${b.eval()}) | 0)`;
		},

		MulExp_times(a: Node, _op: Node, b: Node) {
			return `${a.eval()} * ${b.eval()}`;
		},
		MulExp_divide(a: Node, _op: Node, b: Node) {
			return `${a.eval()} / ${b.eval()}`;
		},

		ExpExp_power(a: Node, _: Node, b: Node) {
			return `Math.pow(${a.eval()}, ${b.eval()})`;
		},

		PriExp_paren(_open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()})`;
		},
		PriExp_pos(_op: Node, e: Node) {
			return `+${e.eval()}`;
		},
		PriExp_neg(_op: Node, e: Node) {
			return `-${e.eval()}`;
		},

		StrCmpExp_eq(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} === ${b.eval()})`;
		},
		StrCmpExp_ne(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} !== ${b.eval()})`;
		},
		StrCmpExp_lt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} < ${b.eval()})`;
		},
		StrCmpExp_le(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} <= ${b.eval()})`;
		},
		StrCmpExp_gt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} > ${b.eval()})`;
		},
		StrCmpExp_ge(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} >= ${b.eval()})`;
		},

		StrAddExp_plus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} + ${b.eval()}`;
		},

		StrPriExp_paren(_open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()})`;
		},

		ArrayArgs(args: Node) {
			return args.asIteration().children.map(c => String(c.eval()));
		},

		ArrayIdent(ident: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${ident.eval()}[${e.eval().join("][")}]`;
		},

		StrArrayIdent(ident: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${ident.eval()}[${e.eval().join("][")}]`;
		},

		DimArrayIdent(ident: Node, _open: Node, indices: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return [ident.eval(), ...indices.eval()];
		},

		decimalValue(value: Node) {
			return value.sourceString;
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

		string(_quote1: Node, e: Node, _quote2: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `"${e.sourceString}"`;
		},

		ident(ident: Node) {
			const name = ident.sourceString;
			return semanticsHelper.getVariable(name);
		},

		fnIdent(fn: Node, ident: Node) {
			const name = fn.sourceString + ident.sourceString;
			return semanticsHelper.getVariable(name);
		},

		strIdent(ident: Node, typeSuffix: Node) {
			const name = ident.sourceString + typeSuffix.sourceString;
			return semanticsHelper.getVariable(name);
		},

		strFnIdent(fn: Node, ident: Node, typeSuffix: Node) {
			const name = fn.sourceString + ident.sourceString + typeSuffix.sourceString;
			return semanticsHelper.getVariable(name);
		}
	};
	return semantics;
}


export class Semantics {
	private lineIndex = 0;

	private indent = 0;
	private indentAdd = 0;

	private readonly variables: Record<string, number> = {};

	private readonly definedLabels: DefinedLabelEntryType[] = [];
	private readonly gosubLabels: Record<string, GosubLabelEntryType> = {};

	private readonly dataList: (string | number)[] = [];
	private dataIndex = 0;
	private readonly restoreMap: Record<string, number> = {};

	private static readonly reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;

	private readonly instrMap: Record<string, number> = {};

	private isDeg = false;

	private addIndent(num: number) {
		if (num < 0) {
			this.applyNextIndent();
		}
		this.indent += num;
		return this.indent;
	}

	private setIndent(indent: number) {
		this.indent = indent;
	}

	private getIndent() {
		return this.indent;
	}

	private getIndentStr() {
		if (this.indent < 0) {
			console.error("getIndentStr: lineIndex=", this.lineIndex, ", indent=", this.indent);
			return "";
		}
		return " ".repeat(this.indent);
	}

	private applyNextIndent() {
		this.indent += this.indentAdd;
		this.indentAdd = 0;
	}

	private nextIndentAdd(num: number) {
		this.indentAdd += num;
	}

	private addDataIndex(count: number) {
		return this.dataIndex += count;
	}

	private getDataIndex() {
		return this.dataIndex;
	}

	private addDefinedLabel(label: string, line: number) {
		this.definedLabels.push({
			label,
			first: line,
			last: -1,
			dataIndex: -1
		});
	}

	private getDefinedLabels() {
		return this.definedLabels;
	}

	private addGosubLabel(label: string) {
		this.gosubLabels[label] = this.gosubLabels[label] || {
			count: 0
		};
		this.gosubLabels[label].count = (this.gosubLabels[label].count || 0) + 1;
	}

	private getGosubLabels() {
		return this.gosubLabels;
	}

	private getInstrMap() {
		return this.instrMap;
	}

	private addInstr(name: string) {
		this.instrMap[name] = (this.instrMap[name] || 0) + 1;
		return this.instrMap[name];
	}

	private getVariables() {
		return Object.keys(this.variables);
	}

	private getVariable(name: string) {
		name = name.toLowerCase();
		if (Semantics.reJsKeyword.test(name)) {
			name = `_${name}`;
		}

		this.variables[name] = (this.variables[name] || 0) + 1;
		return name;
	}

	private static deleteAllItems(items: Record<string, unknown>) {
		for (const name in items) {
			delete items[name];
		}
	}

	private incrementLineIndex() {
		this.lineIndex += 1;
		return this.lineIndex;
	}

	private getRestoreMap() {
		return this.restoreMap;
	}

	private addRestoreLabel(label: string) {
		this.restoreMap[label] = -1;
	}

	private getDataList() {
		return this.dataList;
	}

	public resetParser() {
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

	public getSemantics() {
		const semanticsHelper: SemanticsHelper = {
			addDataIndex: (count: number) => this.addDataIndex(count),
			addDefinedLabel: (label: string, line: number) => this.addDefinedLabel(label, line),
			addGosubLabel: (label: string) => this.addGosubLabel(label),
			addIndent: (num: number) => this.addIndent(num),
			addInstr: (name: string) => this.addInstr(name),
			addRestoreLabel: (label: string) => this.addRestoreLabel(label),
			applyNextIndent: () => this.applyNextIndent(),
			getDataIndex: () => this.getDataIndex(),
			getDataList: () => this.getDataList(),
			getDefinedLabels: () => this.getDefinedLabels(),
			getGosubLabels: () => this.getGosubLabels(),
			getIndent: () => this.getIndent(),
			getIndentStr: () => this.getIndentStr(),
			getInstrMap: () => this.getInstrMap(),
			getRestoreMap: () => this.getRestoreMap(),
			getVariable: (name: string) => this.getVariable(name),
			getVariables: () => this.getVariables(),
			incrementLineIndex: () => this.incrementLineIndex(),
			nextIndentAdd: (num: number) => this.nextIndentAdd(num),
			setIndent: (indent: number) => this.setIndent(indent),
			setDeg: (isDeg: boolean) => this.isDeg = isDeg,
			getDeg: () => this.isDeg
		};
		return getSemantics(semanticsHelper);
	}
}
