import { describe, it, expect } from 'vitest';
import { SemanticsHelper } from '../src/SemanticsHelper';

describe('SemanticsHelper Class', () => {
    it('should initialize with default values', () => {
        const helper = new SemanticsHelper();
        expect(helper.getDeg()).toBe(false);
        expect(helper.getIndent()).toBe(0);
        expect(helper.getVariables()).toEqual([]);
    });

    it('should add and retrieve variables correctly', () => {
        const helper = new SemanticsHelper();
        const variableName = helper.getVariable('testVar');
        expect(variableName).toBe('testvar');
        expect(helper.getVariables()).toContain('testvar');
    });

    it('should handle defined labels correctly', () => {
        const helper = new SemanticsHelper();
        helper.addDefinedLabel('label1', 0);
        const labels = helper.getDefinedLabels();
        expect(labels).toHaveLength(1);
        expect(labels[0].label).toBe('label1');
        expect(labels[0].first).toBe(0);
    });

    it('should increment line index correctly', () => {
        const helper = new SemanticsHelper();
        expect(helper.incrementLineIndex()).toBe(1);
        expect(helper.incrementLineIndex()).toBe(2);
    });

    it('should add and retrieve instructions correctly', () => {
        const helper = new SemanticsHelper();
        helper.addInstr('testInstr');
        const instrMap = helper.getInstrMap();
        expect(instrMap['testInstr']).toBe(1);
    });

    it('should correctly prefix reserved keywords with an underscore', () => {
        const helper = new SemanticsHelper();
        const reservedKeyword = 'class';
        const prefixedKeyword = helper.getVariable(reservedKeyword);
        expect(prefixedKeyword).toBe('_class');
    });

    it('should not modify non-reserved keywords', () => {
        const helper = new SemanticsHelper();
        const nonReservedKeyword = 'customVar';
        const result = helper.getVariable(nonReservedKeyword);
        expect(result).toBe('customvar');
    });

    it('should handle mixed-case reserved keywords correctly', () => {
        const helper = new SemanticsHelper();
        const mixedCaseKeyword = 'Class';
        const prefixedKeyword = helper.getVariable(mixedCaseKeyword);
        expect(prefixedKeyword).toBe('_class');
    });

    it('should handle mixed-case non-reserved keywords correctly', () => {
        const helper = new SemanticsHelper();
        const mixedCaseKeyword = 'CustomVar';
        const result = helper.getVariable(mixedCaseKeyword);
        expect(result).toBe('customvar');
    });
});
