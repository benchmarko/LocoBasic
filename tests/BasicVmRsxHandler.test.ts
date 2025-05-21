import { describe, it, expect, vi } from 'vitest';
import type { IVmRsxApi } from "../src/Interfaces";
import { BasicVmRsxHandler } from "../src/BasicVmRsxHandler";

describe('BasicVmRsxHandler', () => {
    const getMockBasicVmCore = () => {
        return {
            addGraphicsElement: vi.fn(),
            flushGraphics: vi.fn(),
            getGraphicsPen: vi.fn(() => -1),
            getRgbColorStringForPen: vi.fn((p: number) => ["", "#FFFF00", "#00FFFF", "#FF0000", "#FFFFFF"][p])
        } as IVmRsxApi;
    };

    it('should handle rsx circle command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const args = [100, 200, 50];
        await rsxHandler.rsx('circle', args);
        expect(api.addGraphicsElement).toHaveBeenCalledWith('<circle cx="100" cy="199" r="50" />');
    });

    it('should handle rsx filled circle command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const args = [100, 200, 50, 1];
        await rsxHandler.rsx('circle', args);
        expect(api.addGraphicsElement).toHaveBeenCalledWith('<circle cx="100" cy="199" r="50" fill="#FFFF00" />');
    });

    it('should handle rsx circle with invalid argument types correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        await expect(rsxHandler.rsx('circle', [100, 200, '50'])).rejects.toThrow('|CIRCLE: Wrong argument type (pos 2): string');
    });

    it('should handle rsx rect command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const args = [50, 50, 150, 150];
        await rsxHandler.rsx('rect', args);
        expect(api.addGraphicsElement).toHaveBeenCalledWith('<rect x="50" y="249" width="100" height="100" />');

        const args2 = [-50, -50, 150, 150];
        await rsxHandler.rsx('rect', args2);
        expect(api.addGraphicsElement).toHaveBeenCalledWith('<rect x="-50" y="249" width="200" height="200" />');
    });

    it('should handle rsx filled rect command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const args = [50, 50, 150, 150, 2];
        await rsxHandler.rsx('rect', args);
        expect(api.addGraphicsElement).toHaveBeenCalledWith('<rect x="50" y="249" width="100" height="100" fill="#00FFFF" />');
    });

    it('should handle rsx rect with invalid number of arguments correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        await expect(rsxHandler.rsx('rect', [50, 50])).rejects.toThrow('|RECT: Wrong number of arguments: 2 < 4');
    });

    it('should handle rsx ellipse command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const args = [200, 100, 50, 30];
        await rsxHandler.rsx('ellipse', args);
        expect(api.addGraphicsElement).toHaveBeenCalledWith('<ellipse cx="200" cy="299" rx="50" ry="30" />');
    });

    it('should handle rsx filled ellipse command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const args = [200, 100, 50, 30, 3];
        await rsxHandler.rsx('ellipse', args);
        expect(api.addGraphicsElement).toHaveBeenCalledWith('<ellipse cx="200" cy="299" rx="50" ry="30" fill="#FF0000" />');
    });

    it('should handle rsx ellipse with invalid argument types correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        await expect(rsxHandler.rsx('ellipse', ['200', 100, 50, 30])).rejects.toThrow('|ELLIPSE: Wrong argument type (pos 0): string');
    });

    it('should handle rsx arc command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const args = [100, 100, 50, 50, 0, 1, 1, 150, 150];
        await rsxHandler.rsx('arc', args);
        expect(api.addGraphicsElement).toHaveBeenCalledWith('<path d="M100 299 A50 50 0 1 1 150 249" />');
    });

    it('should handle rsx filled arc command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const args = [100, 100, 50, 50, 0, 1, 1, 150, 150, 4];
        await rsxHandler.rsx('arc', args);
        expect(api.addGraphicsElement).toHaveBeenCalledWith('<path d="M100 299 A50 50 0 1 1 150 249" fill="#FFFFFF" />');
    });

    it('should handle rsx arc with invalid argument types correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        await expect(rsxHandler.rsx('arc', [100, '100', 50, 50, 0, 1, 1, 150, 150])).rejects.toThrow('|ARC: Wrong argument type (pos 1): string');
    });

    it('should handle rsx time command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const result = await rsxHandler.rsx('time', ['']);
        expect(result[0]).toMatch(/\d{2} \d{2} \d{2}/);
    });

    it('should handle rsx time with invalid arguments correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        await expect(rsxHandler.rsx('time', [123])).rejects.toThrow('|TIME: Wrong argument type (pos 0): number');
    });

    it('should handle rsx date command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const result = await rsxHandler.rsx('date', ['']);
        expect(result[0]).toMatch(/\d{2} \d{2} \d{2} \d{2}/);
    });

    it('should handle rsx date with invalid arguments correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        await expect(rsxHandler.rsx('date', [123])).rejects.toThrow('|DATE: Wrong argument type (pos 0): number');
    });

    it('should handle rsx pitch command correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        await rsxHandler.rsx('pitch', [0]);
        expect(rsxHandler['pitch']).toBe(0);

        await rsxHandler.rsx('pitch', [10]);
        expect(rsxHandler['pitch']).toBe(1);

        await rsxHandler.rsx('pitch', [20]);
        expect(rsxHandler['pitch']).toBe(2);
    });

    it('should handle rsx say with empty string correctly', async () => {
        const api = getMockBasicVmCore();
        const rsxHandler = new BasicVmRsxHandler(api);
        const mockSpeak = vi.fn().mockResolvedValue(undefined);
        rsxHandler.setOnSpeak(mockSpeak);
        await rsxHandler.rsx('say', ['']);
        expect(mockSpeak).toHaveBeenCalledWith('', 1);
    });
});
