import { describe, it, expect } from 'vitest';
import { BasicVmCore } from '../src/BasicVmCore';

describe('BasicVmCore Module', () => {
    it('should initialize with default values', () => {
        const vm = new BasicVmCore([], []);
        expect(vm.xpos()).toBe(0);
        expect(vm.ypos()).toBe(0);
        expect(vm.getOutput()).toBe('');
    });

    it('should reset correctly', () => {
        const vm = new BasicVmCore([], []);
        vm.setOutput('test');
        vm.cls();
        expect(vm.getOutput()).toBe('');
        expect(vm.xpos()).toBe(0);
        expect(vm.ypos()).toBe(0);
    });
});