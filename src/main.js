import { Core } from "./Core";
import { NodeParts } from "./NodeParts";
import { BasicVmBrowser } from "./BasicVmBrowser";
const core = new Core({
    action: "compile,run",
    debug: 0,
    example: "",
    fileName: "",
    grammar: "basic", // basic or strict
    input: "",
    debounceCompile: 800,
    debounceExecute: 400
});
if (typeof window !== "undefined") {
    window.cpcBasic = { addItem: core.addItem };
    window.onload = () => {
        const UI = window.locobasicUI.UI; // we expect that it is already loaded in the HTML page
        const ui = new UI();
        ui.onWindowLoadContinue(core, new BasicVmBrowser(ui));
    };
}
else { // node.js
    new NodeParts().nodeMain(core);
}
//# sourceMappingURL=main.js.map