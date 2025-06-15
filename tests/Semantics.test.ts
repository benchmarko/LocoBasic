import { describe, it, expect } from 'vitest';
import type { Node } from "ohm-js";
import { Semantics } from '../src/Semantics';

describe('Semantics Class', () => {
    it('should initialize', () => {
        const semantics = new Semantics();
        expect(semantics).toBeDefined();
    });

    describe('getSemanticsActions', () => {
        const getMockOhmNode = (props: Partial<Node>): Node => {
            return {
                ...props
            } as Node;
        };

        const getDummyNode = () => {
            return getMockOhmNode({});
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

        const getChildNode = (node: Node | undefined): Node => {
            return getMockOhmNode({
                child(_n: number): Node { // eslint-disable-line @typescript-eslint/no-unused-vars
                    return node as Node; //TTT
                }
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

        it('should return  SemanticsActions with defined semantics', () => {
            const semantics = new Semantics();
            const actions = semantics.getSemanticsActions();

            expect(actions).toBeDefined();
            expect(typeof actions).toBe('object');
            expect(Object.keys(actions).length).toBeGreaterThan(0);
        });

        it('should include specific semantics actions', () => {
            const semantics = new Semantics();
            const actions = semantics.getSemanticsActions();

            expect(actions.Cos).toBeDefined();
            expect(actions.Draw).toBeDefined();
            expect(actions.ForNextBlock).toBeDefined();
            expect(actions.WhileWendBlock).toBeDefined();
            expect(actions.decimalValue).toBeDefined();
        });

        it('should correctly evaluate the "Cos" action', () => {
            const semantics = new Semantics();
            const actions = semantics.getSemanticsActions();

            const litNode = getSourceNode('cos');
            const argNode = getEvalNode('45');
            const dummy = getDummyNode();
            const result = actions.Cos(litNode, dummy, argNode, dummy);
            expect(result).toBe('Math.cos(45)');

            semantics.getHelper().setDeg(true);
            const result2 = actions.Cos(litNode, dummy, argNode, dummy);
            expect(result2).toBe('Math.cos((45) * Math.PI / 180)');
        });

        it('should correctly evaluate the "Draw" action', () => {
            const semantics = new Semantics();
            const actions = semantics.getSemanticsActions();

            const litNode = getSourceNode('draw');
            const xNode = getEvalNode('100');
            const yNode = getEvalNode('200');
            const penNode = getChildEvalNode(undefined);
            const modeNode = getChildNode(undefined);
            const dummy = getDummyNode();
            const result = actions.Draw(litNode, xNode, dummy, yNode, dummy, penNode, dummy, modeNode);
            expect(result).toContain('draw(100, 200)');
            expect(semantics.getHelper().getInstrMap()['draw']).toBe(1);

            const penNode2 = getChildEvalNode('2');
            const result2 = actions.Draw(litNode, xNode, dummy, yNode, dummy, penNode2, dummy, modeNode);
            expect(result2).toContain('draw(100, 200, 2)');
        });

        it('should correctly evaluate the "ForNextBlock" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const startNode = getEvalNode('for (i = 0; i < 10; i += 1) {');
            const contentNode = getChildrenEvalNode(['a = 5', 'b = 10']);
            const separatorNode = getEvalNode('');
            const endNode = getEvalNode('}');
            const result = actions.ForNextBlock(startNode, contentNode, separatorNode, endNode);
            expect(result).toContain('for (i = 0; i < 10; i += 1) {a = 5;b = 10;}');
        });

        it('should correctly evaluate the "HexS" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const numNode = getEvalNode('255');
            const padNode = getChildEvalNode('4');
            const dummy = getDummyNode();
            const result = actions.HexS(dummy, dummy, numNode, dummy, padNode, dummy);
            expect(result).toBe('hex$(255, 4)');
        });

        it('should correctly evaluate the "MidS" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const strNode = getEvalNode('"Hello, World!"');
            const startNode = getEvalNode('8');
            const lengthNode = getChildEvalNode('5');
            const dummy = getDummyNode();
            const result = actions.MidS(dummy, dummy, strNode, dummy, startNode, dummy, lengthNode, dummy);
            expect(result).toBe('mid$("Hello, World!", 8, 5)');
        });

        it('should correctly evaluate the "Rnd" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const dummy = getDummyNode();
            const result = actions.Rnd(dummy, dummy, dummy, dummy);
            expect(result).toBe('Math.random()');
        });

        it('should correctly evaluate the "While" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const conditionNode = getEvalNode('i < 10');
            const result = actions.While(getDummyNode(), conditionNode);
            expect(result).toBe('while (i < 10) {');
        });

        it('should correctly evaluate the "WhileWendBlock" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const startNode = getEvalNode('while (i < 3) {');
            const contentNode = getChildrenEvalNode(['i = i + 1']);
            const separatorNode = getEvalNode('');
            const endNode = getEvalNode('}');
            const result = actions.WhileWendBlock(startNode, contentNode, separatorNode, endNode);
            expect(result).toContain('while (i < 3) {i = i + 1;}');
        });


        it('should correctly evaluate the "AndExp_and" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('5');
            const rightNode = getEvalNode('3');
            const result = actions.AndExp_and(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('5 & 3');
        });

        it('should correctly evaluate the "NotExp_not" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const innerNode = getEvalNode('5');
            const result = actions.NotExp_not(getDummyNode(), innerNode);
            expect(result).toBe('~(5)');
        });

        it('should correctly evaluate the "OrExp_or" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('5');
            const rightNode = getEvalNode('3');
            const result = actions.OrExp_or(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('5 | 3');
        });

        it('should correctly evaluate the "XorExp_xor" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('5');
            const rightNode = getEvalNode('3');
            const result = actions.XorExp_xor(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('5 ^ 3');
        });


        it('should correctly evaluate the "AddExp_minus" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('10');
            const rightNode = getEvalNode('5');
            const result = actions.AddExp_minus(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('10 - 5');
        });

        it('should correctly evaluate the "AddExp_plus" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('5');
            const rightNode = getEvalNode('3');
            const result = actions.AddExp_plus(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('5 + 3');
        });

        it('should correctly evaluate the "CmpExp_eq" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('10');
            const rightNode = getEvalNode('10');
            const result = actions.CmpExp_eq(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-(10 === 10)');
        });

        it('should correctly evaluate the "CmpExp_ge" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('10');
            const rightNode = getEvalNode('5');
            const result = actions.CmpExp_ge(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-(10 >= 5)');
        });

        it('should correctly evaluate the "CmpExp_gt" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('15');
            const rightNode = getEvalNode('10');
            const result = actions.CmpExp_gt(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-(15 > 10)');
        });

        it('should correctly evaluate the "CmpExp_le" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('5');
            const rightNode = getEvalNode('10');
            const result = actions.CmpExp_le(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-(5 <= 10)');
        });

        it('should correctly evaluate the "CmpExp_lt" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('5');
            const rightNode = getEvalNode('10');
            const result = actions.CmpExp_lt(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-(5 < 10)');
        });

        it('should correctly evaluate the "CmpExp_ne" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('10');
            const rightNode = getEvalNode('20');
            const result = actions.CmpExp_ne(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-(10 !== 20)');
        });

        it('should correctly evaluate the "DivExp_div" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('10');
            const rightNode = getEvalNode('3');
            const result = actions.DivExp_div(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('((10 / 3) | 0)');
        });

        it('should correctly evaluate the "ExpExp_power" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const baseNode = getEvalNode('2');
            const exponentNode = getEvalNode('3');
            const result = actions.ExpExp_power(baseNode, getDummyNode(), exponentNode);
            expect(result).toBe('Math.pow(2, 3)');
        });

        it('should correctly evaluate the "ModExp_mod" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('10');
            const rightNode = getEvalNode('3');
            const result = actions.ModExp_mod(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('10 % 3');
        });

        it('should correctly evaluate the "MulExp_divide" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('20');
            const rightNode = getEvalNode('4');
            const result = actions.MulExp_divide(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('20 / 4');
        });

        it('should correctly evaluate the "MulExp_times" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('4');
            const rightNode = getEvalNode('2');
            const result = actions.MulExp_times(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('4 * 2');
        });

        it('should correctly evaluate the "PriExp_neg" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const innerNode = getEvalNode('10');
            const result = actions.PriExp_neg(getDummyNode(), innerNode);
            expect(result).toBe('-10');
        });

        it('should correctly evaluate the "PriExp_paren" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const innerNode = getEvalNode('5 + 3');
            const result = actions.PriExp_paren(getDummyNode(), innerNode, getDummyNode());
            expect(result).toBe('(5 + 3)');
        });

        it('should correctly evaluate the "PriExp_pos" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const innerNode = getEvalNode('5');
            const result = actions.PriExp_pos(getDummyNode(), innerNode);
            expect(result).toBe('+5');
        });

        it('should correctly evaluate the "StrAddExp_plus" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('"Hello"');
            const rightNode = getEvalNode('" World"');
            const result = actions.StrAddExp_plus(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('"Hello" + " World"');
        });

        it('should correctly evaluate the "StrCmpExp_eq" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('"Hello"');
            const rightNode = getEvalNode('"World"');
            const result = actions.StrCmpExp_eq(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-("Hello" === "World")');
        });

        it('should correctly evaluate the "StrCmpExp_ge" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('"Zebra"');
            const rightNode = getEvalNode('"Apple"');
            const result = actions.StrCmpExp_ge(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-("Zebra" >= "Apple")');
        });

        it('should correctly evaluate the "StrCmpExp_gt" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('"Zebra"');
            const rightNode = getEvalNode('"Apple"');
            const result = actions.StrCmpExp_gt(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-("Zebra" > "Apple")');
        });

        it('should correctly evaluate the "StrCmpExp_le" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('"Apple"');
            const rightNode = getEvalNode('"Zebra"');
            const result = actions.StrCmpExp_le(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-("Apple" <= "Zebra")');
        });

        it('should correctly evaluate the "StrCmpExp_lt" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('"Apple"');
            const rightNode = getEvalNode('"Banana"');
            const result = actions.StrCmpExp_lt(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-("Apple" < "Banana")');
        });

        it('should correctly evaluate the "StrCmpExp_ne" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const leftNode = getEvalNode('"Hello"');
            const rightNode = getEvalNode('"World"');
            const result = actions.StrCmpExp_ne(leftNode, getDummyNode(), rightNode);
            expect(result).toBe('-("Hello" !== "World")');
        });

        it('should correctly evaluate the "StrPriExp_paren" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const innerNode = getEvalNode('"Hello" + " World"');
            const result = actions.StrPriExp_paren(getDummyNode(), innerNode, getDummyNode());
            expect(result).toBe('("Hello" + " World")');
        });


        it('should correctly evaluate the "ArrayIdent" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const identNode = getEvalNode('myArray');
            const indexNode = getEvalNode('2');
            const result = actions.ArrayIdent(identNode, getDummyNode(), indexNode, getDummyNode());
            expect(result).toBe('myArray[2]');
        });

        it('should correctly evaluate the "DimArrayIdent" action for single dimension', () => {
            const actions = new Semantics().getSemanticsActions();

            const identNode = getEvalNode('myArray');
            const indicesNode = getEvalNode('10');
            const result = actions.DimArrayIdent(identNode, getDummyNode(), indicesNode, getDummyNode());
            expect(result).toBe('myArray = dim1(10)');
        });

        it('should correctly evaluate the "DimArrayIdent" action for multi-dimension', () => {
            const actions = new Semantics().getSemanticsActions();

            const identNode = getEvalNode('myArray');
            const indicesNode = getEvalNode('10, 20');
            const result = actions.DimArrayIdent(identNode, getDummyNode(), indicesNode, getDummyNode());
            expect(result).toBe('myArray = dim([10, 20])');
        });


        it('should correctly evaluate the "decimalValue" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const valueNode = getSourceNode('123');
            const result = actions.decimalValue(valueNode);
            expect(result).toBe('123');
        });

        it('should correctly evaluate the "hexValue" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const valueNode = getSourceNode('FF2');
            const result = actions.hexValue(getDummyNode(), valueNode);
            expect(result).toBe('0xFF2');
        });

        it('should correctly evaluate the "binaryValue" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const valueNode = getSourceNode('1010');
            const result = actions.binaryValue(getDummyNode(), valueNode);
            expect(result).toBe('0b1010');
        });

        it('should correctly evaluate the "string" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const valueNode = getSourceNode('Hello, World!');
            const quotesNode = getSourceNode('"');
            const dummy = getDummyNode();
            const result = actions.string(dummy, valueNode, quotesNode);
            expect(result).toBe('"Hello, World!"');
        });

        it('should correctly evaluate the "ident" action', () => {
            const actions = new Semantics().getSemanticsActions();

            const valueNode = getSourceNode('myVariableName');
            const suffixNode = getChildNode(undefined);
            const result = actions.ident(valueNode, suffixNode);
            expect(result).toBe('myvariablename');

            const valueNode2 = getSourceNode('void');
            const result2 = actions.ident(valueNode2, suffixNode);
            expect(result2).toBe('_void');
        });
    });
});
