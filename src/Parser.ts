import { type ActionDict, type Grammar, type Namespace, type Semantics, grammar } from "ohm-js";

export class Parser {
    private readonly ohmGrammar: Grammar;
    private readonly ohmSemantics: Semantics;

    constructor(grammarString: string, semanticsMap: ActionDict<string | string[]>, superParser?: Parser) {
        if (superParser) {
            const superGrammar = superParser.getOhmGrammar();
            
            const namespace: Namespace = {
                basicGrammar: superGrammar
            };
            this.ohmGrammar = grammar(grammarString, namespace);
        } else {
            this.ohmGrammar = grammar(grammarString);
        }

        this.ohmSemantics = this.ohmGrammar
            .createSemantics()
			.addOperation<string | string[]>("eval", semanticsMap);
    }

    public getOhmGrammar(): Grammar {
        return this.ohmGrammar;
    }

    // Function to parse and evaluate an expression
    public parseAndEval(input: string): string {
        try {
            const matchResult = this.ohmGrammar.match(input);
            if (matchResult.succeeded()) {
                return this.ohmSemantics(matchResult).eval() as string;
            } else {
                return `ERROR: Parsing failed: ${matchResult.message}`;
            }
        } catch (error) {
            return `ERROR: Parsing evaluator failed: ${error instanceof Error ? error.message : "unknown"}`;
        }
    }
}
