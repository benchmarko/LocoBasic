// parser.ts
// A simple parser for arithmetic expressions using Ohm
//
// Usage:
// node dist/locobasic.js input="?3 + 5 * (2 - 8)"
// node dist/locobasic.js fileName=dist/examples/example.bas
// node dist/locobasic.js example=euler
//
// [ npx ts-node parser.ts input="?3 + 5 * (2 - 8)" ]

import { ActionDict, Grammar, grammar, Node, Semantics } from "ohm-js";
import { arithmetic } from "./arithmetic";

export type ConfigEntryType = string | number | boolean;

export type ConfigType = Record<string, ConfigEntryType>;

const startConfig: ConfigType = {
	debug: 0,
	example: "",
	fileName: "",
	input: ""
};


const examples: Record<string, string> = {};


type VariableValue = string | number | Function | [] | VariableValue[]; // eslint-disable-line @typescript-eslint/ban-types

function dimArray(dims: number[], initVal: string | number = 0) {
	const createRecursiveArray = function (depth: number) {
		const length = dims[depth] + 1, // +1 because of 0-based index
			array: VariableValue[] = new Array(length);

		depth += 1;
		if (depth < dims.length) { // more dimensions?
			for (let i = 0; i < length; i += 1) {
				array[i] = createRecursiveArray(depth); // recursive call
			}
		} else { // one dimension
			array.fill(initVal);
		}
		return array;
	};
	return createRecursiveArray(0);
}

const vm = {
	_output: "",
	_fnOnCls: (() => undefined) as () => void,
	dimArray: dimArray,
	cls: () => {
		vm._output = "";
		vm._fnOnCls();
	},
	print: (...args: string[]) => vm._output += args.join(''),

	getOutput: () => vm._output,
	setOutput: (str: string) => vm._output = str,
	setOnCls: (fn: () => void) => vm._fnOnCls = fn
}

class Parser {
	private readonly ohmGrammar: Grammar;
	private readonly ohmSemantics: Semantics;

	constructor(grammarString: string, semanticsMap: ActionDict<string | string[]>) {
		this.ohmGrammar = grammar(grammarString);
		this.ohmSemantics = this.ohmGrammar
			.createSemantics()
			.addOperation<string | string[]>("eval", semanticsMap);
	}

	// Function to parse and evaluate an expression
	parseAndEval(input: string) {
		try {
			const matchResult = this.ohmGrammar.match(input);
			if (matchResult.succeeded()) {
				return this.ohmSemantics(matchResult).eval();
			} else {
				return 'ERROR: Parsing failed: ' + matchResult.message;
			}
		} catch (error) {
			return 'ERROR: Parsing evaluator failed: ' + (error instanceof Error ? error.message : "unknown");
		}
	}
}

const variables: Record<string, number> = {};

const reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;

function getVariable(name: string) {
	name = name.toLowerCase();
	if (reJsKeyword.test(name)) {
		name = `_${name}`;
	}

	variables[name] = (variables[name] || 0) + 1;
	return name;
}

function deleteAllItems(items: Record<string, any>) {
	for (const name in items) { // eslint-disable-line guard-for-in
		delete items[name];
	}
}

type DefinedLabelEntryType = {
	label: string,
	first: number,
	last: number,
	dataIndex: number
}

type GosubLabelEntryType = {
	count: number
}

const definedLabels: DefinedLabelEntryType[] = [];
const gosubLabels: Record<string, GosubLabelEntryType> = {};
let lineIndex = 0;

const dataList: (string | number)[] = [];
const restoreMap: Record<string, number> = {};

function addDefinedLabel(label: string, line: number) {
	definedLabels.push({
		label,
		first: line,
		last: -1,
		dataIndex: -1
	});
}

function addGosubLabel(label: string) {
	gosubLabels[label] = gosubLabels[label] || {
		count: 0
	};

	gosubLabels[label].count = (gosubLabels[label].count || 0) + 1;
}

function addRestoreLabel(label: string) {
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

function evalChildren(children: Node[]) {
	return children.map(c => c.eval());
}

// Semantics to evaluate an arithmetic expression
const semantics: ActionDict<string | string[]> = {
	Program(lines: Node) {
		const lineList = evalChildren(lines.children);

		const variabeList = Object.keys(variables);
		const varStr = variabeList.length ? "let " + variabeList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";\n" : "";

		// find subroutines
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

		if (dataList.length) {
			lineList.unshift(`const _data = _getData();\nconst _restoreMap = _getRestore();\nlet _dataPrt = 0;`);
			lineList.push(`function _getData() {\nreturn [\n${dataList.join(",\n")}\n];\n}`);
			lineList.push(`function _getRestore() {\nreturn [\n${JSON.stringify(restoreMap)}\n];\n}`);
		}

		const lineStr = lineList.join('\n');
		return varStr + lineStr;
	},

	Line(label: Node, stmts: Node, comment: Node, _eol: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
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

	Statements(stmt: Node, _stmtSep: Node, stmts: Node) {
		return [stmt.eval(), ...evalChildren(stmts.children)].join('; ');
		//TODO: return [stmt.eval(), ...evalChildren(stmts.children)].map((e) => e.endsWith("{") ? e : `${e};`).join(' ');
	},

	ArrayAssign(ident: Node, _op: Node, e: Node): string {
		return `${ident.eval()} = ${e.eval()}`;
	},

	Assign(ident: Node, _op: Node, e: Node): string {
		const name = ident.sourceString;
		const name2 = getVariable(name);
		const value = e.eval();
		return `${name2} = ${value}`;
	},

	PrintArgs(arg: Node, _printSep: Node, args: Node) {
		return [arg.eval(), ...evalChildren(args.children)].join(', ');
	},
	Print(_printLit: Node, params: Node, semi: Node) {
		const paramStr = params.child(0)?.eval() || "";

		let newlineStr = "";
		if (!semi.sourceString) {
			newlineStr = paramStr ? ` + "\\n"` : `"\\n"`;
		}
		return `_o.print(${paramStr}${newlineStr})`;
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
		const pad = n.child(0)?.eval();
		const padStr = pad !== undefined ? `.padStart(${pad} || 0, "0")` : '';
		return `(${e.eval()}).toString(2).toUpperCase()${padStr}`;
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

	Data(_datalit: Node, args: Node) {
		const argList = args.asIteration().children.map(c => c.eval());
		const dataIndex = dataList.length;

		if (definedLabels.length) {
			const currentLabel = definedLabels[definedLabels.length - 1];
			currentLabel.dataIndex = dataIndex;
		}

		dataList.push(argList.join(", "));
		return "";
	},

	Dim(_dimLit: Node, arrayIdents: Node) {
		const argList = arrayIdents.asIteration().children.map(c => c.eval());
		const results: string[] = [];

		for (const arg of argList) {
			const [ident, ...indices] = arg;
			const initValStr = ident.endsWith("$") ? ', ""' : '';
			results.push(`${ident} = _o.dimArray([${indices}]${initValStr})`);  // automatically joined with comma
		}

		return results.join("; ");
	},

	Cint(_cintLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `Math.round(${e.eval()})`;
	},

	Cls(_clsLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `_o.cls()`;
	},

	Comparison(_iflit: Node, condExp: Node, _thenLit: Node, thenStat: Node, elseLit: Node, elseStat: Node) {
		const cond = condExp.eval();
		const thSt = thenStat.eval();

		let result = `if (${cond}) {\n${thSt}\n}`; // put in newlines to also allow line comments
		if (elseLit.sourceString) {
			const elseSt = evalChildren(elseStat.children).join('; ');
			result += ` else {\n${elseSt}\n}`;
		}

		return result;
	},

	End(_endLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `return "end"`;
	},

	Exp(_expLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `Math.exp(${e.eval()})`;
	},

	Fix(_fixLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `Math.trunc(${e.eval()})`;
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

		const result = `for (${varExp} = ${startExp}; ${cmpSt}; ${varExp} += ${stepExp}) {`;

		return result;
	},

	Gosub(_gosubLit: Node, e: Node) {
		const labelStr = e.sourceString;
		addGosubLabel(labelStr);

		return `_${labelStr}()`;
	},

	Hex(_hexLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const pad = n.child(0)?.eval();
		const padStr = pad !== undefined ? `.padStart(${pad} || 0, "0")` : '';
		return `(${e.eval()}).toString(16).toUpperCase()${padStr}`;
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

	Next(_nextLit: Node, variables: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const argList = variables.asIteration().children.map(c => c.eval());
		if (!argList.length) {
			argList.push("_any");
		}
		return '}'.repeat(argList.length);
	},

	On(_nLit: Node, e1: Node, _gosubLit: Node, args: Node) {
		const index = e1.eval();
		const argList = args.asIteration().children.map(c => c.sourceString);

		for (let i = 0; i < argList.length; i += 1) {
			addGosubLabel(argList[i]);
		}

		return `[${argList.map((label) => `_${label}`).join(",")}]?.[${index} - 1]()`; // 1-based index
	},

	Pi(_piLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return "Math.PI";
	},

	Read(_readlit: Node, args: Node) {
		const argList = args.asIteration().children.map(c => c.eval());
		const results: string[] = [];
		for (const ident of argList) {
			results.push(`${ident} = _data[_dataPrt++]`);
		}
		return results.join("; ");
	},

	Rem(_remLit: Node, remain: Node) {
		return `// ${remain.sourceString}`;
	},

	Restore(_restoreLit: Node, e: Node) {
		const labelStr = e.sourceString || "0";
		addRestoreLabel(labelStr);

		return `_dataPtr = _restoreMap[${labelStr}]`;
	},

	Return(_returnLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return "return";
	},

	Right(_rightLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `(${e1.eval()}).slice(-${e2.eval()})`;
	},

	Rnd(_rndLit: Node, _open: Node, _e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		// args are ignored
		return `Math.random()`;
	},

	Round(_roundLit: Node, _open: Node, e: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const dec = e2.child(0)?.eval();
		if (dec) {
			return `(Math.round(${e.eval()} * Math.pow(10, ${dec})) / Math.pow(10, ${dec}))`;
		}
		return `Math.round(${e.eval()})`;
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
		return `String(${e.eval()})`; // TODO: additional space for n>0?
	},

	String2(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, chr: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		// Note: String$: we only support second parameter as string; we do not use charAt(0) to get just one char
		return `(${chr.eval()}).repeat(${len.eval()})`;
	},

	Tan(_tanLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `Math.tan(${e.eval()})`;
	},

	Time(_timeLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `Date.now()`; // TODO; or *300/1000
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
		return `Number((${numStr}).replace("&x", "0b").replace("&", "0x"))`;
	},

	Wend(_wendLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return '}';
	},

	WhileLoop(_whileLit: Node, e: Node) {
		const cond = e.eval();
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
		return `(${a.eval()} / ${b.eval()}) | 0`;
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
		return String(e.eval());
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

	string(_quote1: Node, e: Node, _quote2: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `"${e.sourceString}"`;
	},

	ident(ident: Node) {
		const name = ident.sourceString;
		return getVariable(name);
	},

	strIdent(ident: Node, typeSuffix: Node) {
		const name = ident.sourceString + typeSuffix.sourceString;
		return getVariable(name);
	}
};


const arithmeticParser = new Parser(arithmetic.grammar, semantics);

function compileScript(script: string) {
	resetParser();

	const compiledScript = arithmeticParser.parseAndEval(script);
	return compiledScript;
}

async function executeScript(compiledScript: string) {
	vm.setOutput("");

	if (compiledScript.startsWith("ERROR")) {
		return "ERROR" + "\n";
	}

	let output: string;
	try {
		const fnScript = new Function("_o", compiledScript); // eslint-disable-line no-new-func
		const result = fnScript(vm) || "";
		if (result instanceof Promise) {
			output = vm.getOutput() + await result;
		} else {
			output = vm.getOutput() + result;
		}

	} catch (error) {
		output = "ERROR: ";
		if (error instanceof Error) {
			output += error.message;

			const anyErr = error as any;
			const lineNumber = anyErr.lineNumber; // only on FireFox
			const columnNumber = anyErr.columnNumber; // only on FireFox

			if (lineNumber || columnNumber) {
				const errLine = lineNumber - 2; // for some reason line 0 is 2
				output += ` (line ${errLine}, column ${columnNumber})`;
			}
		} else {
			output += "unknown";
		}
	}
	return output + "\n";
}


function debounce<T extends Function>(func: T, delay: number): (...args: any[]) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		const context = this;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func.apply(context, args);
		}, delay);
	};
}

function keepRunning(fn: Function, timeout: number) {
	const timerId = setTimeout(() => { }, timeout);
	return (async () => {
		fn();
		clearTimeout(timerId);
	})();
}

function asyncDelay(fn: Function, timeout: number) {
	return (async () => {
		const timerId = setTimeout(fn, timeout);
		return timerId;
	})();
}


let basicCm: any;
let compiledCm: any;

function getOutputText() {
	const outputText = document.getElementById("outputText") as HTMLTextAreaElement;
	return outputText.value;
}

function setOutputText(value: string) {
	const outputText = document.getElementById("outputText") as HTMLTextAreaElement;
	outputText.value = value;
}

async function onExecuteButtonClick(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
	const compiledText = document.getElementById("compiledText") as HTMLTextAreaElement;

	const compiledScript = compiledCm ? compiledCm.getValue() : compiledText.value;

	const output = await executeScript(compiledScript);

	setOutputText(getOutputText() + output);
}

function oncompiledTextChange(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
	const autoExecuteInput = document.getElementById("autoExecuteInput") as HTMLInputElement;
	if (autoExecuteInput.checked) {
		const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
		executeButton.dispatchEvent(new Event('click'));
	}
}

function onCompileButtonClick(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
	const basicText = document.getElementById("basicText") as HTMLTextAreaElement;
	const compiledText = document.getElementById("compiledText") as HTMLTextAreaElement;
	const input = compiledCm ? basicCm.getValue() : basicText.value;
	const compiledScript = compileScript(input);

	if (compiledCm) {
		compiledCm.setValue(compiledScript);
	} else {
		compiledText.value = compiledScript;
		const autoExecuteInput = document.getElementById("autoExecuteInput") as HTMLInputElement;
		if (autoExecuteInput.checked) {
			const newEvent = new Event('change');
			compiledText.dispatchEvent(newEvent);
		}
	}
}

function onbasicTextChange(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
	const autoCompileInput = document.getElementById("autoCompileInput") as HTMLInputElement;
	if (autoCompileInput.checked) {
		const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
		compileButton.dispatchEvent(new Event('click'));
	}
}

function onExampleSelectChange(event: Event) {
	const exampleSelect = event.target as HTMLSelectElement;

	const basicText = document.getElementById("basicText") as HTMLTextAreaElement;
	const value = examples[exampleSelect.value];

	setOutputText("");

	if (basicCm) {
		basicCm.setValue(value);
	} else {
		basicText.value = value;
		basicText.dispatchEvent(new Event('change'));
	}
}


function setExampleSelectOptions(examples: Record<string, string>) {
	const exampleSelect = document.getElementById("exampleSelect") as HTMLSelectElement;

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


function fnHereDoc(fn: () => void) {
	return String(fn).
		replace(/^[^/]+\/\*\S*/, "").
		replace(/\*\/[^/]+$/, "");
}

function addItem(key: string, input: string | (() => void)) {
	let inputString = (typeof input !== "string") ? fnHereDoc(input) : input;
	inputString = inputString.replace(/^\n/, "").replace(/\n$/, ""); // remove preceding and trailing newlines
	// beware of data files ending with newlines! (do not use trimEnd)

	if (!key) { // maybe ""
		const matches = inputString.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
		key = matches ? matches[1] : "unknown";
	}

	examples[key] = inputString;
}



interface NodeFs {
	//readFile: (name: string, encoding: string, fn: (res: any) => void) => any
	promises: any;
}

let fs: NodeFs;
let modulePath: string;

declare function require(name: string): any;

async function nodeReadFile(name: string): Promise<string> {
	if (!fs) {
		fs = require("fs");
	}

	if (!module) {
		module = require("module");
		modulePath = (module as any).path || "";

		if (!modulePath) {
			console.warn("nodeReadFile: Cannot determine module path");
		}
	}
	return fs.promises.readFile(name, "utf8");
}

function fnParseArgs(args: string[], config: ConfigType) {
	for (let i = 0; i < args.length; i += 1) {
		const [name, ...valueParts] = args[i].split("="),
			nameType = typeof config[name];

		let value: ConfigEntryType = valueParts.join("=");
		if (value !== undefined) {
			if (nameType === "boolean") {
				value = (value === "true");
			} else if (nameType === "number") {
				value = Number(value);
			}
			config[name] = value;
		}
	}
	return config;
}

function fnDecodeUri(s: string) {
	let decoded = "";

	try {
		decoded = decodeURIComponent(s.replace(/\+/g, " "));
	} catch (err) {
		if (err instanceof Error) {
			err.message += ": " + s;
		}
		console.error(err);
	}
	return decoded;
}

// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function fnParseUri(urlQuery: string, config: ConfigType) {
	const rSearch = /([^&=]+)=?([^&]*)/g,
		args: string[] = [];

	let match: RegExpExecArray | null;

	while ((match = rSearch.exec(urlQuery)) !== null) {
		const name = fnDecodeUri(match[1]),
			value = fnDecodeUri(match[2]);

		if (value !== null && config[name] !== undefined) {
			args.push(name + "=" + value);
		}
	}
	return fnParseArgs(args, config);
}

function start(input: string) {
	if (input !== "") {
		const compiledScript = compileScript(input);

		console.log("INFO: Compiled:\n" + compiledScript + "\n");

		return keepRunning(async () => {
			const output = await executeScript(compiledScript);
			console.log(output);
		}, 5000);
	} else {
		console.log("No input");
	}
}

function main(config: ConfigType) {
	let input = (config.input as string) || "";

	if (config.fileName) {
		return keepRunning(async () => {
			input = await nodeReadFile(config.fileName as string);
			start(input);
		}, 5000);
	} else {
		if (config.example) {
			if (!Object.keys(examples).length) {
				return keepRunning(async () => {
					const jsFile = await nodeReadFile("./dist/examples/examples.js");
					// ?? require('./examples/examples.js');
					const fnScript = new Function("cpcBasic", jsFile);
					fnScript({
						addItem: addItem
					});

					input = examples[config.example as string];
					start(input);
				}, 5000);
			}
			input += examples[config.example as string];
		}
		console.log("start");
		start(input);
	}
}

if (typeof window !== "undefined") {
	(window as any).cpcBasic = {
		addItem: addItem
	};
	window.onload = () => {
		const basicText = window.document.getElementById("basicText") as HTMLTextAreaElement;
		basicText.addEventListener('change', onbasicTextChange);

		const compiledText = window.document.getElementById("compiledText") as HTMLTextAreaElement;
		compiledText.addEventListener('change', oncompiledTextChange);

		const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
		compileButton.addEventListener('click', onCompileButtonClick, false);

		const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
		executeButton.addEventListener('click', onExecuteButtonClick, false);

		const exampleSelect = document.getElementById("exampleSelect") as HTMLSelectElement;
		exampleSelect.addEventListener('change', onExampleSelectChange);


		const WinCodeMirror = (window as any).CodeMirror;
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
				const exampleSelect = document.getElementById("exampleSelect") as HTMLSelectElement;
				exampleSelect.value = config.example as string;
			}
			//const input = examples[config.example as string];
			exampleSelect.dispatchEvent(new Event('change'));
		}, 10);
	};
} else {
	main(fnParseArgs(global.process.argv.slice(2), startConfig));
}

export const testParser = {
	dimArray: dimArray
};
