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

// Semantics to evaluate an arithmetic expression
const semantics = {
	Exp(e: Node): number {
		return e.eval();
	},
	AddExp_plus(a: Node, _op: Node, b: Node): number {
		return a.eval() + b.eval();
	},
	AddExp_minus(a: Node, _op: Node, b: Node): number {
		return a.eval() - b.eval();
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
	number(chars: Node): number {
		return parseFloat(chars.sourceString);
	},
	ident(first: Node, remain: Node): number {
		const str = (first.sourceString + remain.sourceString).toLowerCase();
		// we simply compute the sum of characters
		let sum = 0;
    	for (let i = 0; i < str.length; i++) {
       		sum += str.charCodeAt(i) - 96;
    	}
		return sum;
	},
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
		result = error.message;
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
//
