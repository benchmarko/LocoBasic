// parser.ts
// A simple parser for arithmetic expressions using Ohm
//
// Usage:
// [ node parser.js "3 + 5 * (2 - 8)" ]
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
	AddExp_plus(e1: Node, _op: Node, e2: Node): number {
		return e1.eval() + e2.eval();
	},
	AddExp_minus(e1: Node, _op: Node, e2: Node): number {
		return e1.eval() - e2.eval();
	},
	MulExp_times(e1: Node, _op: Node, e2: Node): number {
		return e1.eval() * e2.eval();
	},
	MulExp_divide(e1: Node, _op: Node, e2: Node): number {
		return e1.eval() / e2.eval();
	},
	PriExp_paren(_open: Node, e: Node, _close: Node): number {
		return e.eval();
	},
	number(chars: Node): number {
		return parseInt(chars.sourceString, 10);
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
	} catch(error) {
		result = error.message;
	}

	console.log(`${input} = ${result}`);

	outputElement.value = result.toString();
}

function main(argv: string[]) {
	// read command line options
	const input = argv.length > 2 ? argv[2]: ""; // : "3 + 5 * (2 - 8)";

	if (input !== "") {
		const result = arithmeticParser.parseAndEval(input);
		console.log(`${input} = ${result}`);
	}
}

if (typeof window !== "undefined") {
	window.onload = () => {
		main([]);
		(window.document.getElementById("expressionInput") as HTMLInputElement).onchange = onInputChanged;
	};
} else {
	main(process.argv);
}
//
