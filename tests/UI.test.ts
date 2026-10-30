import { describe, it, expect } from 'vitest';
import { UI } from '../src/UI/UI';
import { LocoBasicMode } from '../src/UI/LocoBasicMode';
import type { StringStream } from 'codemirror';
import type { ConfigType } from '../src/Interfaces';
//import path from 'path';

(globalThis as any).window = { // eslint-disable-line @typescript-eslint/no-explicit-any
  document: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getElementById: (_elementId: string) => { return {} as HTMLElement; }
  } as Document
} as Window;

describe('UI Class', () => {
  it('should initialize without throwing', () => {
    expect(() => {
      new UI();
    }).not.toThrow();
  });

  it('UI should be a class or constructor function', () => {
    expect(typeof UI).toBe('function');
  });

  it('UI instance should have expected methods', () => {
    const ui = new UI();
    expect(ui).toBeDefined();
    // Add assertions for expected methods:
    // expect(typeof ui.render).toBe('function');
    // expect(typeof ui.init).toBe('function');
  });
});

describe('LocoBasic syntax highlighting', () => {
  function getWordStyle(word: string, syntax?: ConfigType['syntax']) {
    const mode = LocoBasicMode.getMode(syntax);
    if (!mode.startState) {
      throw new Error('LocoBasic mode must initialize tokenizer state');
    }
    const state = mode.startState();
    const stream = {
      eatSpace: () => false,
      next: () => word[0],
      eat: () => false,
      eatWhile: () => true,
      current: () => word
    } as unknown as StringStream;
    return mode.token(stream, state);
  }

  it.each(['FUNCTION', 'SUB', 'SHARED', 'END', 'IF', 'CALL'])('highlights %s in uppercase and lowercase', (word) => {
    expect(getWordStyle(word)).toBe('keyword');
    expect(getWordStyle(word.toLowerCase())).toBe('keyword');
  });

  it.each(['FUNCTION', 'SUB', 'SHARED'])('highlights %s only in loco20', (word) => {
    for (const spelling of [word, word.toLowerCase()]) {
      expect(getWordStyle(spelling, 'loco20')).toBe('keyword');
      expect(getWordStyle(spelling, 'loco11')).toBe('variable');
    }
  });

  it.each(['END', 'IF', 'CALL', 'PRINT'])('highlights %s in both profiles', (word) => {
    for (const syntax of ['loco11', 'loco20'] as const) {
      expect(getWordStyle(word, syntax)).toBe('keyword');
      expect(getWordStyle(word.toLowerCase(), syntax)).toBe('keyword');
    }
  });

  it.each(['functionName', 'subTotal', 'sharedValue', 'setvec'])('keeps %s highlighted as an identifier', (word) => {
    expect(getWordStyle(word)).toBe('variable');
    expect(getWordStyle(word, 'loco11')).toBe('variable');
  });
});
