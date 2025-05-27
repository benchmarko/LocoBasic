import { describe, it, expect } from 'vitest';
import { BasicVmCore } from '../src/BasicVmCore';

describe('BasicVmCore Module', () => {
    const getInSvg = (content: string, strokeWidth = '2px') => {
        return BasicVmCore.getTagInSvg(content, strokeWidth, "");
    }

    const getMockColors = (paper?: boolean) => {
        return [...BasicVmCore.getCpcColors()].map((c) => `[${paper ? "paper" : "pen"}:${c}]`);
    };

    //const getPaperColors = () => getMockColors(true);
    //const getPenColors = () => getMockColors(false);

    it('should initialize with default values', () => {
        const vm = new BasicVmCore([], []);
        expect(vm.xpos()).toBe(0);
        expect(vm.ypos()).toBe(0);
    });

    it('should reset correctly', () => {
        const vm = new BasicVmCore([], []);
        vm.printGraphicsText('test');
        vm.printGraphicsText('graphics test');
        vm.cls();
        //expect(vm.getOutput()).toBe(''); //TTT
        expect(vm.xpos()).toBe(0);
        expect(vm.ypos()).toBe(0);
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
        vm.printGraphicsText("test  this");
        expect(vm.flushGraphics()).toBe(getInSvg('<text x="10" y="395" style="white-space: pre">test  this</text>'));
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

    it('should render graphics text', () => {
        const vm = new BasicVmCore([], []);
        vm.printGraphicsText('Graphics Text');
        expect(vm.flushGraphics()).toBe(getInSvg('<text x="0" y="415" style="white-space: pre">Graphics Text</text>'));
    });

    it('should render graphics text with correct graphics position', () => {
        const vm = new BasicVmCore([], []);
        vm.origin(10, 20);
        vm.printGraphicsText('Positioned Text');
        expect(vm.flushGraphics()).toBe(getInSvg('<text x="10" y="395" style="white-space: pre">Positioned Text</text>'));
    });

    it('should render graphics text with correct color when graphicsPen is set', () => {
        const vm = new BasicVmCore([], []);
        vm.graphicsPen(1);
        vm.printGraphicsText('Colored Text');
        expect(vm.flushGraphics()).toBe(getInSvg('<text x="0" y="415" style="white-space: pre; color: #FFFF00">Colored Text</text>'));
    });

    it('should handle rsx circle command correctly', async () => {
        const vm = new BasicVmCore([], []);
        const args = [100, 200, 50];
        await vm.rsx('circle', args);
        expect(vm.flushGraphics()).toBe(getInSvg('<circle cx="100" cy="199" r="50" />'));
    });
})
