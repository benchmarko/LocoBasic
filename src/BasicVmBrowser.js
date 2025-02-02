// BasicVmBrowser.ts
import { BasicVmCore } from "./BasicVmCore";
export class BasicVmBrowser extends BasicVmCore {
    constructor(ui) {
        super();
        this.ui = ui;
        const colorsForPens = this.getColorsForPens();
        this.penColors = ui.getPenColors(colorsForPens);
        this.paperColors = ui.getPaperColors(colorsForPens);
    }
    fnOnCls() {
        this.ui.setOutputText("");
    }
    fnOnPrint(msg) {
        this.ui.addOutputText(msg);
    }
    fnOnPrompt(msg) {
        const input = this.ui.prompt(msg);
        return input;
    }
    fnGetPenColor(num) {
        return this.penColors[num];
    }
    fnGetPaperColor(num) {
        return this.paperColors[num];
    }
}
//# sourceMappingURL=BasicVmBrowser.js.map