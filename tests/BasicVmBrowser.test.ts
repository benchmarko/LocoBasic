import { describe, it, expect, vi } from 'vitest';
import { BasicVmBrowser } from '../src/BasicVmBrowser';
import { BasicVmCore } from '../src/BasicVmCore';
import type { IUI } from '../src/Interfaces';

describe('BasicVmBrowser Module', () => {

    const getInSvg = (content: string, strokeWidth = '2px') => {
        return BasicVmCore.getTagInSvg(content, strokeWidth, "");
    }

    const getMockUI = () => {
        return {
            addOutputText: vi.fn(),
            checkSyntax: vi.fn((code: string) => Promise.resolve(code)),
            getColor: vi.fn((color, isPaper) => `${color}-${isPaper ? 'paper' : 'pen'}`),
            getCurrentDataKey: vi.fn(),
            getEscape: vi.fn(() => false),
            getKeyFromBuffer: vi.fn(() => ''),
            onWindowLoadContinue: vi.fn(),
            setOutputText: vi.fn(),
            prompt: vi.fn(),
            speak: vi.fn()
        } as IUI;
    };

    it('should clear the output text when cls is called', () => {
        const mockUI = getMockUI();
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        basicVmBrowser.cls();
        expect(mockUI.setOutputText).toHaveBeenCalledWith('');
    });

    it('should prompt the user and return input when input is called', async () => {
        const mockUI = getMockUI();
        mockUI.prompt = vi.fn((msg) => `User input for: ${msg}`);
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const input = await basicVmBrowser.input('Enter something:');
        expect(mockUI.prompt).toHaveBeenCalledWith('Enter something:');
        expect(input).toBe('User input for: Enter something:');
    });

    it('should return a key from the buffer when inkey$ is called', async () => {
        const mockUI = getMockUI();
        mockUI.getKeyFromBuffer = vi.fn().mockReturnValue("A");
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const key = await basicVmBrowser.inkey$();
        expect(key).toBe("A");
    });

    it('should return the escape status when getEscape is called', () => {
        const mockUI = getMockUI();
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const escape = basicVmBrowser.getEscape();
        expect(mockUI.getEscape).toHaveBeenCalled();
        expect(escape).toBe(false);
    });

    it('should flush text output correctly', () => {
        const mockUI = getMockUI();
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        const snippetData = basicVmBrowser.getSnippetData();
        snippetData.output = "Hello";

        basicVmBrowser.flush();

        expect(mockUI.addOutputText).toHaveBeenCalledWith("Hello");
    });

    it('should flush graphics output correctly', () => {
        const mockUI = getMockUI();
        const basicVmBrowser = new BasicVmBrowser(mockUI);

        basicVmBrowser.drawMovePlot("P", 10, 20);
        basicVmBrowser.flush();

        expect(mockUI.addOutputText).toHaveBeenCalledWith(getInSvg('<path d="M10 379h1v1h-1v-1" />'));
    });

    /*
    it('should clear the output text when mode is called', () => {
        const mockUI = getMockUI();
        const basicVmBrowser = new BasicVmBrowser(mockUI);
        basicVmBrowser.mode(2);
        expect(mockUI.setOutputText).toHaveBeenCalledWith('');
    });
    */
});
