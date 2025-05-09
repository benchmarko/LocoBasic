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

    const basicVmBrowser = new BasicVmBrowser(mockUI);

    it('should clear the output text when fnOnCls is called', () => {
        basicVmBrowser.cls();
        expect(mockUI.setOutputText).toHaveBeenCalledWith('');
    });

    it('should prompt the user and return input when fnOnInput is called', async () => {
        const input = await basicVmBrowser.input('Enter something:');
        expect(mockUI.prompt).toHaveBeenCalledWith('Enter something:');
        expect(input).toBe('User input for: Enter something:');
    });

    it('should add a message to the output text when fnOnPrint is called', () => {
        basicVmBrowser.fnOnPrint('Hello, world!');
        expect(mockUI.addOutputText).toHaveBeenCalledWith('Hello, world!');
    });

    /*
    it('should call speak with the correct parameters when fnOnSpeak is called', async () => {
        await basicVmBrowser.fnOnSpeak('Hello', 1);
        expect(mockUI.speak).toHaveBeenCalledWith('Hello', 1);
    });
    */

    it('should return a key from the buffer when inkey$ is called', async () => {
        const key = await basicVmBrowser.inkey$();
        expect(mockUI.getKeyFromBuffer).toHaveBeenCalled();
        expect(key).toBe('mockKey');
    });

    it('should return the escape status when getEscape is called', () => {
        const escape = basicVmBrowser.getEscape();
        expect(mockUI.getEscape).toHaveBeenCalled();
        expect(escape).toBe(false);
    });
});