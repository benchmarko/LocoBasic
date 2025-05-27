import type { IUI, IVmAdmin, SnippetDataType } from "./Interfaces";
import { BasicVmCore } from "./BasicVmCore";

export class BasicVmBrowser implements IVmAdmin {
    private readonly ui: IUI;
    private readonly vmCore: BasicVmCore;

    public reset: () => void;
    public drawMovePlot: (type: string, x: number, y: number) => void;
    public graphicsPen: (num: number) => void;
    public ink: (num: number, col: number) => void;
    public origin: (x: number, y: number) => void;
    public printGraphicsText: (text: string) => void;
    public rsx: (cmd: string, args: (number | string)[]) => Promise<(number | string)[]>;
    public xpos: () => number;
    public ypos: () => number;
    public getSnippetData: () => SnippetDataType;
    public getColorForPen: (n: number, isPaper?: boolean) => string;

    constructor(ui: IUI) {
        this.ui = ui;
        const cpcColors = BasicVmCore.getCpcColors();
        const penColors = cpcColors.map((color) => ui.getColor(color, false));
        const paperColors = cpcColors.map((color) => ui.getColor(color, true));
        this.vmCore = new BasicVmCore(penColors, paperColors);
        this.vmCore.setOnSpeak(this.fnOnSpeak.bind(this));

        this.reset = this.vmCore.reset.bind(this.vmCore);
        this.drawMovePlot = this.vmCore.drawMovePlot.bind(this.vmCore);
        this.graphicsPen = this.vmCore.graphicsPen.bind(this.vmCore);
        this.ink = this.vmCore.ink.bind(this.vmCore);
        this.origin = this.vmCore.origin.bind(this.vmCore);
        this.printGraphicsText = this.vmCore.printGraphicsText.bind(this.vmCore);
        this.rsx = this.vmCore.rsx.bind(this.vmCore);
        this.xpos = this.vmCore.xpos.bind(this.vmCore);
        this.ypos = this.vmCore.ypos.bind(this.vmCore);
        this.getSnippetData = this.vmCore.getSnippetData.bind(this.vmCore);
        this.getColorForPen = this.vmCore.getColorForPen.bind(this.vmCore);
    }

    public cls(): void {
        this.vmCore.cls();
        this.ui.setOutputText("");
    }

    public flush(): void {
        //const textOutput = this.vmCore.flushText();
        const snippetData = this.getSnippetData();
        if (snippetData.output) {
            this.ui.addOutputText(snippetData.output);
            snippetData.output = "";
        }
        const graphicsOutput = this.vmCore.flushGraphics();
        if (graphicsOutput) {
            this.ui.addOutputText(graphicsOutput);
        }
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
        //this.ui.setOutputText("");
    }

    private async fnOnSpeak(text: string, pitch: number): Promise<void> {
        return this.ui.speak(text, pitch);
    }

    public getEscape(): boolean {
        return this.ui.getEscape();
    }
}
