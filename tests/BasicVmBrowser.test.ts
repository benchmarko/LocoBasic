import { describe, it, expect, vi } from 'vitest';
import { BasicVmBrowser } from '../src/BasicVmBrowser';
import { IUI } from '../src/Interfaces';

describe('BasicVmBrowser Module', () => {
    const mockUI: IUI = {
        getColor: vi.fn((color, isPaper) => `${color}-${isPaper ? 'paper' : 'pen'}`),
        setOutputText: vi.fn(),
        prompt: vi.fn((msg) => `User input for: ${msg}`),
        addOutputText: vi.fn(),
        speak: vi.fn(),
        getKeyFromBuffer: vi.fn(() => 'mockKey'),
        getEscape: vi.fn(() => false),
        getCurrentDataKey: vi.fn(() => 'mockDataKey'),
        onWindowLoadContinue: vi.fn(),
        checkSyntax: vi.fn((code: string) => Promise.resolve(code)),
    };

    it('should clear the output text when fnOnCls is called', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        basicVmBrowser.cls();
        expect(mockUI.setOutputText).toHaveBeenCalledWith('');
    });

    it('should prompt the user and return input when fnOnInput is called', async () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const input = await basicVmBrowser.input('Enter something:');
        expect(mockUI.prompt).toHaveBeenCalledWith('Enter something:');
        expect(input).toBe('User input for: Enter something:');
    });

    it('should add a message to the output text when fnOnPrint is called', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        basicVmBrowser.fnOnPrint('Hello, world!');
        expect(mockUI.addOutputText).toHaveBeenCalledWith('Hello, world!');
    });

    it('should return a key from the buffer when inkey$ is called', async () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const key = await basicVmBrowser.inkey$();
        expect(mockUI.getKeyFromBuffer).toHaveBeenCalled();
        expect(key).toBe('mockKey');
    });

    it('should return the escape status when getEscape is called', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const escape = basicVmBrowser.getEscape();
        expect(mockUI.getEscape).toHaveBeenCalled();
        expect(escape).toBe(false);
    });

    it('should flush text and graphics output correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const mockTextOutput = 'Text output';
        const mockGraphicsOutput = '<svg>Graphics output</svg>';
        vi.spyOn(basicVmBrowser['vmCore'], 'flushText').mockReturnValue(mockTextOutput);
        vi.spyOn(basicVmBrowser['vmCore'], 'flushGraphics').mockReturnValue(mockGraphicsOutput);

        basicVmBrowser.flush();

        expect(mockUI.addOutputText).toHaveBeenCalledWith(mockTextOutput);
        expect(mockUI.addOutputText).toHaveBeenCalledWith(mockGraphicsOutput);
    });

    it('should set graphics pen correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const graphicsPenSpy = vi.spyOn(basicVmBrowser['vmCore'], 'graphicsPen');
        basicVmBrowser.graphicsPen(2);
        expect(graphicsPenSpy).toHaveBeenCalledWith(2);
    });

    it('should set ink correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const inkSpy = vi.spyOn(basicVmBrowser['vmCore'], 'ink');
        basicVmBrowser.ink(1, 5);
        expect(inkSpy).toHaveBeenCalledWith(1, 5);
    });

    it('should set mode correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const modeSpy = vi.spyOn(basicVmBrowser['vmCore'], 'mode');
        basicVmBrowser.mode(1);
        expect(modeSpy).toHaveBeenCalledWith(1);
    });

    it('should set origin correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const originSpy = vi.spyOn(basicVmBrowser['vmCore'], 'origin');
        basicVmBrowser.origin(10, 20);
        expect(originSpy).toHaveBeenCalledWith(10, 20);
    });

    it('should set paper correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const paperSpy = vi.spyOn(basicVmBrowser['vmCore'], 'paper');
        basicVmBrowser.paper(3);
        expect(paperSpy).toHaveBeenCalledWith(3);
    });

    it('should set pen correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const penSpy = vi.spyOn(basicVmBrowser['vmCore'], 'pen');
        basicVmBrowser.pen(4);
        expect(penSpy).toHaveBeenCalledWith(4);
    });

    it('should print text correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const printSpy = vi.spyOn(basicVmBrowser['vmCore'], 'print');
        basicVmBrowser.print('Hello', 'World');
        expect(printSpy).toHaveBeenCalledWith('Hello', 'World');
    });

    it('should execute RSX commands correctly', async () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const rsxSpy = vi.spyOn(basicVmBrowser['vmCore'], 'rsx').mockResolvedValue(['result']);
        const result = await basicVmBrowser.rsx('circle', [100, 200, 50]);
        expect(rsxSpy).toHaveBeenCalledWith('circle', [100, 200, 50]);
        expect(result).toEqual(['result']);
    });

    it('should toggle tag state correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const tagSpy = vi.spyOn(basicVmBrowser['vmCore'], 'tag');
        basicVmBrowser.tag(true);
        expect(tagSpy).toHaveBeenCalledWith(true);
    });

    it('should return correct X position', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const xposSpy = vi.spyOn(basicVmBrowser['vmCore'], 'xpos').mockReturnValue(100);
        const xpos = basicVmBrowser.xpos();
        expect(xposSpy).toHaveBeenCalled();
        expect(xpos).toBe(100);
    });

    it('should return correct Y position', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const yposSpy = vi.spyOn(basicVmBrowser['vmCore'], 'ypos').mockReturnValue(200);
        const ypos = basicVmBrowser.ypos();
        expect(yposSpy).toHaveBeenCalled();
        expect(ypos).toBe(200);
    });

    it('should return correct timer map', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const timerMapSpy = vi.spyOn(basicVmBrowser['vmCore'], 'getTimerMap').mockReturnValue({});
        const timerMap = basicVmBrowser.getTimerMap();
        expect(timerMapSpy).toHaveBeenCalled();
        expect(timerMap).toEqual({});
    });

    it('should get and set output correctly', () => {
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const getOutputSpy = vi.spyOn(basicVmBrowser['vmCore'], 'getOutput').mockReturnValue('output');
        const setOutputSpy = vi.spyOn(basicVmBrowser['vmCore'], 'setOutput');

        const output = basicVmBrowser.getOutput();
        expect(getOutputSpy).toHaveBeenCalled();
        expect(output).toBe('output');

        basicVmBrowser.setOutput('new output');
        expect(setOutputSpy).toHaveBeenCalledWith('new output');
    });

});
