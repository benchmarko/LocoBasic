import { IVmRsxApi } from "./Interfaces";
export declare class BasicVmRsxHandler {
    private core;
    private pitch;
    private fnOnSpeak;
    constructor(core: IVmRsxApi);
    reset(): void;
    setOnSpeak(fn: (text: string, pitch: number) => Promise<void>): void;
    private getStrokeAndFillStr;
    private rsxArc;
    private rsxCircle;
    private rsxDate;
    private rsxEllipse;
    private rsxRect;
    private rsxPitch;
    private rsxSay;
    private rsxTime;
    private rsxMap;
    rsx(cmd: string, args: (number | string)[]): Promise<(number | string)[]>;
}
//# sourceMappingURL=BasicVmRsxHandler.d.ts.map