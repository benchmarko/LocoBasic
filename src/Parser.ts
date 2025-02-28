import { type ActionDict, type Grammar, Matcher, type Namespace, type Semantics, grammar } from "ohm-js";

export class Parser {
    private readonly ohmGrammar: Grammar;
    private readonly ohmSemantics: Semantics;
    private readonly matcher: Matcher;

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

        this.matcher = this.ohmGrammar.matcher();

        this.ohmSemantics = this.ohmGrammar
            .createSemantics()
			.addOperation<string | string[]>("eval", semanticsMap);
    }

    public getOhmGrammar(): Grammar {
        return this.ohmGrammar;
    }

    private diffPartsStart(oldInput: string, newInput: string) {
        let common = 0;
        while (common < oldInput.length && common < newInput.length && oldInput[common] === newInput[common]) {
            common += 1;
        }
        return common;
    }

    private diffPartsEnd(oldInput: string, newInput: string, minCommon: number) {
        let common = newInput.length;
        const oldIndexDiff = oldInput.length - newInput.length;
        while (common > (minCommon - oldIndexDiff) && oldInput[common - 1 + oldIndexDiff] === newInput[common - 1]) {
            common -= 1;
        }
        return common;
    }

    // Function to parse and evaluate an expression
    public parseAndEval(input: string): string {
        const matcher = this.matcher;
        const oldInput = matcher.getInput();
        const start = this.diffPartsStart(oldInput, input);
        const end = this.diffPartsEnd(oldInput, input, start);
        const oldEnd = oldInput.length - (input.length - end);

        try {
            if (start > 0) {
                matcher.replaceInputRange(start, oldEnd, input.substring(start, end));
            } else {
                matcher.setInput(input);
            }

            const matchResult = matcher.match();
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
