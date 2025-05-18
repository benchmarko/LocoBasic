import { IUI, IVmAdmin, TimerMapType } from "./Interfaces";
export declare class BasicVmBrowser implements IVmAdmin {
    private readonly ui;
    private readonly vmCore;
    constructor(ui: IUI);
    reset(): void;
    cls(): void;
    drawMovePlot(type: string, x: number, y: number): void;
    fnOnPrint(msg: string): void;
    flush(): void;
    graphicsPen(num: number): void;
    ink(num: number, col: number): void;
    inkey$(): Promise<string>;
    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    private fnOnInput;
    input(msg: string): Promise<string | null>;
    mode(num: number): void;
    origin(x: number, y: number): void;
    paper(n: number): void;
    pen(n: number): void;
    print(...args: string[]): void;
    private fnOnSpeak;
    rsx(cmd: string, args: (number | string)[]): Promise<(number | string)[]>;
    tag(active: boolean): void;
    xpos(): number;
    ypos(): number;
    getEscape(): boolean;
    getTimerMap(): TimerMapType;
    getOutput(): string;
    setOutput(str: string): void;
}
//# sourceMappingURL=BasicVmBrowser.d.ts.map