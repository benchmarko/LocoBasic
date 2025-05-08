import type { ActionDict, Node } from "ohm-js";
import { describe, it, expect } from 'vitest';
import { Parser } from '../src/Parser';

describe('Parser Module', () => {
    const grammarString = `
        G {
            Exp = AddExp
            AddExp = AddExp "+" PriExp  -- plus
                   | PriExp
            PriExp = digit
        }
    `;

    const semanticsMap: ActionDict<string> = {
        // Exp: semantic implicitly defined

        AddExp_plus(n1: Node, plusLit: Node, n2: Node) {
            return `${n1.eval()} + ${n2.eval()}`;
        },
        PriExp(n: Node) {
            return n.sourceString;
        }
    };

    it('should create a Parser instance successfully', () => {
        const parser = new Parser(grammarString, semanticsMap);
        expect(parser).toBeInstanceOf(Parser);
    });

    it('should parse and evaluate a valid input', () => {
        const parser = new Parser(grammarString, semanticsMap);
        const result = parser.parseAndEval('1+2');
        expect(result).toBe('1 + 2');
    });

    it('should return an error message for invalid input', () => {
        const parser = new Parser(grammarString, semanticsMap);
        const result = parser.parseAndEval('1+');
        expect(result).toContain('ERROR: Parsing failed');
    });

    it('should handle empty input gracefully', () => {
        const parser = new Parser(grammarString, semanticsMap);
        const result = parser.parseAndEval('');
        expect(result).toContain('ERROR: Parsing failed');
    });

    it('should reuse the matcher for incremental parsing', () => {
        const parser = new Parser(grammarString, semanticsMap);
        parser.parseAndEval('1+2');
        const result = parser.parseAndEval('1+2+3');
        expect(result).toBe('1 + 2 + 3');
    });

    /*
    it('should throw an error if semantics are not properly defined', () => {
        const invalidSemanticsMap = {};
        expect(() => new Parser(grammarString, invalidSemanticsMap)).toThrow();
    });
    */
});