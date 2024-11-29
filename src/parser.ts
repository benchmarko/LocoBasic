// parser.ts
// A simple parser for arithmetic expressions using Ohm
//
// Usage:
// node dist/locobasic.js input="?3 + 5 * (2 - 8)"
// node dist/locobasic.js fileName=dist/example.bas
//
// [ npx ts-node parser.ts input="?3 + 5 * (2 - 8)" ]

import { Grammar, grammar, Node, Semantics } from "ohm-js";
import { arithmetic } from "./arithmetic";

// https://ohmjs.org/editor/
// https://ohmjs.org/docs/releases/ohm-js-16.0#default-semantic-actions

// https://stackoverflow.com/questions/69762570/rollup-umd-output-format-doesnt-work-however-es-does
// ?

// https://github.com/beautifier/js-beautify
// https://jsonformatter.org/javascript-pretty-print
// ?

// not implemented: mode

export type ConfigEntryType = string | number | boolean;

export type ConfigType = Record<string, ConfigEntryType>;

const startConfig: ConfigType = {
	debug: 0,
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

	constructor(grammarString: string, semanticsMap: Record<string, any>) {
		this.ohmGrammar = grammar(grammarString);
		this.ohmSemantics = this.ohmGrammar
			.createSemantics()
			.addOperation<number>("eval", semanticsMap);
	}

	// Function to parse and evaluate an expression
	parseAndEval(input: string) {
		try {
			const matchResult = this.ohmGrammar.match(input);
			if (matchResult.succeeded()) {
				return this.ohmSemantics(matchResult).eval();
			} else {
			//throw new Error("Parsing failed: " + matchResult.message);
			  	return 'ERROR: Parsing failed: ' + matchResult.message; // or .shortMessage
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


type SubRoutineType = {
	first: number
	last: number
}

const subRoutines: Record<string, SubRoutineType> = {};

let lineIndex = 0;

function resetParser() {
	deleteAllItems(variables);
	deleteAllItems(subRoutines);
	lineIndex = 0;
}

function evalChildren(children: Node[]) {
	return children.map(c => c.eval());
}

// Semantics to evaluate an arithmetic expression
const semantics = {
	Program(lines: Node) {
		const lineList = evalChildren(lines.children);

		const variabeList = Object.keys(variables);
		const varStr = variabeList.length ? "let " + variabeList.join(", ") + ";\n" : "";

		const subKeys = Object.keys(subRoutines);
		for (const key of subKeys) {
			const sub = subRoutines[key];

			const indent = lineList[sub.first].search(/\S|$/);
			const indentStr = " ".repeat(indent);
			for (let i = sub.first; i <= sub.last; i += 1) {
				lineList[i] = "  " + lineList[i]; // ident
			}

			lineList[sub.first] = `${indentStr}const ${key} = () => {${indentStr}\n` + lineList[sub.first];
			lineList[sub.last] += `\n${indentStr}` + "};" //TS issue when using the following? `\n${indentStr}};`
		}

		const lineStr = lineList.join('\n');

		return varStr + lineStr;
	},

	Line(label: Node, stmts: Node, comment: Node, _eol: Node) {
		const labelStr = label.sourceString;
		const commentStr = comment.sourceString ? `; //${comment.sourceString.substring(1)}` : "";

		if (labelStr) {
			const item = subRoutines[labelStr];
			if (item) {
				item.last = lineIndex;
			} else {
				subRoutines[labelStr] = {
					first: lineIndex,
					last: -1
				}
			}
		}

		lineIndex += 1;
		return stmts.eval() + ";" + commentStr;
	},

	Statements(stmt: Node, _stmtSep: Node, stmts: Node) {
		return [stmt.eval(), ...evalChildren(stmts.children)].join('; ');
	},

	ArrayAssign(ident: Node, _op: Node, e: Node): string { // TODO
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
		return `o.print(${params.eval()}${newline})`;
	},

	Abs(_absLit: Node, _open: Node, e: Node, _close: Node) {
		return `Math.abs(${e.eval()})`;
	},

	Asc(_ascLit: Node, _open: Node, e: Node, _close: Node) {
		return `(${e.eval()}).charCodeAt(0)`;
	},

	Atn(_atnLit: Node, _open: Node, e: Node, _close: Node) {
		return `Math.atan(${e.eval()})`;
	},

	Bin(_binLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) {
		const pad = n.child(0)?.eval();
		return `(${e.eval()}).toString(2).padStart(${pad} || 0, "0")`;
	},
	
	Chr(_chrLit: Node, _open: Node, e: Node, _close: Node) {
		return `String.fromCharCode(${e.eval()})`;
	},

	Cos(_cosLit: Node, _open: Node, e: Node, _close: Node) {
		return `Math.cos(${e.eval()})`;
	},

	Dim(_dimLit: Node, arrayIdent: Node) {
		const arrIdent = arrayIdent.eval(); // we need eval to process expressions (replace ( => [ and ) => ])

		const index1 = String(arrIdent).indexOf("[");
		const ident = arrIdent.substring(0, index1);
		const dimStr = arrIdent.substring(index1 + 1, arrIdent.length - 1);

		const result = `${ident} = o.dimArray([${dimStr}])`;

		return result;
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

	Fix(_fixLit: Node, _open: Node, e: Node, _close: Node) {
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
		return `${e.sourceString}()`;
	},

	Hex(_hexLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) {
		const pad = n.child(0)?.eval();
		return `(${e.eval()}).toString(16).toUpperCase().padStart(${pad} || 0, "0")`;
	},

	Int(_intLit: Node, _open: Node, e: Node, _close: Node) {
		return `Math.floor(${e.eval()})`;
	},

	Left(_leftLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) {
		return `(${e1.eval()}).slice(0, ${e2.eval()})`;
	},

	Len(_lenLit: Node, _open: Node, e: Node, _close: Node) {
		return `(${e.eval()}).length`;
	},

	Log(_logLit: Node, _open: Node, e: Node, _close: Node) {
		return `Math.log(${e.eval()})`;
	},

	Log10(_log10Lit: Node, _open: Node, e: Node, _close: Node) {
		return `Math.log10(${e.eval()})`;
	},

	Lower(_lowerLit: Node, _open: Node, e: Node, _close: Node) {
		return `(${e.eval()}).toLowerCase()`;
	},

	Max(_maxLit: Node, _open: Node, args: Node, _close: Node) {
		const argList = args.asIteration().children.map(c => c.eval()); // see also ArrayArgs
		return `Math.max(${argList})`;
	},

	Mid(_midLit: Node, _open: Node, e1: Node, _comma1: Node, e2: Node, _comma2: Node, e3: Node, _close: Node) {
		const length = e3.child(0)?.eval() || "0";
		return `(${e1.eval()}).substr(${e2.eval()} - 1, ${length})`;
	},

	Min(_minLit: Node, _open: Node, args: Node, _close: Node) {
		const argList = args.asIteration().children.map(c => c.eval()); // see also ArrayArgs
		return `Math.min(${argList})`;
	},

	Next(_nextLit: Node, _variable: Node) {
		return '}';
	},

	On(_nLit: Node, e1: Node, _gosubLit: Node, args: Node) {
		const index = e1.eval();
		const argList = args.asIteration().children.map(c => c.sourceString); 
		return `[${argList.join(",")}][${index} - 1]()`; // 1-based index
	},

	Pi(_piLit: Node) {
		return "Math.PI";
	},

	Rem(_remLit: Node /*, comment: Node */) { //TTT
		return ''; //return `//${comment.sourceString.substring(1)}`;
	},

	Return(_returnLit: Node) {
		return "return";
	},

	Right(_rightLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) {
		return `(${e1.eval()}).slice(-${e2.eval()})`;
	},

	Rnd(_rndLit: Node, _open: Node, _e: Node, _close: Node) {
		// currently no args
		return `Math.random()`;
	},

	Sin(_sinLit: Node, _open: Node, e: Node, _close: Node) {
		return `Math.sin(${e.eval()})`;
	},

	Space2(_stringLit: Node, _open: Node, len: Node, _close: Node) {
		return `" ".repeat(${len.eval()})`;
	},

	Sqr(_sqrLit: Node, _open: Node, e: Node, _close: Node) {
		return `Math.sqrt(${e.eval()})`;
	},

	Str(_strLit: Node, _open: Node, e: Node, _close: Node) {
		return `String(${e.eval()})`; // TODO: additional space for n>0?
	},

	String2(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, chr: Node, _close: Node) {
		// we just support the version second parameter as string; we do not use charAt(0) get just one char
		return `(${chr.eval()}).repeat(${len.eval()})`;
	},

	Tan(_tanLit: Node, _open: Node, e: Node, _close: Node) {
		return `Math.tan(${e.eval()})`;
	},

	Time(_timeLit: Node) {
		return `Date.now()`; // TODO; or *300/1000
	},

	Upper(_upperLit: Node, _open: Node, e: Node, _close: Node) {
		return `(${e.eval()}).toUpperCase()`;
	},

	Val(_upperLit: Node, _open: Node, e: Node, _close: Node) {
		const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
		const numStr = String(e.eval());

		if (numPattern.test(numStr)) {
			return `Number(${numStr})`; // for non-hex/bin number strings we can use this simple version
		} 
		return `Number((${numStr}).replace("&x", "0b").replace("&", "0x"))`;
	},

	Wend(_wendLit: Node) {
		return '}';
	},

	WhileLoop(_whileLit: Node, e: Node) {
		const cond = e.eval();
		return `while (${cond}) {`;
	},

	Exp(e: Node): number {
		return e.eval();
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

	PriExp_paren(_open: Node, e: Node, _close: Node) {
		return `(${e.eval()})`;
	},
	PriExp_pos(_op: Node, e: Node) {
		return e.eval();
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

	StrPriExp_paren(_open: Node, e: Node, _close: Node) {
		return `(${e.eval()})`;
	},

	ArrayArgs(args: Node) {
		return args.asIteration().children.map(c => c.eval());
	},

	ArrayIdent(ident: Node, _open: Node, e: Node, _close: Node) {
		return `${ident.eval()}[${e.eval()}]`;
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

	string(_quote1: Node, e: Node, _quote2: Node) {
		return `"${e.sourceString}"`;
	},

	identName(first: Node, remain: Node, typeSuffix: Node) {
		const name = [first.sourceString, remain.sourceString, typeSuffix.sourceString].join("");

		return getVariable(name);
	},
	variable(e: Node) {
        const name = e.sourceString;
		return getVariable(name);
	},
	emptyLine(comment: Node, _eol: Node) {
		lineIndex += 1;
		return `//${comment.sourceString.substring(1)}`;
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
		const fnScript = new Function("o", compiledScript); // eslint-disable-line no-new-func
		const result = fnScript(vm) || "";
		output = vm.getOutput() + result;

	} catch (error) {
		output = "ERROR: " + ((error instanceof Error) ? error.message : "unknown"); 
	}
	return output;
}


function onCompiledAreaChange(event: Event) {
	const compiledArea = event.target as HTMLTextAreaElement;
	const outputArea = document.getElementById("outputArea") as HTMLTextAreaElement;

	const compiledScript = compiledArea.value;

	const output = executeScript(compiledScript);

	outputArea.value = output;
}

function onScriptAreaChange(event: Event) {
	const scriptArea = event.target as HTMLTextAreaElement;
	const compiledArea = document.getElementById("compiledArea") as HTMLTextAreaElement;

	const input = scriptArea.value;

	const compiledScript = compileScript(input);
	compiledArea.value = compiledScript;

	const newEvent = new Event('change');
	compiledArea.dispatchEvent(newEvent);
}

interface NodeFs {
	//readFile: (name: string, encoding: string, fn: (res: any) => void) => any
	promises: any;
}

let fs: NodeFs;
let modulePath: string;

declare function require(name:string): any;

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
		start(input);
	}
}

if (typeof window !== "undefined") {
	window.onload = () => {
		const scriptArea = window.document.getElementById("scriptArea");
		if (scriptArea) {
			scriptArea.addEventListener('change', onScriptAreaChange);
		}

		const compiledArea = window.document.getElementById("compiledArea");
		if (compiledArea) {
			compiledArea.addEventListener('change', onCompiledAreaChange);
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
*/
