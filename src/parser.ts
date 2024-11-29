// parser.ts
// A simple parser for arithmetic expressions using Ohm
//
// Usage:
// node dist/locobasic.js "3 + 5 * (2 - 8)"
//
// [ npx ts-node parser.ts "3 + 5 * (2 - 8)" ]

import { Grammar, grammar, Node, Semantics } from "ohm-js";
import { arithmetic } from "./arithmetic";


// https://ohmjs.org/editor/
// https://ohmjs.org/docs/releases/ohm-js-16.0#default-semantic-actions


export type ConfigEntryType = string | number | boolean;

export type ConfigType = Record<string, ConfigEntryType>;

const startConfig: ConfigType = {
	debug: 0,
	input: ""
};


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
	parseAndEval(input: string): string {
		const matchResult = this.ohmGrammar.match(input);
		if (matchResult.succeeded()) {
			return this.ohmSemantics(matchResult).eval();
		} else {
			//throw new Error("Parsing failed");
			return 'Parsing failed: ' + matchResult.message; // or .shortMessage
		}
	}
}

const variables: Record<string, number> = {};

function evalChildren(children: Node[]) {
	return children.map(c => c.eval());
}

// Semantics to evaluate an arithmetic expression
const semantics = {
	Program(lines: Node) {
		const lineList = evalChildren(lines.children);

		return lineList.join('');
	},

	Line(stmts: Node, _comment: Node, _eol: Node): string {
		return stmts.eval();
	},

	Statements(stmt: Node, _stmtSep: Node, stmts: Node): string {
		return stmt.eval() + evalChildren(stmts.children).join('');
	},

	Assign(ident: Node, _op: Node, e: Node): string {
		const id = ident.sourceString;
		const value = e.eval();
		variables[id] = value;
		return '';
	},

	PrintArgs(arg: Node, _printSep: Node, args: Node) {
		return String(arg.eval()) + evalChildren(args.children).join('');
	},
	Print(_printLit: Node, params: Node, semi: Node): string {
		return String(params.eval()) + (semi.sourceString ? "" : "\\n");
	},

    Comparison(_iflit: Node, condExp: Node, _thenLit: Node, thenStat: Node, elseLit: Node, elseStat: Node) {
        const cond = condExp.eval();
        const thSt = thenStat.eval();

		let result = '';
		if (cond !== 0) {
			result = thSt;
		} else if (elseLit.sourceString) {
			result = evalChildren(elseStat.children).join('');
		}
		return result;
	},

	ForLoop(_forLit: Node, variable: Node, _eqSign: Node, start: Node, _dirLit: Node, end: Node, _stepLit: Node, step: Node) {
        const varExp = variable.eval();
        const startExp = start.eval();
        const endExp = end.eval();
        const stepExp = step.child(0)?.eval() || 1;

		console.debug("for:", varExp, startExp, endExp, stepExp);

		variables[varExp] = startExp;

		if (stepExp >= 0) {
			for (let i = startExp; i <= endExp; i += stepExp) {
				//TODO
			}
		} else {
			for (let i = startExp; i >= endExp; i += stepExp) {
				//TODO
			}
		}
		return '';
	},

	Next(_nextLit: Node, variable: Node) {
        const varExp = variable.eval();
		console.debug("next: " + varExp);
		return '';
	},

	Exp(e: Node): number {
		return e.eval();
	},

	XorExp_xor(a: Node, _op: Node, b: Node): number {
		return a.eval() ^ b.eval();
	},

	OrExp_or(a: Node, _op: Node, b: Node): number {
		return a.eval() | b.eval();
	},

	AndExp_and(a: Node, _op: Node, b: Node): number {
		return a.eval() & b.eval();
	},

	NotExp_not(_op: Node, e: Node): number {
		return ~e.eval();
	},

	CmpExp_eq(a: Node, _op: Node, b: Node): number {
		return a.eval() === b.eval() ? -1 : 0;
	},
	CmpExp_ne(a: Node, _op: Node, b: Node): number {
		return a.eval() !== b.eval() ? -1 : 0;
	},
	CmpExp_lt(a: Node, _op: Node, b: Node): number {
		return a.eval() < b.eval() ? -1 : 0;
	},
	CmpExp_le(a: Node, _op: Node, b: Node): number {
		return a.eval() <= b.eval() ? -1 : 0;
	},
	CmpExp_gt(a: Node, _op: Node, b: Node): number {
		return a.eval() > b.eval() ? -1 : 0;
	},
	CmpExp_ge(a: Node, _op: Node, b: Node): number {
		return a.eval() >= b.eval() ? -1 : 0;
	},

	AddExp_plus(a: Node, _op: Node, b: Node): number {
		return a.eval() + b.eval();
	},
	AddExp_minus(a: Node, _op: Node, b: Node): number {
		return a.eval() - b.eval();
	},

	ModExp_mod(a: Node, _op: Node, b: Node): number {
		return a.eval() % b.eval();
	},

	DivExp_div(a: Node, _op: Node, b: Node): number {
		return (a.eval() / b.eval()) | 0;
	},

	MulExp_times(a: Node, _op: Node, b: Node): number {
		return a.eval() * b.eval();
	},
	MulExp_divide(a: Node, _op: Node, b: Node): number {
		return a.eval() / b.eval();
	},

	ExpExp_power(a: Node, _: Node, b: Node) {
		return Math.pow(a.eval(), b.eval());
	},

	PriExp_paren(_open: Node, e: Node, _close: Node): number {
		return e.eval();
	},
	PriExp_pos(_op: Node, e: Node) {
		return e.eval();
	},
	PriExp_neg(_op: Node, e: Node) {
		return -e.eval();
	},

	decimalValue(value: Node) {
        return parseFloat(value.sourceString);
    },

	hexValue(_prefix: Node, value: Node) {
        return parseInt(value.sourceString, 16);
    },

    binaryValue(_prefix: Node, value: Node) {
        return parseInt(value.sourceString, 2);
    },

	string(_quote1: Node, e: Node, _quote2: Node) {
		return e.sourceString;
	},

	ident(first: Node, remain: Node): number | string {
		const id = (first.sourceString + remain.sourceString);

		return variables[id];
	},
	variable(e: Node) {
        const variableLit = e.sourceString;
		return variableLit;
	}
};


const arithmeticParser = new Parser(arithmetic.grammar, semantics);


function onInputChanged(event: Event) {
	const inputElement = event.target as HTMLInputElement;
	const outputElement = document.getElementById("output") as HTMLInputElement;

	const input = inputElement.value;

	let result: string;
	try {
		result = String(arithmeticParser.parseAndEval(input));
	} catch (error) {
		result = error instanceof Error ? error.message : "unknown error";
	}

	console.log(`${input} = ${result}`);

	outputElement.value = result.toString();
}

/*
function fnEval(code: string) {
	return eval(code); // eslint-disable-line no-eval
}
*/

interface NodeFs {
	//readFile: (name: string, encoding: string, fn: (res: any) => void) => any
	promises: any;
}

let fs: NodeFs;
let modulePath: string;

declare function require(name:string): any;

async function nodeReadFile(name: string): Promise<string> {
	if (!fs) {
		//fnEval('fs = require("fs");'); // to trick TypeScript
		//const fnRequire = new Function("name", `global[name] = require(name);`)
		//fnRequire("fs");
		fs = require("fs");
	}

	if (!module) {
		//fnEval('module = require("module");'); // to trick TypeScript
		//const fnRequire = new Function(name, `global.${name} = require("${name}");`)
		//fnRequire("module");
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
		const result = arithmeticParser.parseAndEval(input);
		console.log(result);
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
		main(fnParseUri(window.location.search.substring(1), startConfig));
		const element = window.document.getElementById("expressionInput");
		if (element) {
			element.onchange = onInputChanged;
		}
	};
} else {
	main(fnParseArgs(global.process.argv.slice(2), startConfig));
}

/*
5 ' examples:
10 ' associativity
15 ? "7 =" 12 xor 5+6 "=" 12 xor (5+6), (12 xor 5)+6
20 ? "3 =" 7 mod 5+1 "=" (7 mod 5)+1, 7 mod (5+1)
30 ? "0 =" 10>5>4 "=" (10>5)>4, 10>(5>4)
40 ? not 1234555
50 ? 12 \ 5
*/
