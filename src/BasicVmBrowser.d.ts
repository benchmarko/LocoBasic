import type { IUI, IVmAdmin, SnippetDataType } from "./Interfaces";
export declare class BasicVmBrowser implements IVmAdmin {
    private readonly ui;
    private readonly vmCore;
    reset: () => void;
    drawMovePlot: (type: string, x: number, y: number) => void;
    graphicsPen: (num: number) => void;
    ink: (num: number, col: number) => void;
    origin: (x: number, y: number) => void;
    printGraphicsText: (text: string) => void;
    rsx: (cmd: string, args: (number | string)[]) => Promise<(number | string)[]>;
    xpos: () => number;
    ypos: () => number;
    getSnippetData: () => SnippetDataType;
    getColorForPen: (n: number, isPaper?: boolean) => string;
    constructor(ui: IUI);
    cls(): void;
    flush(): void;
    inkey$(): Promise<string>;
    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    private fnOnInput;
    input(msg: string): Promise<string | null>;
    mode(num: number): void;
    private fnOnSpeak;
    getEscape(): boolean;
}
//# sourceMappingURL=BasicVmBrowser.d.ts.map