import { IUI, IVmAdmin, TimerMapType } from "./Interfaces";
import { BasicVmCore } from "./BasicVmCore";

export class BasicVmBrowser implements IVmAdmin {
    private readonly ui: IUI;
    private readonly vmCore: BasicVmCore;

    constructor(ui: IUI) {
        this.ui = ui;
        const cpcColors = BasicVmCore.getCpcColors();
        const penColors = cpcColors.map((color) => ui.getColor(color, false));
        const paperColors = cpcColors.map((color) => ui.getColor(color, true));
        this.vmCore = new BasicVmCore(penColors, paperColors);
        this.vmCore.setOnSpeak(this.fnOnSpeak.bind(this));
    }

    public cls(): void {
        this.vmCore.cls();
        this.ui.setOutputText("");
    }

    public drawMovePlot(type: string, x: number, y: number): void {
        this.vmCore.drawMovePlot(type, x, y);
    }

    public fnOnPrint(msg: string): void {
        this.ui.addOutputText(msg);
    }

    public flush(): void {
        const textOutput = this.vmCore.flushText();
        if (textOutput) {
            this.fnOnPrint(textOutput);
        }
        const graphicsOutput = this.vmCore.flushGraphics();
        if (graphicsOutput) {
            this.fnOnPrint(graphicsOutput);
        }
    }

    public graphicsPen(num: number): void {
        this.vmCore.graphicsPen(num);
    }

    public ink(num: number, col: number) {
        this.vmCore.ink(num, col);
    }
    
    public inkey$(): Promise<string> {
        const key = this.ui.getKeyFromBuffer();
        return Promise.resolve(key);
    }

    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    private async fnOnInput(msg: string): Promise<string | null> {
        const input = this.ui.prompt(msg);
        return Promise.resolve(input);
    }

    public input(msg: string): Promise<string | null> {
        this.flush();
        return this.fnOnInput(msg);
    }

    public mode(num: number): void {
        this.vmCore.mode(num);
        this.ui.setOutputText("");
    }

    public origin(x: number, y: number): void {
        this.vmCore.origin(x, y);
    }

    public paper(n: number): void {
        this.vmCore.paper(n);
    }

    public pen(n: number): void {
        this.vmCore.pen(n);
    }

    public print(...args: string[]): void {
        this.vmCore.print(...args);
    }

    private async fnOnSpeak(text: string, pitch: number): Promise<void> {
        return this.ui.speak(text, pitch);
    }

    public async rsx(cmd: string, args: (number | string)[]): Promise<(number | string)[]> {
        return this.vmCore.rsx(cmd, args);
    }

    public tag(active: boolean): void {
        this.vmCore.tag(active);
    }

    public xpos(): number {
        return this.vmCore.xpos();
    }

    public ypos(): number {
        return this.vmCore.ypos();
    }

    public getEscape(): boolean {
        return this.ui.getEscape();
    }

    public getTimerMap(): TimerMapType {
        return this.vmCore.getTimerMap();
    }

    public getOutput(): string {
        return this.vmCore.getOutput();
    }
    public setOutput(str: string): void {
        this.vmCore.setOutput(str);
    }
}
