// Parser.ts

import { type ActionDict, type Grammar, type Semantics, grammar } from "ohm-js";

export class Parser {
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
