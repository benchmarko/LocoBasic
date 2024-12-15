import { type ActionDict } from "ohm-js";
export declare class Parser {
    private readonly ohmGrammar;
    private readonly ohmSemantics;
    constructor(grammarString: string, semanticsMap: ActionDict<string | string[]>);
    parseAndEval(input: string): any;
}
//# sourceMappingURL=Parser.d.ts.map