import { describe, it, expect } from 'vitest';
import { UI } from '../src/UI/UI';
//import path from 'path';

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
