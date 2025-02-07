import { grammar } from "ohm-js";
export class Parser {
    constructor(grammarString, semanticsMap, superParser) {
        if (superParser) {
            const superGrammar = superParser.getOhmGrammar();
            const namespace = {
                basicGrammar: superGrammar
            };
            this.ohmGrammar = grammar(grammarString, namespace);
        }
        else {
            this.ohmGrammar = grammar(grammarString);
        }
        this.ohmSemantics = this.ohmGrammar
            .createSemantics()
            .addOperation("eval", semanticsMap);
    }
    getOhmGrammar() {
        return this.ohmGrammar;
    }
    // Function to parse and evaluate an expression
    parseAndEval(input) {
        try {
            const matchResult = this.ohmGrammar.match(input);
            if (matchResult.succeeded()) {
                return this.ohmSemantics(matchResult).eval();
            }
            else {
                return `ERROR: Parsing failed: ${matchResult.message}`;
            }
        }
        catch (error) {
            return `ERROR: Parsing evaluator failed: ${error instanceof Error ? error.message : "unknown"}`;
        }
    }
}
//# sourceMappingURL=Parser.js.map