// Parser.ts
import { grammar } from "ohm-js";
export class Parser {
    constructor(grammarString, semanticsMap) {
        this.ohmGrammar = grammar(grammarString);
        this.ohmSemantics = this.ohmGrammar
            .createSemantics()
            .addOperation("eval", semanticsMap);
    }
    // Function to parse and evaluate an expression
    parseAndEval(input) {
        try {
            const matchResult = this.ohmGrammar.match(input);
            if (matchResult.succeeded()) {
                return this.ohmSemantics(matchResult).eval();
            }
            else {
                return 'ERROR: Parsing failed: ' + matchResult.message;
            }
        }
        catch (error) {
            return 'ERROR: Parsing evaluator failed: ' + (error instanceof Error ? error.message : "unknown");
        }
    }
}
//# sourceMappingURL=Parser.js.map