import { describe, it, expect, vi } from 'vitest';
import type { INodeParts } from "../src//Interfaces";
import { BasicVmNode } from '../src/BasicVmNode';
import { BasicVmCore } from '../src/BasicVmCore';

describe('BasicVmNode Module', () => {
    const getInSvg = (content: string, strokeWidth = '2px') => {
        return BasicVmCore.getTagInSvg(content, strokeWidth, "");
    }

    const getMockNodeParts = () => {
        return {
            getEscape: vi.fn(),
            getKeyFromBuffer: vi.fn(),
            consoleClear: vi.fn(),
            consolePrint: vi.fn()
        } as INodeParts;
    };

    it('should clear the console when cls is called', () => {
        const mockNodeParts = getMockNodeParts();
        const basicVmNode = new BasicVmNode(mockNodeParts);

        basicVmNode.cls();
        expect(mockNodeParts.consoleClear).toHaveBeenCalled();
    });

    it('should flush text output', () => {
        const mockNodeParts = getMockNodeParts();
        const basicVmNode = new BasicVmNode(mockNodeParts);

        basicVmNode.print("Test Output");
        basicVmNode.flush();
        expect(mockNodeParts.consolePrint).toHaveBeenCalledWith("Test Output");

        basicVmNode.print("newLine\n");
        basicVmNode.flush();
        expect(mockNodeParts.consolePrint).toHaveBeenCalledWith("newLine"); // trailing newline removed
    });

    it('should flush graphics output', () => {
        const mockNodeParts = getMockNodeParts();
        const basicVmNode = new BasicVmNode(mockNodeParts);

        basicVmNode.drawMovePlot("P", 10, 20);
        basicVmNode.flush();
        expect(mockNodeParts.consolePrint).toHaveBeenCalledWith(getInSvg('<path d="M10 379h1v1h-1v-1" />').replace(/\n$/, ""));
    });

    it('should return a key from the buffer when inkey$ is called', async () => {
        const mockNodeParts = getMockNodeParts();
        mockNodeParts.getKeyFromBuffer = vi.fn().mockReturnValue("A");
        const basicVmNode = new BasicVmNode(mockNodeParts);

        const key = await basicVmNode.inkey$();
        expect(key).toBe('A');
    });

    it('should clear the console when mode is called', () => {
        const mockNodeParts = getMockNodeParts();
        const basicVmNode = new BasicVmNode(mockNodeParts);

        basicVmNode.mode(2);
        expect(mockNodeParts.consoleClear).toHaveBeenCalled();
    });

    it('should get and set output', () => {
        const basicVmNode = new BasicVmNode(getMockNodeParts());

        basicVmNode.setOutput('Output');
        const output = basicVmNode.getOutput();
        expect(output).toBe('Output');
    });
});
