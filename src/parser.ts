// parser.ts
// A simple parser for arithmetic expressions using Ohm
//
// Usage:
// node dist/locobasic.js "3 + 5 * (2 - 8)"
//
// [ npx ts-node parser.ts "3 + 5 * (2 - 8)" ]

import { Grammar, grammar, Node, Semantics } from "ohm-js";
import { arithmetic } from "./arithmetic";

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
	parseAndEval(input: string): number {
		const matchResult = this.ohmGrammar.match(input);
		if (matchResult.succeeded()) {
			return this.ohmSemantics(matchResult).eval();
		} else {
			throw new Error("Parsing failed");
		}
	}
}

const variables: Record<string, number> = {};

// Semantics to evaluate an arithmetic expression
const semantics = {
	Program(lines: Node) {
		return lines.children.map(c => c.eval());
		// https://ohmjs.org/docs/releases/ohm-js-16.0#default-semantic-actions
	},

	Line(e: Node, _sep:Node, e2: Node, _comment: Node, _eol: Node): number | string {
		return e.eval() + e2.children.map(c => c.eval());
	},

	Assign(ident: Node, _op: Node, e: Node): number {
		const id = ident.sourceString;
		const value = e.eval();
		console.debug("DEBUG: assign:", id, "=", value);
		variables[id] = value;
		return value;
	},
	Print(_printLit: Node, params: Node): string {
		const out = params.eval();
		console.debug("DEBUG: print", out);

		return out;
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

	/*
	number(chars: Node): number {
		return parseFloat(chars.sourceString);
	},
	*/

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
		/*
		// we simply compute the sum of characters
		let sum = 0;
    	for (let i = 0; i < str.length; i++) {
       		sum += str.charCodeAt(i) - 96;
    	}
		return sum;
		*/
		return variables[id];
	}
};


const arithmeticParser = new Parser(arithmetic.grammar, semantics);


function onInputChanged(event: Event) {
	//const inputElement = document.getElementById("expressionInput") as HTMLInputElement;
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

function main(argv: string[]) {
	// read command line options
	const input = argv.length > 2 ? argv[2] : ""; // : "3 + 5 * (2 - 8)";

	if (input !== "") {
		const result = arithmeticParser.parseAndEval(input);
		console.log(`${input} = ${result}`);
	}
}

if (typeof window !== "undefined") {
	window.onload = () => {
		main([]);
		const element = window.document.getElementById("expressionInput");
		if (element) {
			element.onchange = onInputChanged;
		}
	};
} else {
	main(process.argv);
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
