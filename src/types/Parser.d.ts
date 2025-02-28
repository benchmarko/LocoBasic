import { type ActionDict, type Grammar } from "ohm-js";
export declare class Parser {
    private readonly ohmGrammar;
    private readonly ohmSemantics;
    private readonly matcher;
    constructor(grammarString: string, semanticsMap: ActionDict<string | string[]>, superParser?: Parser);
    getOhmGrammar(): Grammar;
    private diffPartsStart;
    private diffPartsEnd;
    parseAndEval(input: string): string;
}
//# sourceMappingURL=Parser.d.ts.map