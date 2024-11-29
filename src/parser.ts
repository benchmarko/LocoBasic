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
import { examples } from "./examples";

// https://ohmjs.org/editor/
// https://ohmjs.org/docs/releases/ohm-js-16.0#default-semantic-actions

// https://stackoverflow.com/questions/69762570/rollup-umd-output-format-doesnt-work-however-es-does
// ?

// https://github.com/beautifier/js-beautify
// https://jsonformatter.org/javascript-pretty-print
// ?

export type ConfigEntryType = string | number | boolean;

export type ConfigType = Record<string, ConfigEntryType>;

const startConfig: ConfigType = {
	debug: 0,
	example: "",
	fileName: "",
	input: ""
};


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
	print: (...args: string[]) => vm._output += args.join(''),

	dimArray: dimArray,
	getOutput: () => vm._output,
	setOutput: (str: string) => vm._output = str
}

class Parser {
	private readonly ohmGrammar: Grammar;
	private readonly ohmSemantics: Semantics;

	constructor(grammarString: string, semanticsMap: ActionDict<string|string[]>) {
		this.ohmGrammar = grammar(grammarString);
		this.ohmSemantics = this.ohmGrammar
			.createSemantics()
			.addOperation<string|string[]>("eval", semanticsMap);
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

function getVariable(name: string) {
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
	last: number
}

type UsedLabelEntryType = {
	count: number
}

const definedLabels: DefinedLabelEntryType[] = [];
const usedLabels: Record<string, UsedLabelEntryType> = {};

let lineIndex = 0;

function addDefinedLabel(label: string, line: number) {
	definedLabels.push({
		label,
		first: line,
		last: -1
	});
}

function addUsedLabel(label: string) {
	usedLabels[label] = usedLabels[label] || {
		count: 0
	};

	usedLabels[label].count = (usedLabels[label].count || 0) + 1;
}

function resetParser() {
	deleteAllItems(variables);
	definedLabels.length = 0;
	deleteAllItems(usedLabels);
	lineIndex = 0;
}

function evalChildren(children: Node[]) {
	return children.map(c => c.eval());
}

// Semantics to evaluate an arithmetic expression
const semantics: ActionDict<string|string[]> = {
	Program(lines: Node) {
		const lineList = evalChildren(lines.children);

		const variabeList = Object.keys(variables);
		const varStr = variabeList.length ? "let " + variabeList.map((v) => v.endsWith("$") ? `${v} = ""`: `${v} = 0`).join(", ") + ";\n" : "";

		// find subroutines
		let subFirst: DefinedLabelEntryType | undefined;
		for (let index = 0; index < definedLabels.length; index += 1) {
			const item = definedLabels[index];
			if (usedLabels[item.label]) {
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
		const semi = lineStr.endsWith("{") || lineStr.startsWith("//") || commentStr ? "" : ";";
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
		const newline = semi.sourceString ? "" : ` + "\\n"`;
		return `_o.print(${params.eval()}${newline})`;
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
		return `(${e.eval()}).toString(2).padStart(${pad} || 0, "0")`;
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

	Dim(_dimLit: Node, arrayIdent: Node) {
		const [ident, ...indices] = arrayIdent.eval();
		const initValStr = ident.endsWith("$") ? ', ""' : '';
		return `${ident} = _o.dimArray([${indices}]${initValStr})`; // automatically joined with comma
	},

    Comparison(_iflit: Node, condExp: Node, _thenLit: Node, thenStat: Node, elseLit: Node, elseStat: Node) {
        const cond = condExp.eval();
        const thSt = thenStat.eval();

		let result = `if (${cond}) { ${thSt} }`;
		if (elseLit.sourceString) {
			const elseSt = evalChildren(elseStat.children).join('; ');
			result += ` else { ${elseSt} }`;
		}

		return result;
	},

	End(_endLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return `return "end"`;
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
		addUsedLabel(labelStr);

		return `_${labelStr}()`;
	},

	Hex(_hexLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const pad = n.child(0)?.eval();
		return `(${e.eval()}).toString(16).toUpperCase().padStart(${pad} || 0, "0")`;
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
		const length = e3.child(0)?.eval() || "0";
		return `(${e1.eval()}).substr(${e2.eval()} - 1, ${length})`;
	},

	Min(_minLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
		return `Math.min(${argList})`;
	},

	Next(_nextLit: Node, _variable: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return '}';
	},

	On(_nLit: Node, e1: Node, _gosubLit: Node, args: Node) {
		const index = e1.eval();
		const argList = args.asIteration().children.map(c => c.sourceString);

		for (let i = 0; i < argList.length; i += 1) {
			addUsedLabel(argList[i]);
		}

		return `[${argList.map((label) => `_${label}`).join(",")}]?.[${index} - 1]()`; // 1-based index
	},

	Pi(_piLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return "Math.PI";
	},

	Rem(_remLit: Node, remain: Node) {
		return `// ${remain.sourceString}`;
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

	Exp(e: Node) {
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
	},

	identName(first: Node, remain: Node /*, typeSuffix: Node */) {
		//const name = [first.sourceString, remain.sourceString, typeSuffix.sourceString].join("").toLowerCase();
		const name = [first.sourceString, remain.sourceString].join("").toLowerCase();

		return name; //return getVariable(name);
	},
	variable(e: Node) {
        const name = e.sourceString.toLowerCase();
		return getVariable(name);
	}
};


const arithmeticParser = new Parser(arithmetic.grammar, semantics);

function compileScript(script: string) {
	resetParser();

	const compiledScript = arithmeticParser.parseAndEval(script);
	return compiledScript;
}

function executeScript(compiledScript: string) {
	vm.setOutput("");

	if (compiledScript.startsWith("ERROR")) {
		return "ERROR";
	}

	let output: string;
	try {
		const fnScript = new Function("_o", compiledScript); // eslint-disable-line no-new-func
		const result = fnScript(vm) || "";
		output = vm.getOutput() + result;

	} catch (error) {
		output = "ERROR: " + ((error instanceof Error) ? error.message : "unknown");
	}
	return output;
}

let basicCm: any;
let compiledCm: any;

function onExecuteButtonClick(_event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
	const compiledText = document.getElementById("compiledText") as HTMLTextAreaElement;
	const outputText = document.getElementById("outputText") as HTMLTextAreaElement;

	const compiledScript = compiledCm ? compiledCm.getValue() : compiledText.value;
	/*
	if (compiledCm) {
		compiledCm.save();
	}
	const compiledScript = compiledText.value;
	*/
	const output = executeScript(compiledScript);
	outputText.value = output;
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
	//const input = basicText.value;
	const input = compiledCm ? basicCm.getValue() : basicText.value;
	const compiledScript = compileScript(input);

	if (compiledCm) {
		compiledCm.setValue(compiledScript);
	} else {
		compiledText.value = compiledScript;
	}

	const autoExecuteInput = document.getElementById("autoExecuteInput") as HTMLInputElement;
	if (autoExecuteInput.checked) {
		const newEvent = new Event('change');
		compiledText.dispatchEvent(newEvent);
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
	//const exampleSelect = document.getElementById("exampleSelect") as HTMLSelectElement;
	const exampleSelect = event.target as HTMLSelectElement;

	const basicText = document.getElementById("basicText") as HTMLTextAreaElement;
	const value = examples[exampleSelect.value];

	if (basicCm) {
		basicCm.setValue(value);
	} else {
		basicText.value = value;
	}

	basicText.dispatchEvent(new Event('change'));
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
	} catch	(err) {
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

		if (value !== null && config[name]) {
			args.push(name + "=" + value);
		}
	}
	return fnParseArgs(args, config);
}


function start(input: string) {
	if (input !== "") {
		const compiledScript = compileScript(input);

		console.log("INFO: Compiled:\n", compiledScript + "\n");

		const output = executeScript(compiledScript);

		console.log(output);
	} else {
		console.log("No input");
	}
}

function main(config: ConfigType) {
	let input = (config.input as string) || "";

	if (config.fileName) {
		const timer = setTimeout(() => {}, 5000);
		(async () => {
			input += await nodeReadFile(config.fileName as string);
			clearTimeout(timer);
			start(input);
		})();
	} else {
		if (config.example) {
			input += examples[config.example as string];
		}
		start(input);
	}
}

if (typeof window !== "undefined") {
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

		setExampleSelectOptions(examples);
		exampleSelect.dispatchEvent(new Event('change'));

		const WinCodeMirror = (window as any).CodeMirror;
		if (WinCodeMirror) {
			basicCm = WinCodeMirror.fromTextArea(basicText, {
				lineNumbers: true,
				mode: 'javascript'
			});
			basicCm.on('changes', onbasicTextChange);

			compiledCm = WinCodeMirror.fromTextArea(compiledText, {
				lineNumbers: true,
				mode: 'javascript'
			});
			compiledCm.on('changes', oncompiledTextChange);
		}

		main(fnParseUri(window.location.search.substring(1), startConfig));
	};
} else {
	main(fnParseArgs(global.process.argv.slice(2), startConfig));
}

export const testParser = {
	dimArray: dimArray
};

/*
5 ' examples:
10 ' associativity
15 ? "7 =" 12 xor 5+6 "=" 12 xor (5+6), (12 xor 5)+6
20 ? "3 =" 7 mod 5+1 "=" (7 mod 5)+1, 7 mod (5+1)
30 ? "0 =" 10>5>4 "=" (10>5)>4, 10>(5>4)
40 ? not 1234555
50 ? 12 \ 5

--
Notes:
- L...Basic is mainly used for calculations. It runs in a Browser or on the command line with node.js
- Control structures like IF...ELSE, and FOR and WHILE loops are directly converted to JaveScript
- GOTO or ON GOTO are not suppoered. Use GOSUB, ON GOSUB instead. The GOSUB line is interpreted as subroutine start.
- Subroutine style: Line from GOSUB <line> starts a subroutine which is ended be a single RETURN in a line. Do not nest subroutines.
- Variable types: No type checking: "$" to mark a string variable is optional; "!", "%" are not supported
- No automatic rounding to integer for integer parameters
- Computations are done with JavaScript precision; arity and precedence of operators follows Locomotive BASIC
- Endless loops are not trapped, ypou may need to restart the browser window.
- PRINT: output in the output window. Args can be separated by ";" or "," which behave the same. (No TAB(), SPC(), USING)
- STOP, END: stop only on top level, not in subroutines (where they just return)
- STRING$(): second parameter must be a character
- TIME: *300/1000? (TODO)

*/
