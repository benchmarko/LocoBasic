import { describe, it, expect } from 'vitest';
import { Semantics } from '../src/Semantics';

describe('Semantics Class', () => {
    it('should initialize with default values', () => {
        const semantics = new Semantics();
        expect(semantics.getDeg()).toBe(false);
        expect(semantics.getIndent()).toBe(0);
        expect(semantics.getVariables()).toEqual([]);
    });

    it('should add and retrieve variables correctly', () => {
        const semantics = new Semantics();
        const variableName = semantics.getVariable('testVar');
        expect(variableName).toBe('testvar');
        expect(semantics.getVariables()).toContain('testvar');
    });

    it('should handle defined labels correctly', () => {
        const semantics = new Semantics();
        semantics.addDefinedLabel('label1', 0);
        const labels = semantics.getDefinedLabels();
        expect(labels).toHaveLength(1);
        expect(labels[0].label).toBe('label1');
        expect(labels[0].first).toBe(0);
    });

    it('should increment line index correctly', () => {
        const semantics = new Semantics();
        expect(semantics.incrementLineIndex()).toBe(1);
        expect(semantics.incrementLineIndex()).toBe(2);
    });

    it('should add and retrieve instructions correctly', () => {
        const semantics = new Semantics();
        semantics.addInstr('testInstr');
        const instrMap = semantics.getInstrMap();
        expect(instrMap['testInstr']).toBe(1);
    });

    it('should correctly prefix reserved keywords with an underscore', () => {
        const semantics = new Semantics();
        const reservedKeyword = 'class';
        const prefixedKeyword = semantics.getVariable(reservedKeyword);
        expect(prefixedKeyword).toBe('_class');
    });

    it('should not modify non-reserved keywords', () => {
        const semantics = new Semantics();
        const nonReservedKeyword = 'customVar';
        const result = semantics.getVariable(nonReservedKeyword);
        expect(result).toBe('customvar');
    });

    it('should handle mixed-case reserved keywords correctly', () => {
        const semantics = new Semantics();
        const mixedCaseKeyword = 'Class';
        const prefixedKeyword = semantics.getVariable(mixedCaseKeyword);
        expect(prefixedKeyword).toBe('_class');
    });

    it('should handle mixed-case non-reserved keywords correctly', () => {
        const semantics = new Semantics();
        const mixedCaseKeyword = 'CustomVar';
        const result = semantics.getVariable(mixedCaseKeyword);
        expect(result).toBe('customvar');
    });
});
