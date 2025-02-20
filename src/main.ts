import type { ICore, IUI } from "./Interfaces";
import { Core } from "./Core";
import { NodeParts } from "./NodeParts";
import { BasicVmBrowser } from "./BasicVmBrowser";

interface WindowProperties {
    cpcBasic: {
        addItem: (key: string, input: string | (() => void)) => void
    };
    locobasicUI: {
        UI: {
            new(): IUI
        }
    };
    onload: (event: Event) => void;
}

declare const window: WindowProperties | undefined;

const core: ICore = new Core({
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
        core.setVm(new BasicVmBrowser(ui));
        ui.onWindowLoadContinue(core);
    };
} else { // node.js
    new NodeParts().nodeMain(core);
}
