import { describe, it, expect } from 'vitest';
import { BasicVmCore } from '../src/BasicVmCore';

describe('BasicVmCore Module', () => {
    const getInSvg = (content: string, strokeWidth = '2px') => {
        return BasicVmCore.getTagInSvg(content, strokeWidth, "");
    }

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
        vm.drawMovePlot('M', 100, 200);
        expect(vm.flushGraphics()).toBe(getInSvg('<path stroke="#FFFF00" d="M100 199" />'));
    });

    it('should handle origin', () => {
        const vm = new BasicVmCore([], []);
        vm.origin(10, 20);
        expect(vm.xpos()).toBe(0);
        expect(vm.ypos()).toBe(0);

        vm.drawMovePlot('M', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M210 279" />'));

        vm.cls();
        vm.tag(true);
        vm.print("test");
        expect(vm.flushGraphics()).toBe(getInSvg('<text x="10" y="395">test</text>'));
    });

    it('should handle mode changes', () => {
        const vm = new BasicVmCore([], []);

        vm.mode(0);
        vm.drawMovePlot('M', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M200 299" />', '4px'));

        vm.mode(1);
        vm.drawMovePlot('M', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M200 299" />'));

        vm.mode(2);
        vm.drawMovePlot('M', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M200 299" />', '1px'));

        vm.mode(3);
        vm.drawMovePlot('M', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M200 299" />', '1px'));
    });

    it('should handle ink changes', () => {
        const vm = new BasicVmCore(getMockColors(), getMockColors());
        vm.ink(1, 5);
        vm.drawMovePlot('M', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path stroke="#8000FF" d="M200 299" />'));
    });

    it('should handle paper changes', () => {
        const vm = new BasicVmCore([], getMockColors());
        vm.paper(2);
        expect(vm.getOutput()).toBe('#00FFFF');
    });

    it('should handle rsx commands', async () => {
        const vm = new BasicVmCore([], []);
        const result = await vm.rsx('time', ['']);
        expect(result[0]).toMatch(/\d{2} \d{2} \d{2}/);
    });

    it('should handle drawMovePlot correctly', () => {
        const vm = new BasicVmCore([], []);

        vm.drawMovePlot('M', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M200 299" />'));
        expect(vm.xpos()).toBe(200);
        expect(vm.ypos()).toBe(100);

        vm.drawMovePlot('m', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M200 299m200 -100" />'));
        expect(vm.xpos()).toBe(400);
        expect(vm.ypos()).toBe(200);

        vm.drawMovePlot('P', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M200 299h1v1h-1v-1" />'));
        expect(vm.xpos()).toBe(200);
        expect(vm.ypos()).toBe(100);

        vm.drawMovePlot('p', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M200 299m200 -100h1v1h-1v-1" />'));
        expect(vm.xpos()).toBe(400);
        expect(vm.ypos()).toBe(200);

        vm.drawMovePlot('L', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M400 199L200 299" />'));
        expect(vm.xpos()).toBe(200);
        expect(vm.ypos()).toBe(100);

        vm.drawMovePlot('l', 200, 100);
        expect(vm.flushGraphics()).toBe(getInSvg('<path d="M200 299l200 -100" />'));
        expect(vm.xpos()).toBe(400);
        expect(vm.ypos()).toBe(200);
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
        expect(vm.flushGraphics()).toBe(getInSvg('<text x="0" y="415">Graphics Text</text>'));
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
        expect(vm.flushGraphics()).toBe(getInSvg('<text x="10" y="395">Positioned Text</text>'));
    });

    it('should render text with correct color when graphicsPen is set', () => {
        const vm = new BasicVmCore([], []);
        vm.tag(true);
        vm.graphicsPen(1);
        vm.print('Colored Text');
        expect(vm.flushGraphics()).toBe(getInSvg('<text x="0" y="415" style="color: #FFFF00">Colored Text</text>'));
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
        expect(vm.flushGraphics()).toBe(getInSvg('<text x="0" y="415">Graphics Output</text>'));
    });

    it('should handle rsx circle command correctly', async () => {
        const vm = new BasicVmCore([], []);
        const args = [100, 200, 50];
        await vm.rsx('circle', args);
        expect(vm.flushGraphics()).toBe(getInSvg('<circle cx="100" cy="199" r="50" />'));
    });
})
