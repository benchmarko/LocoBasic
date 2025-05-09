import { describe, it, expect, vi } from 'vitest';
import { BasicVmNode } from '../src/BasicVmNode';

const getMockVmCore = () => {
    return {
        cls: vi.fn(),
        drawMovePlot: vi.fn(),
        getOutput: vi.fn().mockReturnValue(''),
        setOutput: vi.fn(),
        flushGraphics: vi.fn().mockReturnValue(''),
        flushText: vi.fn().mockReturnValue(''),
        graphicsPen: vi.fn(),
        ink: vi.fn(),
        mode: vi.fn(),
        origin: vi.fn(),
        paper: vi.fn(),
        pen: vi.fn(),
        print: vi.fn(),
        rsx: vi.fn().mockResolvedValue([]),
        tag: vi.fn(),
        xpos: vi.fn().mockReturnValue(0),
        ypos: vi.fn().mockReturnValue(0),
        getTimerMap: vi.fn().mockReturnValue({})
    }
};

let mockVmCore = getMockVmCore();

// mock the BasicVmCore import
vi.mock('../src/BasicVmCore', () => ({
    BasicVmCore: vi.fn(() => mockVmCore),
}));

describe('BasicVmNode Module', () => {
    const getMocks = () => {
        mockVmCore = getMockVmCore();
        const mockNodeParts = {
            getKeyFromBuffer: vi.fn().mockReturnValue(''),
            getEscape: vi.fn().mockReturnValue(false),
        };

        const basicVmNode = new BasicVmNode(mockNodeParts);
        return { basicVmNode, mockVmCore, mockNodeParts };
    };

    it('should clear the screen when cls is called', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        const consoleClearSpy = vi.spyOn(console, 'clear').mockImplementation(() => { });

        basicVmNode.cls();

        expect(mockVmCore.cls).toHaveBeenCalled();
        expect(consoleClearSpy).toHaveBeenCalled();

        consoleClearSpy.mockRestore();
    });

    it('should call drawMovePlot with correct arguments', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.drawMovePlot('line', 10, 20);

        expect(mockVmCore.drawMovePlot).toHaveBeenCalledWith('line', 10, 20);
    });

    it('should flush text output', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        mockVmCore.flushText.mockReturnValue('Test Output');
        const printSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        basicVmNode.flush();

        expect(printSpy).toHaveBeenCalledWith('Test Output');

        printSpy.mockRestore();
    });

    it('should flush graphics output', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        mockVmCore.flushGraphics.mockReturnValue('Graphics Output');
        const printSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        basicVmNode.flush();

        expect(printSpy).toHaveBeenCalledWith('Graphics Output');

        printSpy.mockRestore();
    });

    it('should set graphics pen color', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.graphicsPen(5);

        expect(mockVmCore.graphicsPen).toHaveBeenCalledWith(5);
    });

    it('should set ink color', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.ink(1, 10);

        expect(mockVmCore.ink).toHaveBeenCalledWith(1, 10);
    });

    it('should return a key from the buffer', async () => {
        const { basicVmNode, mockNodeParts } = getMocks();
        mockNodeParts.getKeyFromBuffer.mockReturnValue('A');

        const key = await basicVmNode.inkey$();

        expect(key).toBe('A');
    });

    it('should handle input messages', async () => {
        const { basicVmNode } = getMocks();
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        const result = await basicVmNode.input('Enter value:');

        expect(consoleLogSpy).toHaveBeenCalledWith('Enter value:');
        expect(result).toBe('');

        consoleLogSpy.mockRestore();
    });

    it('should set mode', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.mode(2);

        expect(mockVmCore.mode).toHaveBeenCalledWith(2);
    });

    it('should set origin', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.origin(10, 20);

        expect(mockVmCore.origin).toHaveBeenCalledWith(10, 20);
    });

    it('should set paper color', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.paper(3);

        expect(mockVmCore.paper).toHaveBeenCalledWith(3);
    });

    it('should set pen color', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.pen(4);

        expect(mockVmCore.pen).toHaveBeenCalledWith(4);
    });

    it('should print text', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.print('Hello', 'World');

        expect(mockVmCore.print).toHaveBeenCalledWith('Hello', 'World');
    });

    it('should execute RSX command', async () => {
        const { basicVmNode, mockVmCore } = getMocks();
        mockVmCore.rsx.mockResolvedValue(['Result']);

        const result = await basicVmNode.rsx('CMD', [1, 'arg']);

        expect(mockVmCore.rsx).toHaveBeenCalledWith('CMD', [1, 'arg']);
        expect(result).toEqual(['Result']);
    });

    it('should toggle tag', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.tag(true);

        expect(mockVmCore.tag).toHaveBeenCalledWith(true);
    });

    it('should return X position', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        mockVmCore.xpos.mockReturnValue(42);

        const xpos = basicVmNode.xpos();

        expect(xpos).toBe(42);
    });

    it('should return Y position', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        mockVmCore.ypos.mockReturnValue(24);

        const ypos = basicVmNode.ypos();

        expect(ypos).toBe(24);
    });

    it('should return escape status', () => {
        const { basicVmNode, mockNodeParts } = getMocks();
        mockNodeParts.getEscape.mockReturnValue(true);

        const escape = basicVmNode.getEscape();

        expect(escape).toBe(true);
    });

    it('should return timer map', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        const timerMap = { timer1: 1000 };
        mockVmCore.getTimerMap.mockReturnValue(timerMap);

        const result = basicVmNode.getTimerMap();

        expect(result).toEqual(timerMap);
    });

    it('should get and set output', () => {
        const { basicVmNode, mockVmCore } = getMocks();
        basicVmNode.setOutput('New Output');

        expect(mockVmCore.setOutput).toHaveBeenCalledWith('New Output');

        mockVmCore.getOutput.mockReturnValue('New Output');

        const output = basicVmNode.getOutput();

        expect(output).toBe('New Output');
    });
});