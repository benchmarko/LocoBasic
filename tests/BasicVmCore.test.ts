import { describe, it, expect, vi } from 'vitest';
import { BasicVmCore } from '../src/BasicVmCore';

describe('BasicVmCore Module', () => {
    const getMockColors = () => {
        return [...BasicVmCore.getCpcColors()];
    };

    it('should initialize with default values', () => {
        const vm = new BasicVmCore([], []);
        expect(vm.xpos()).toBe(0);
        expect(vm.ypos()).toBe(0);
        expect(vm.getOutput()).toBe('');
    });

    it('should reset correctly', () => {
        const vm = new BasicVmCore([], []);
        vm.setOutput('test');
        vm.tag(true);
        vm.setOutput('graphics test');
        vm.cls();
        expect(vm.getOutput()).toBe('');
        expect(vm.xpos()).toBe(0);
        expect(vm.ypos()).toBe(0);
    });

    it('should set and get output correctly', () => {
        const vm = new BasicVmCore([], []);
        vm.setOutput('Hello, World!');
        expect(vm.getOutput()).toBe('Hello, World!');
    });

    it('should handle graphicsPen changes', () => {
        const vm = new BasicVmCore([], []);
        vm.graphicsPen(1);
        vm.drawMovePlot('M', 100, 200); // trigger output
        expect(vm.flushGraphics()).toContain('<path stroke="#FFFF00"');
    });

    it('should update origin correctly', () => {
        const vm = new BasicVmCore([], []);
        vm.origin(10, 20);
        expect(vm.xpos()).toBe(0);
        expect(vm.ypos()).toBe(0);

        vm.drawMovePlot('M', 100, 200); // trigger output
        expect(vm.flushGraphics()).toContain('<path d="M110 179" />');

        vm.cls();
        vm.tag(true);
        vm.print("test");
        expect(vm.flushGraphics()).toContain('<text x="10" y="395">');
    });

    it('should handle mode changes', () => {
        const vm = new BasicVmCore([], []);
        vm.mode(1);
        vm.drawMovePlot('M', 100, 200); // trigger output
        expect(vm.flushGraphics()).toContain('stroke-width="2px"');

        vm.mode(0);
        vm.drawMovePlot('M', 100, 200); // trigger output
        expect(vm.flushGraphics()).toContain('stroke-width="4px"');
    });

    it('should handle ink changes', () => {
        const vm = new BasicVmCore(getMockColors(), getMockColors());
        vm.ink(1, 5);
        vm.drawMovePlot('M', 100, 200); // trigger output
        expect(vm.flushGraphics()).toContain('path stroke="#8000FF"');
    });

    it('should handle paper changes', () => {
        const vm = new BasicVmCore([], getMockColors());
        vm.paper(2);
        expect(vm.getOutput()).toContain('#00FFFF');
    });

    it('should handle rsx commands', async () => {
        const vm = new BasicVmCore([], []);
        const result = await vm.rsx('time', ['']);
        expect(result[0]).toMatch(/\d{2} \d{2} \d{2}/);
    });

    it('should handle drawMovePlot correctly', () => {
        const vm = new BasicVmCore([], []);
        vm.drawMovePlot('M', 100, 200);
        expect(vm.flushGraphics()).toContain('<path');
    });

    it('should append text to output when isTag is false', () => {
        const vm = new BasicVmCore([], []);
        vm.print('Hello, ', 'World!');
        expect(vm.flushText()).toBe('Hello, World!');
    });

    it('should append multiple calls to output when isTag is false', () => {
        const vm = new BasicVmCore([], []);
        vm.print('Hello');
        vm.print(', ');
        vm.print('World!');
        expect(vm.flushText()).toBe('Hello, World!');
    });

    it('should render text as graphics when isTag is true', () => {
        const vm = new BasicVmCore([], []);
        vm.tag(true);
        vm.print('Graphics Text');
        const graphicsOutput = vm.flushGraphics();
        expect(graphicsOutput).toContain('<text');
        expect(graphicsOutput).toContain('Graphics Text');
    });

    it('should reset output after flushText is called', () => {
        const vm = new BasicVmCore([], []);
        vm.print('Temporary Text');
        expect(vm.flushText()).toBe('Temporary Text');
        expect(vm.flushText()).toBe('');
    });

    it('should handle empty print calls gracefully', () => {
        const vm = new BasicVmCore([], []);
        vm.print();
        expect(vm.flushText()).toBe('');
    });

    it('should render text with correct graphics position when isTag is true', () => {
        const vm = new BasicVmCore([], []);
        vm.tag(true);
        vm.origin(10, 20);
        vm.print('Positioned Text');
        const graphicsOutput = vm.flushGraphics();
        expect(graphicsOutput).toContain('<text x="10" y="395">Positioned Text</text>');
    });

    it('should render text with correct color when graphicsPen is set', () => {
        const vm = new BasicVmCore([], []);
        vm.tag(true);
        vm.graphicsPen(1);
        vm.print('Colored Text');
        const graphicsOutput = vm.flushGraphics();
        expect(graphicsOutput).toContain('<text');
        expect(graphicsOutput).toContain('style="color: #FFFF00"');
        expect(graphicsOutput).toContain('Colored Text');
    });

    it('should not append text to output when isTag is true', () => {
        const vm = new BasicVmCore([], []);
        vm.tag(true);
        vm.print('Graphics Only');
        expect(vm.flushText()).toBe('');
    });

    it('should handle mixed isTag states correctly', () => {
        const vm = new BasicVmCore([], []);
        vm.print('Text Output');
        vm.tag(true);
        vm.print('Graphics Output');
        vm.tag(false);
        vm.print(' More Text');
        expect(vm.flushText()).toBe('Text Output More Text');
        const graphicsOutput = vm.flushGraphics();
        expect(graphicsOutput).toContain('<text');
        expect(graphicsOutput).toContain('Graphics Output');
    });

    describe('BasicVmCore: RSX', () => {
        it('should handle rsx circle command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [100, 200, 50];
            await vm.rsx('circle', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<circle cx="100" cy="199" r="50" />');
        });

        it('should handle rsx filled circle command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [100, 200, 50, 1];
            await vm.rsx('circle', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<circle cx="100" cy="199" r="50" fill="#FFFF00" />');
        });

        it('should handle rsx rect command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [50, 50, 150, 150];
            await vm.rsx('rect', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<rect x="50" y="249" width="100" height="100" />');
        });

        it('should handle rsx filled rect command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [50, 50, 150, 150, 2];
            await vm.rsx('rect', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<rect x="50" y="249" width="100" height="100" fill="#00FFFF" />');
        });

        it('should handle rsx ellipse command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [200, 100, 50, 30];
            await vm.rsx('ellipse', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<ellipse cx="200" cy="299" rx="50" ry="30" />');
        });

        it('should handle rsx filled ellipse command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [200, 100, 50, 30, 3];
            await vm.rsx('ellipse', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<ellipse cx="200" cy="299" rx="50" ry="30" fill="#FF0000" />');
        });

        it('should handle rsx arc command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [100, 100, 50, 50, 0, 1, 1, 150, 150];
            await vm.rsx('arc', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<path d="M100 299 A50 50 0 1 1 150 249" />');
        });

        it('should handle rsx filled arc command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [100, 100, 50, 50, 0, 1, 1, 150, 150, 4];
            await vm.rsx('arc', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<path d="M100 299 A50 50 0 1 1 150 249" fill="#FFFFFF" />');
        });

        it('should handle rsx time command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const result = await vm.rsx('time', ['']);
            expect(result[0]).toMatch(/\d{2} \d{2} \d{2}/);
        });

        it('should handle rsx date command correctly', async () => {
            const vm = new BasicVmCore([], []);
            const result = await vm.rsx('date', ['']);
            expect(result[0]).toMatch(/\d{2} \d{2} \d{2} \d{2}/);
        });

        it('should handle rsx pitch command correctly', async () => {
            const vm = new BasicVmCore([], []);
            await vm.rsx('pitch', [10]);
            expect(vm['pitch']).toBe(1);
            await vm.rsx('pitch', [20]);
            expect(vm['pitch']).toBe(2);
        });

        it('should handle rsx arc command with optional fill correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [100, 100, 50, 50, 0, 1, 1, 150, 150];
            await vm.rsx('arc', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<path d="M100 299 A50 50 0 1 1 150 249" />');
        });

        it('should handle rsx rect command with negative coordinates correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [-50, -50, 50, 50, 2];
            await vm.rsx('rect', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<rect x="-50" y="349" width="100" height="100" fill="#00FFFF" />');
        });

        it('should handle rsx ellipse with zero radius correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [200, 100, 0, 30, 3];
            await vm.rsx('ellipse', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<ellipse cx="200" cy="299" rx="0" ry="30" fill="#FF0000" />');
        });

        it('should handle rsx circle with zero radius correctly', async () => {
            const vm = new BasicVmCore([], []);
            const args = [100, 200, 0, 1];
            await vm.rsx('circle', args);
            const output = vm.flushGraphics();
            expect(output).toContain('<circle cx="100" cy="199" r="0" fill="#FFFF00" />');
        });

        it('should handle rsx pitch with boundary values correctly', async () => {
            const vm = new BasicVmCore([], []);
            await vm.rsx('pitch', [0]);
            expect(vm['pitch']).toBe(0);

            await vm.rsx('pitch', [20]);
            expect(vm['pitch']).toBe(2);
        });

        it('should handle rsx say with empty string correctly', async () => {
            const mockSpeak = vi.fn().mockResolvedValue(undefined);
            const vm = new BasicVmCore([], []);
            vm.setOnSpeak(mockSpeak);
            await vm.rsx('say', ['']);
            expect(mockSpeak).toHaveBeenCalledWith('', 1);
        });

        it('should handle rsx time with invalid arguments correctly', async () => {
            const vm = new BasicVmCore([], []);
            await expect(vm.rsx('time', [123])).rejects.toThrow('|TIME: Wrong argument type (pos 0): number');
        });

        it('should handle rsx date with invalid arguments correctly', async () => {
            const vm = new BasicVmCore([], []);
            await expect(vm.rsx('date', [123])).rejects.toThrow('|DATE: Wrong argument type (pos 0): number');
        });

        it('should handle rsx rect with invalid number of arguments correctly', async () => {
            const vm = new BasicVmCore([], []);
            await expect(vm.rsx('rect', [50, 50])).rejects.toThrow('|RECT: Wrong number of arguments: 2 < 4');
        });

        it('should handle rsx ellipse with invalid argument types correctly', async () => {
            const vm = new BasicVmCore([], []);
            await expect(vm.rsx('ellipse', ['200', 100, 50, 30])).rejects.toThrow('|ELLIPSE: Wrong argument type (pos 0): string');
        });

        it('should handle rsx arc with invalid argument types correctly', async () => {
            const vm = new BasicVmCore([], []);
            await expect(vm.rsx('arc', [100, '100', 50, 50, 0, 1, 1, 150, 150])).rejects.toThrow('|ARC: Wrong argument type (pos 1): string');
        });

        it('should handle rsx circle with invalid argument types correctly', async () => {
            const vm = new BasicVmCore([], []);
            await expect(vm.rsx('circle', [100, 200, '50'])).rejects.toThrow('|CIRCLE: Wrong argument type (pos 2): string');
        });
    });
})

