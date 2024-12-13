// Semantics.ts
import type { ActionDict, Node } from "ohm-js";


type DefinedLabelEntryType = {
	label: string,
	first: number,
	last: number,
	dataIndex: number
}

type GosubLabelEntryType = {
	count: number
}

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
	setIndent(indent: number): void
}

function getCodeSnippets() {
	const _o: Record<string, Function> = {};
	let _data: (string | number)[] = [];
	let _dataPtr = 0;
	let _restoreMap: Record<string, number> = {};
	//let dataList: (string|number)[] = []; // eslint-disable-line prefer-const

	const codeSnippets: Record<string, Function> = {
		_dataDefine: function _dataDefine() { // not really used
			_data = [ ];
			_dataPtr = 0;
			_restoreMap = {};
		},
		_bin$: function _bin$(num: number, pad?: number) {
			return num.toString(2).toUpperCase().padStart(pad || 0, "0");
		},
		_cls: function _cls() {
			_o.cls();
		},
		_dim: function _dim(dims: number[], initVal: string | number = 0): any[] {
			const createRecursiveArray = (depth: number): any[] => {
				const length = dims[depth] + 1; // +1 because of 0-based index
				const array = Array.from({ length }, () =>
					depth + 1 < dims.length ? createRecursiveArray(depth + 1) : initVal
				);
				return array;
			};
			return createRecursiveArray(0);
		},
		_frame: function _frame() {
			return new Promise<void>(resolve => setTimeout(() => resolve(), Date.now() % 50));
		},
		_hex$: function _hex$(num: number, pad?: number) {
			return num.toString(16).toUpperCase().padStart(pad || 0, "0");
		},
		_input: function _input(msg: string, isNum: boolean) {
			return new Promise(resolve => setTimeout(() => resolve(isNum ? Number(prompt(msg)) : prompt(msg)), 0));
		},
		_print: function _print(...args: (string | number)[]) {
			const _printNumber = (arg: number) => (arg >= 0) ? ` ${arg} ` : `${arg} `;
			_o.print(args.map((arg) => (typeof arg === "number") ? _printNumber(arg) : arg).join(""));
		},
		_read: function _read() {
			return _data[_dataPtr++];
		},
		_restore: function _restore(label: string) {
			_dataPtr = _restoreMap[label];
		},
		_round: function _round(num: number, dec: number) {
			return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
		},
		_str$: function _str$(num: number) {
			return num >= 0 ? ` ${num}`: String(num);
		},
		_time: function _time() {
			return (Date.now() * 3 / 10) | 0;
		},
		_val: function _val(str: string) {
			return Number(str.replace("&x", "0b").replace("&", "0x"));
		},
	};
	return codeSnippets;
}

function trimIndent(code: string) {
	const lines = code.split("\n");
	const lastLine = lines[lines.length - 1];

	const match = lastLine.match(/^(\s+)}$/);
	if (match) {
		const indent = match[1];
		const lines2 = lines.map((l) => l.replace(indent, ""));
		return lines2.join("\n");
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
			const varStr = variableList.length ? "let " + variableList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";" : "";

			// find subroutines
			const definedLabels = semanticsHelper.getDefinedLabels();
			const gosubLabels = semanticsHelper.getGosubLabels();
			const restoreMap = semanticsHelper.getRestoreMap();

			let subFirst: DefinedLabelEntryType | undefined;
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
				//let startIdx = 0;
				for (const key of Object.keys(restoreMap)) {
					let index = restoreMap[key];
					if (index < 0) {
						index = 0;
						restoreMap[key] = index; //TODO
					}
				}
				lineList.unshift(`const {_data, _restoreMap} = _defineData();\nlet _dataPtr = 0;`);
				lineList.push(`function _defineData() {\n  const _data = [\n${dataList.join(",\n")}\n  ];\n  const _restoreMap = ${JSON.stringify(restoreMap)};\n  return {_data, _restoreMap};\n}`);
			}

			lineList.push("// library");

			const instrMap = semanticsHelper.getInstrMap();
			const codeSnippets = getCodeSnippets();

			for (const key of Object.keys(codeSnippets)) {
				if (instrMap[key]) {
					const code = String(codeSnippets[key]);
					lineList.push(trimIndent(code));
				}
			}

			if (varStr) {
				lineList.unshift(varStr);
			}

			if (instrMap["_frame"] || instrMap["_input"]) {
				lineList.unshift(`return async function() {`);
				lineList.push('}();');
			}

			lineList.unshift(`"use strict"`);

			const lineStr = lineList.filter((line) => line !== "").join('\n');
			return lineStr;
		},

		Line(label: Node, stmts: Node, comment: Node, _eol: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
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

			const indentStr = semanticsHelper.getIndentStr();
			semanticsHelper.applyNextIndent();

			return indentStr + lineStr + commentStr + semi;
		},

		Statements(stmt: Node, _stmtSep: Node, stmts: Node) {
			// separate statements, use ";", if the last stmt does not end with "{"
			return [stmt.eval(), ...evalChildren(stmts.children)].reduce((str, st) => str.endsWith("{") ? `${str} ${st}` : `${str}; ${st}`);
		},

		ArrayAssign(ident: Node, _op: Node, e: Node): string {
			return `${ident.eval()} = ${e.eval()}`;
		},

		Assign(ident: Node, _op: Node, e: Node): string {
			const name = ident.sourceString;
			const name2 = semanticsHelper.getVariable(name);
			const value = e.eval();
			return `${name2} = ${value}`;
		},

		Abs(_absLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.abs(${e.eval()})`;
		},

		Asc(_ascLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).charCodeAt(0)`;
		},

		Atn(_atnLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.atan(${e.eval()})`;
		},

		Bin(_binLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("_bin$");
			const pad = n.child(0)?.eval();
			return pad !== undefined ? `_bin$(${e.eval()}, ${pad})` : `_bin$(${e.eval()})`
		},

		Chr(_chrLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `String.fromCharCode(${e.eval()})`;
		},

		Comment(_commentLit: Node, remain: Node) {
			return `//${remain.sourceString}`;
		},

		Cos(_cosLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.cos(${e.eval()})`;
		},

		Cint(_cintLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.round(${e.eval()})`;
		},

		Cls(_clsLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("_cls");
			return `_cls()`;
		},

		Comparison(_iflit: Node, condExp: Node, _thenLit: Node, thenStat: Node, elseLit: Node, elseStat: Node) {
			const indentStr = semanticsHelper.getIndentStr();
			semanticsHelper.addIndent(2);
			const indentStr2 = semanticsHelper.getIndentStr();

			const cond = condExp.eval();
			const thSt = thenStat.eval();

			let result = `if (${cond}) {\n${indentStr2}${thSt}\n${indentStr}}`; // put in newlines to also allow line comments
			if (elseLit.sourceString) {
				const elseSt = evalChildren(elseStat.children).join('; ');
				result += ` else {\n${indentStr2}${elseSt}\n${indentStr}}`;
			}

			semanticsHelper.addIndent(-2);
			return result;
		},

		Data(_datalit: Node, args: Node) {
			const argList = args.asIteration().children.map(c => c.eval());

			const definedLabels = semanticsHelper.getDefinedLabels();

			if (definedLabels.length) {
				const dataIndex = semanticsHelper.getDataIndex();
				const currentLabel = definedLabels[definedLabels.length - 1];
				currentLabel.dataIndex = dataIndex;
			}

			const dataList = semanticsHelper.getDataList();
			dataList.push(argList.join(", "));
			semanticsHelper.addDataIndex(argList.length);
			return "";
		},

		Def(_defLit: Node, _fnLit: Node, assign: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${assign.eval()}`;
		},

		DefArgs(_open: Node, arrayIdents: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argList = arrayIdents.asIteration().children.map(c => c.eval());

			return `(${argList.join(", ")})`;
		},

		DefAssign(ident: Node, args: Node, _equal: Node, e: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argStr = args.children.map(c => c.eval()).join(", ") || "()";
			const fnIdent = `fn${ident.sourceString}`;
			semanticsHelper.getVariable(fnIdent);

			return `fn${ident.sourceString} = ${argStr} => ${e.eval()}`;
		},

		Dim(_dimLit: Node, arrayIdents: Node) {
			const argList = arrayIdents.asIteration().children.map(c => c.eval());
			const results: string[] = [];

			for (const arg of argList) {
				const [ident, ...indices] = arg;
				let createArrStr: string;
				if (indices.length > 1) { // multi-dimensional?
					const initValStr = ident.endsWith("$") ? ', ""' : '';
					createArrStr = `_dim([${indices}]${initValStr})`; // indices are automatically joined with comma
					semanticsHelper.addInstr("_dim");
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

		FnIdent(fnIdent: Node, args: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${fnIdent.eval()}${args.eval()}`;
		},

		StrFnIdent(fnIdent: Node, args: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${fnIdent.eval()}${args.eval()}`;
		},

		ForLoop(_forLit: Node, variable: Node, _eqSign: Node, start: Node, _dirLit: Node, end: Node, _stepLit: Node, step: Node) {
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
			semanticsHelper.addInstr("_frame");
			return `await _frame()`;
		},

		Gosub(_gosubLit: Node, e: Node) {
			const labelStr = e.sourceString;
			semanticsHelper.addGosubLabel(labelStr);

			return `_${labelStr}()`;
		},

		Hex(_hexLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("_hex$");
			const pad = n.child(0)?.eval();
			return pad !== undefined ? `_hex$(${e.eval()}, ${pad})` : `_hex$(${e.eval()})`
		},

		Input(_inputLit: Node, message: Node, _semi: Node, e: Node) {
			semanticsHelper.addInstr("_input");

			const msgStr = message.sourceString.replace(/\s*[;,]$/, "");
			const ident = e.eval();
			const isNumStr = ident.includes("$") ? "" : ", true";

			return `${ident} = await _input(${msgStr}${isNumStr})`;
		},

		Instr(_instrLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `((${e1.eval()}).indexOf(${e2.eval()}) + 1)`;
		},

		Int(_intLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.floor(${e.eval()})`;
		},

		Left(_leftLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
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

		Lower(_lowerLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).toLowerCase()`;
		},

		Max(_maxLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
			return `Math.max(${argList})`;
		},

		Mid(_midLit: Node, _open: Node, e1: Node, _comma1: Node, e2: Node, _comma2: Node, e3: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const length = e3.child(0)?.eval();
			const lengthStr = length === undefined ? "" : `, ${length}`;
			return `(${e1.eval()}).substr(${e2.eval()} - 1${lengthStr})`;
		},

		Min(_minLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
			return `Math.min(${argList})`;
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

		PrintArgs(arg: Node, _printSep: Node, args: Node) {
			return [arg.eval(), ...evalChildren(args.children)].join(', ');
		},
		Print(_printLit: Node, params: Node, semi: Node) {
			semanticsHelper.addInstr("_print");
			const paramStr = params.child(0)?.eval() || "";

			let newlineStr = "";
			if (!semi.sourceString) {
				newlineStr = paramStr ? `, "\\n"` : `"\\n"`;
			}
			return `_print(${paramStr}${newlineStr})`;
		},

		Read(_readlit: Node, args: Node) {
			semanticsHelper.addInstr("_read");
			const argList = args.asIteration().children.map(c => c.eval());
			const results: string[] = [];
			for (const ident of argList) {
				results.push(`${ident} = _read()`);
			}
			return results.join("; ");
		},

		Rem(_remLit: Node, remain: Node) {
			return `// ${remain.sourceString}`;
		},

		Restore(_restoreLit: Node, e: Node) {
			const labelStr = e.sourceString || "0";
			semanticsHelper.addRestoreLabel(labelStr);

			semanticsHelper.addInstr("_restore");
			return `_restore(${labelStr})`;
		},

		Return(_returnLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "return";
		},

		Right(_rightLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e1.eval()}).slice(-(${e2.eval()}))`;
		},

		Rnd(_rndLit: Node, _open: Node, _e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// args are ignored
			return `Math.random()`;
		},

		Round(_roundLit: Node, _open: Node, e: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const dec = e2.child(0)?.eval();
			if (dec) {
				semanticsHelper.addInstr("_round");
				return `_round(${e.eval()}, ${dec})`;
			}
			return `Math.round(${e.eval()})`; // common round without decimals places
			// A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
		},

		Sgn(_sgnLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.sign(${e.eval()})`;
		},

		Sin(_sinLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.sin(${e.eval()})`;
		},

		Space2(_stringLit: Node, _open: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `" ".repeat(${len.eval()})`;
		},

		Sqr(_sqrLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.sqrt(${e.eval()})`;
		},

		Stop(_stopLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `return "stop"`;
		},

		Str(_strLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const arg = e.eval();

			if (isNaN(Number(arg))) {
				semanticsHelper.addInstr("_str$");
				return `_str$(${arg})`;
			}
			// simplify if we know at compile time that arg is a positive number
			return arg >= 0 ? `(" " + String(${arg}))` : `String(${arg})`;
		},

		String2(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, chr: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// Note: String$: we only support second parameter as string; we do not use charAt(0) to get just one char
			return `(${chr.eval()}).repeat(${len.eval()})`;
		},

		Tan(_tanLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.tan(${e.eval()})`;
		},

		Time(_timeLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("_time");
			return `_time()`;
		},

		Upper(_upperLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).toUpperCase()`;
		},

		Val(_upperLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
			const numStr = String(e.eval());

			if (numPattern.test(numStr)) {
				return `Number(${numStr})`; // for non-hex/bin number strings we can use this simple version
			}
			semanticsHelper.addInstr("_val");
			return `_val(${numStr})`;
		},

		Wend(_wendLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addIndent(-2);
			return '}';
		},

		WhileLoop(_whileLit: Node, e: Node) {
			const cond = e.eval();
			semanticsHelper.nextIndentAdd(2);
			return `while (${cond}) {`;
		},

		StrOrNumExp(e: Node) {
			return String(e.eval());
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
			return `${a.eval()} === ${b.eval()} ? -1 : 0`;
		},
		CmpExp_ne(a: Node, _op: Node, b: Node) {
			return `${a.eval()} !== ${b.eval()} ? -1 : 0`;
		},
		CmpExp_lt(a: Node, _op: Node, b: Node) {
			return `${a.eval()} < ${b.eval()} ? -1 : 0`;
		},
		CmpExp_le(a: Node, _op: Node, b: Node) {
			return `${a.eval()} <= ${b.eval()} ? -1 : 0`;
		},
		CmpExp_gt(a: Node, _op: Node, b: Node) {
			return `${a.eval()} > ${b.eval()} ? -1 : 0`;
		},
		CmpExp_ge(a: Node, _op: Node, b: Node) {
			return `${a.eval()} >= ${b.eval()} ? -1 : 0`;
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
			return `${a.eval()} === ${b.eval()} ? -1 : 0`;
		},
		StrCmpExp_ne(a: Node, _op: Node, b: Node) {
			return `${a.eval()} !== ${b.eval()} ? -1 : 0`;
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
			return [ident.eval(), ...indices.eval()]; //TTT
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

	private static deleteAllItems(items: Record<string, any>) {
		for (const name in items) { // eslint-disable-line guard-for-in
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
			//getInstr: (name: string) => this.getInstr(name),
			getInstrMap: () => this.getInstrMap(),
			getRestoreMap: () => this.getRestoreMap(),
			getVariable: (name: string) => this.getVariable(name),
			getVariables: () => this.getVariables(),
			incrementLineIndex: () => this.incrementLineIndex(),
			nextIndentAdd: (num: number) => this.nextIndentAdd(num),
			setIndent: (indent: number) => this.setIndent(indent)
		};
		return getSemantics(semanticsHelper);
	}
}
