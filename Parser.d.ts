import { type ActionDict, type Grammar } from "ohm-js";
export declare class Parser {
    private readonly ohmGrammar;
    private readonly ohmSemantics;
    constructor(grammarString: string, semanticsMap: ActionDict<string | string[]>, superParser?: Parser);
    getOhmGrammar(): Grammar;
    parseAndEval(input: string): string;
}
//# sourceMappingURL=Parser.d.ts.map