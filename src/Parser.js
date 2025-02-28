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
        this.matcher = this.ohmGrammar.matcher();
        this.ohmSemantics = this.ohmGrammar
            .createSemantics()
            .addOperation("eval", semanticsMap);
    }
    getOhmGrammar() {
        return this.ohmGrammar;
    }
    diffPartsStart(oldInput, newInput) {
        let common = 0;
        while (common < oldInput.length && common < newInput.length && oldInput[common] === newInput[common]) {
            common += 1;
        }
        return common;
    }
    diffPartsEnd(oldInput, newInput, minCommon) {
        let common = newInput.length;
        const oldIndexDiff = oldInput.length - newInput.length;
        while (common > (minCommon - oldIndexDiff) && oldInput[common - 1 + oldIndexDiff] === newInput[common - 1]) {
            common -= 1;
        }
        return common;
    }
    // Function to parse and evaluate an expression
    parseAndEval(input) {
        const matcher = this.matcher;
        const oldInput = matcher.getInput();
        const start = this.diffPartsStart(oldInput, input);
        const end = this.diffPartsEnd(oldInput, input, start);
        const oldEnd = oldInput.length - (input.length - end);
        try {
            if (start > 0) {
                matcher.replaceInputRange(start, oldEnd, input.substring(start, end));
            }
            else {
                matcher.setInput(input);
            }
            const matchResult = matcher.match();
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