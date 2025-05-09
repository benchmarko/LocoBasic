import { describe, it, expect } from 'vitest';
import type { Node } from "ohm-js";
import { Semantics } from '../src/Semantics';

type FunctionMapType = Record<string, (...args: (Node | null)[]) => string>;

describe('Semantics Class', () => {

    const getMockOhmNode = (props: Partial<Node>): Node => {
        return {
            ...props
        } as Node;
    };

    const getSourceNode = (sourceString: string): Node => {
        return getMockOhmNode({
            sourceString
        });
    };

    const getEvalNode = (value: string | undefined): Node => {
        return getMockOhmNode({
            eval: () => value
        });
    };

    const getChildEvalNode = (value: string | undefined): Node => {
        return getMockOhmNode({
            child(_n: number): Node { // eslint-disable-line @typescript-eslint/no-unused-vars
                return getEvalNode(value);
            }
        });
    };

    const getChildrenEvalNode = (values: string[]): Node => {
        return getMockOhmNode({
            children: values.map((value) => getEvalNode(value))
        });
    };

    it('should initialize', () => {
        const semantics = new Semantics();
        const semanticsActionDict = semantics.getSemanticsActionDict();
        expect(semanticsActionDict).toBeDefined();
    });

    it('should return an ActionDict with defined semantics', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict();

        expect(actionDict).toBeDefined();
        expect(typeof actionDict).toBe('object');
        expect(Object.keys(actionDict).length).toBeGreaterThan(0);
    });

    it('should include specific semantics actions', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict();

        expect(actionDict).toHaveProperty('Cos');
        expect(actionDict).toHaveProperty('Draw');
        expect(actionDict).toHaveProperty('ForNextBlock');
        expect(actionDict).toHaveProperty('WhileWendBlock');
        expect(actionDict).toHaveProperty('decimalValue');
    });

    it('should correctly evaluate the "Cos" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const mockLitNode = getSourceNode('cos');
        const mockArgNode = getEvalNode('45');
        const result = actionDict.Cos(mockLitNode, null, mockArgNode, null);
        expect(result).toBe('Math.cos(45)');

        semantics.getHelper().setDeg(true);
        const result2 = actionDict.Cos(mockLitNode, null, mockArgNode, null);
        expect(result2).toBe('Math.cos((45) * Math.PI / 180)');
    });

    it('should correctly evaluate the "Draw" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const litNode = getSourceNode('draw');
        const xNode = getEvalNode('100');
        const yNode = getEvalNode('200');
        const penNode = getChildEvalNode(undefined);
        const result = actionDict.Draw(litNode, xNode, null, yNode, null, penNode);
        expect(result).toContain('draw(100, 200)');
        expect(semantics.getHelper().getInstrMap()['draw']).toBe(1);

        const penNode2 = getChildEvalNode('2');
        const result2 = actionDict.Draw(litNode, xNode, null, yNode, null, penNode2);
        expect(result2).toContain('graphicsPen(2); draw(100, 200)');
        expect(semantics.getHelper().getInstrMap()['graphicsPen']).toBe(1);
    });

    it('should correctly evaluate the "ForNextBlock" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const startNode = getEvalNode('for (i = 0; i < 10; i += 1) {');
        const contentNode = getChildrenEvalNode(['a = 5', 'b = 10']);
        const separatorNode = getEvalNode('');
        const endNode = getEvalNode('}');
        const result = actionDict.ForNextBlock(startNode, contentNode, separatorNode, endNode);
        expect(result).toContain('for (i = 0; i < 10; i += 1) {a = 5;b = 10;}');
    });

    it('should correctly evaluate the "WhileWendBlock" action', () => {
        const semantics = new Semantics();

        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const startNode = getEvalNode('while (i < 3) {');
        const contentNode = getChildrenEvalNode(['i = i + 1']);
        const separatorNode = getEvalNode('');
        const endNode = getEvalNode('}');
        const result = actionDict.WhileWendBlock(startNode, contentNode, separatorNode, endNode);
        expect(result).toContain('while (i < 3) {i = i + 1;}');
    });

    it('should correctly evaluate the "decimalValue" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const valueNode = getSourceNode('123');
        const result = actionDict.decimalValue(valueNode);
        expect(result).toBe('123');
    });

    it('should correctly evaluate the "hexValue" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const valueNode = getSourceNode('FF2');
        const result = actionDict.hexValue(null, valueNode);
        expect(result).toBe('0xFF2');
    });

    it('should correctly evaluate the "binaryValue" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const valueNode = getSourceNode('1010');
        const result = actionDict.binaryValue(null, valueNode);
        expect(result).toBe('0b1010');
    });

    it('should correctly evaluate the "string" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const valueNode = getSourceNode('Hello, World!');
        const result = actionDict.string(null, valueNode, null);
        expect(result).toBe('"Hello, World!"');
    });

    it('should correctly evaluate the "ident" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const valueNode = getSourceNode('myVariableName');
        const result = actionDict.ident(valueNode);
        expect(result).toBe('myvariablename');

        const valueNode2 = getSourceNode('void');
        const result2 = actionDict.ident(valueNode2);
        expect(result2).toBe('_void');
    });

    it('should correctly evaluate the "AddExp_plus" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('5');
        const rightNode = getEvalNode('3');
        const result = actionDict.AddExp_plus(leftNode, null, rightNode);
        expect(result).toBe('5 + 3');
    });

    it('should correctly evaluate the "CmpExp_eq" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('10');
        const rightNode = getEvalNode('10');
        const result = actionDict.CmpExp_eq(leftNode, null, rightNode);
        expect(result).toBe('-(10 === 10)');
    });

    it('should correctly evaluate the "CmpExp_lt" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('5');
        const rightNode = getEvalNode('10');
        const result = actionDict.CmpExp_lt(leftNode, null, rightNode);
        expect(result).toBe('-(5 < 10)');
    });

    it('should correctly evaluate the "MulExp_times" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('4');
        const rightNode = getEvalNode('2');
        const result = actionDict.MulExp_times(leftNode, null, rightNode);
        expect(result).toBe('4 * 2');
    });

    it('should correctly evaluate the "DivExp_div" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('10');
        const rightNode = getEvalNode('3');
        const result = actionDict.DivExp_div(leftNode, null, rightNode);
        expect(result).toBe('((10 / 3) | 0)');
    });

    it('should correctly evaluate the "StrAddExp_plus" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('"Hello"');
        const rightNode = getEvalNode('" World"');
        const result = actionDict.StrAddExp_plus(leftNode, null, rightNode);
        expect(result).toBe('"Hello" + " World"');
    });

    it('should correctly evaluate the "While" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const conditionNode = getEvalNode('i < 10');
        const result = actionDict.While(null, conditionNode);
        expect(result).toBe('while (i < 10) {');
    });

    it('should correctly evaluate the "Rnd" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const result = actionDict.Rnd(null, null, null, null);
        expect(result).toBe('Math.random()');
    });

    it('should correctly evaluate the "HexS" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const numNode = getEvalNode('255');
        const padNode = getChildEvalNode('4');
        const result = actionDict.HexS(null, null, numNode, null, padNode, null);
        expect(result).toBe('hex$(255, 4)');
    });

    it('should correctly evaluate the "MidS" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const strNode = getEvalNode('"Hello, World!"');
        const startNode = getEvalNode('8');
        const lengthNode = getChildEvalNode('5');
        const result = actionDict.MidS(null, null, strNode, null, startNode, null, lengthNode, null);
        expect(result).toBe('("Hello, World!").substr(8 - 1, 5)');
    });

    it('should correctly evaluate the "CmpExp_ge" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('10');
        const rightNode = getEvalNode('5');
        const result = actionDict.CmpExp_ge(leftNode, null, rightNode);
        expect(result).toBe('-(10 >= 5)');
    });

    it('should correctly evaluate the "CmpExp_ne" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('10');
        const rightNode = getEvalNode('20');
        const result = actionDict.CmpExp_ne(leftNode, null, rightNode);
        expect(result).toBe('-(10 !== 20)');
    });

    it('should correctly evaluate the "ModExp_mod" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('10');
        const rightNode = getEvalNode('3');
        const result = actionDict.ModExp_mod(leftNode, null, rightNode);
        expect(result).toBe('10 % 3');
    });

    it('should correctly evaluate the "ExpExp_power" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const baseNode = getEvalNode('2');
        const exponentNode = getEvalNode('3');
        const result = actionDict.ExpExp_power(baseNode, null, exponentNode);
        expect(result).toBe('Math.pow(2, 3)');
    });

    it('should correctly evaluate the "PriExp_paren" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const innerNode = getEvalNode('5 + 3');
        const result = actionDict.PriExp_paren(null, innerNode, null);
        expect(result).toBe('(5 + 3)');
    });

    it('should correctly evaluate the "PriExp_neg" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const innerNode = getEvalNode('10');
        const result = actionDict.PriExp_neg(null, innerNode);
        expect(result).toBe('-10');
    });

    it('should correctly evaluate the "StrCmpExp_eq" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('"Hello"');
        const rightNode = getEvalNode('"World"');
        const result = actionDict.StrCmpExp_eq(leftNode, null, rightNode);
        expect(result).toBe('-("Hello" === "World")');
    });

    it('should correctly evaluate the "StrCmpExp_lt" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('"Apple"');
        const rightNode = getEvalNode('"Banana"');
        const result = actionDict.StrCmpExp_lt(leftNode, null, rightNode);
        expect(result).toBe('-("Apple" < "Banana")');
    });

    it('should correctly evaluate the "StrAddExp_plus" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('"Hello"');
        const rightNode = getEvalNode('" World"');
        const result = actionDict.StrAddExp_plus(leftNode, null, rightNode);
        expect(result).toBe('"Hello" + " World"');
    });

    it('should correctly evaluate the "ArrayIdent" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const identNode = getEvalNode('myArray');
        const indexNode = getEvalNode('2');
        const result = actionDict.ArrayIdent(identNode, null, indexNode, null);
        expect(result).toBe('myArray[2]');
    });

    it('should correctly evaluate the "DimArrayIdent" action for single dimension', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const identNode = getEvalNode('myArray');
        const indicesNode = getEvalNode('10');
        const result = actionDict.DimArrayIdent(identNode, null, indicesNode, null);
        expect(result).toBe('myArray = dim1(10)');
    });

    it('should correctly evaluate the "DimArrayIdent" action for multi-dimension', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const identNode = getEvalNode('myArray');
        const indicesNode = getEvalNode('10, 20');
        const result = actionDict.DimArrayIdent(identNode, null, indicesNode, null);
        expect(result).toBe('myArray = dim([10, 20])');
    });

    it('should correctly evaluate the "CmpExp_le" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('5');
        const rightNode = getEvalNode('10');
        const result = actionDict.CmpExp_le(leftNode, null, rightNode);
        expect(result).toBe('-(5 <= 10)');
    });

    it('should correctly evaluate the "CmpExp_gt" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('15');
        const rightNode = getEvalNode('10');
        const result = actionDict.CmpExp_gt(leftNode, null, rightNode);
        expect(result).toBe('-(15 > 10)');
    });

    it('should correctly evaluate the "AddExp_minus" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('10');
        const rightNode = getEvalNode('5');
        const result = actionDict.AddExp_minus(leftNode, null, rightNode);
        expect(result).toBe('10 - 5');
    });

    it('should correctly evaluate the "MulExp_divide" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('20');
        const rightNode = getEvalNode('4');
        const result = actionDict.MulExp_divide(leftNode, null, rightNode);
        expect(result).toBe('20 / 4');
    });

    it('should correctly evaluate the "StrCmpExp_ne" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('"Hello"');
        const rightNode = getEvalNode('"World"');
        const result = actionDict.StrCmpExp_ne(leftNode, null, rightNode);
        expect(result).toBe('-("Hello" !== "World")');
    });

    it('should correctly evaluate the "StrCmpExp_ge" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('"Zebra"');
        const rightNode = getEvalNode('"Apple"');
        const result = actionDict.StrCmpExp_ge(leftNode, null, rightNode);
        expect(result).toBe('-("Zebra" >= "Apple")');
    });

    it('should correctly evaluate the "StrPriExp_paren" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const innerNode = getEvalNode('"Hello" + " World"');
        const result = actionDict.StrPriExp_paren(null, innerNode, null);
        expect(result).toBe('("Hello" + " World")');
    });

    it('should correctly evaluate the "XorExp_xor" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('5');
        const rightNode = getEvalNode('3');
        const result = actionDict.XorExp_xor(leftNode, null, rightNode);
        expect(result).toBe('5 ^ 3');
    });

    it('should correctly evaluate the "OrExp_or" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('5');
        const rightNode = getEvalNode('3');
        const result = actionDict.OrExp_or(leftNode, null, rightNode);
        expect(result).toBe('5 | 3');
    });

    it('should correctly evaluate the "AndExp_and" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('5');
        const rightNode = getEvalNode('3');
        const result = actionDict.AndExp_and(leftNode, null, rightNode);
        expect(result).toBe('5 & 3');
    });

    it('should correctly evaluate the "NotExp_not" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const innerNode = getEvalNode('5');
        const result = actionDict.NotExp_not(null, innerNode);
        expect(result).toBe('~(5)');
    });

    it('should correctly evaluate the "StrCmpExp_gt" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('"Zebra"');
        const rightNode = getEvalNode('"Apple"');
        const result = actionDict.StrCmpExp_gt(leftNode, null, rightNode);
        expect(result).toBe('-("Zebra" > "Apple")');
    });

    it('should correctly evaluate the "StrCmpExp_le" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const leftNode = getEvalNode('"Apple"');
        const rightNode = getEvalNode('"Zebra"');
        const result = actionDict.StrCmpExp_le(leftNode, null, rightNode);
        expect(result).toBe('-("Apple" <= "Zebra")');
    });

    it('should correctly evaluate the "PriExp_pos" action', () => {
        const semantics = new Semantics();
        const actionDict = semantics.getSemanticsActionDict() as FunctionMapType;

        const innerNode = getEvalNode('5');
        const result = actionDict.PriExp_pos(null, innerNode);
        expect(result).toBe('+5');
    });


});
