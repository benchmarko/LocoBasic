// BasicVmBrowser.ts

import { IUI } from "./Interfaces";
import { BasicVmCore } from "./BasicVmCore";

export class BasicVmBrowser extends BasicVmCore {
    private readonly ui: IUI;
    private readonly penColors: string[];
    private readonly paperColors: string[];

    constructor(ui: IUI) {
        super();
        this.ui = ui;
        const colorsForPens = this.getColorsForPens();
        this.penColors = ui.getPenColors(colorsForPens);
        this.paperColors = ui.getPaperColors(colorsForPens);
    }

    public fnOnCls() {
        this.ui.setOutputText("");
    }

    public fnOnPrint(msg: string) {
        this.ui.addOutputText(msg);
    }

    public fnOnPrompt(msg: string) {
        const input = this.ui.prompt(msg)
        return input;
    }

    public fnGetPenColor(num: number) {
        return this.penColors[num];
    }

    public fnGetPaperColor(num: number) {
        return this.paperColors[num];
    }
}
