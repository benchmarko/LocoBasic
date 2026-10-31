import { afterEach, describe, it, expect, vi } from 'vitest'
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


describe('Program key controls', () => {
  interface MockElement {
    children: MockElement[];
    hidden: boolean;
    disabled: boolean;
    type: string;
    textContent: string;
    title: string;
    readonly childElementCount: number;
    appendChild(child: MockElement): number;
    replaceChildren(): void;
    querySelectorAll(selector: string): MockElement[];
    setAttribute(name: string, value: string): Map<string, string>;
    getAttribute(name: string): string | null;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  }

  function mockElement(): MockElement {
    const attributes = new Map<string, string>();
    const children: MockElement[] = [];
    return {
      children,
      hidden: true,
      disabled: false,
      type: '',
      textContent: '',
      title: '',
      get childElementCount() { return children.length; },
      appendChild: (child: ReturnType<typeof mockElement>) => children.push(child),
      replaceChildren: () => { children.length = 0; },
      querySelectorAll: () => children,
      setAttribute: (name: string, value: string) => attributes.set(name, value),
      getAttribute: (name: string) => attributes.get(name) ?? null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
  }

  function createUi() {
    const elements: Record<string, ReturnType<typeof mockElement>> = {};
    vi.stubGlobal('window', {
      document: {
        getElementById: (name: string) => elements[name] ??= mockElement(),
        createElement: () => mockElement()
      }
    });
    const ui = new UI() as unknown as {
      compiledSource: string;
      beforeExecute(): void;
      afterExecute(): void;
      onUserKeyClick(event: Event): void;
      putKeysInBuffer(keys: string): void;
    };
    return { ui, keys: elements.userKeys };
  }

    afterEach(() => {
    vi.restoreAllMocks();
    //vi.unstubAllGlobals();
  });
 
  it('renders metadata as text with visible and accessible labels', () => {
    const { ui, keys } = createUi();
    ui.compiledSource = 'REM CPCBasic-keys: ["<","","&","",32,"Space",13,"Enter",240,"\\u2191",0,"Code 0"]';
    ui.beforeExecute();
    expect(keys.hidden).toBe(false);
    expect(keys.children.map(button => button.textContent)).toEqual(['<', '&', 'Space', 'Enter', '\u2191', 'Code 0']);
    expect(keys.children[4].getAttribute('aria-label')).toBe('\u2191'); //'Arrow Up'
    expect(keys.children[5].getAttribute('data-key')).toBe('0');
    expect(keys.children.every(button => button.type === 'button')).toBe(true);
  });
});


describe('User key declarations', () => {
  it('reads characters and CPC codes in declaration order', () => {
    const parseUserKeys = new UI().testGetMethods().parseUserKeys;
    expect(parseUserKeys('REM CPCBasic-keys: ["a","","d",""," ","",13,"",240,"",0,"",255,""]')).toEqual(
      [97, 100, 32, 13, 240, 0, 255].map(code => ({ code, text: "" }))
    );
  });

  it('supports numbered, indented, and apostrophe comments case-insensitively', () => {
    const parseUserKeys = new UI().testGetMethods().parseUserKeys;
    expect(parseUserKeys('  10 rem cpcbasic-keys: ["a","a"]\r\n20\'CPCBasic-keys: [44,44,"1","1"]\n\' CPCBasic-keys: ["x","x"]')).toEqual(
      [97, 44, 49, 120].map(code => ({ code, text: String.fromCharCode(code) }))
    );
  });

  it('ignores declarations inside statements, strings, and ordinary comments', () => {
    const parseUserKeys = new UI().testGetMethods().parseUserKeys;
    const keystring = 'CPCBasic-keys: [13,"E"]';
    expect(parseUserKeys(`REM ${keystring}`)).toEqual([{ code: 13, text: "E"}]);

    expect(parseUserKeys(`PRINT "${keystring}"\nPRINT 1: ${keystring}\nREM example ${keystring}`)).toEqual([]);
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
