import { Core } from "./Core";
import { NodeParts } from "./NodeParts";
import { BasicVmBrowser } from "./BasicVmBrowser";
const core = new Core({
    action: "compile,run",
    databaseDirs: "examples,https://benchmarko.github.io/CPCBasicApps/rosetta", // example base directories (comma separated)
    database: "examples", // examples, apps, saved
    debug: 0,
    example: "",
    fileName: "",
    grammar: "basic", // basic or strict
    input: "",
    debounceCompile: 800,
    debounceExecute: 400
});
if (typeof window !== "undefined") {
    window.onload = () => {
        const UI = window.locobasicUI.UI; // we expect that it is already loaded in the HTML page
        const ui = new UI();
        window.cpcBasic = {
            addIndex: core.addIndex,
            addItem: (key, input) => {
                if (!key) { // maybe ""
                    key = ui.getCurrentDataKey();
                }
                core.addItem(key, input);
            }
        };
        ui.onWindowLoadContinue(core, new BasicVmBrowser(ui));
    };
}
else { // node.js
    new NodeParts().nodeMain(core);
}
//# sourceMappingURL=main.js.map