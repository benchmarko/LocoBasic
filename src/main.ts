import type { ICore, IUI } from "./Interfaces";
import { Core } from "./Core";
import { NodeParts } from "./NodeParts";
import { BasicVmBrowser } from "./BasicVmBrowser";
import { BasicVmNode } from "./BasicVmNode";

interface WindowProperties {
    cpcBasic: {
        addItem: (key: string, input: string | (() => void)) => void
    };
    location: {
        search: string
    };
    locobasicUI: {
        UI: {
            new(core: ICore): IUI
        }
    };
    onload: (event: Event) => void;
    prompt: (msg: string) => string;
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
        const ui = new UI(core);
        core.setVm(new BasicVmBrowser(ui));

        const config = core.getConfigObject();
        const args = ui.parseUri(window.location.search.substring(1), config);
        core.parseArgs(args, config);

        core.setOnCheckSyntax((s: string) => Promise.resolve(ui.checkSyntax(s)));
        ui.onWindowLoad(new Event("onload"));
    };
} else { // node.js
    const nodeParts = new NodeParts(core);
    core.setVm(new BasicVmNode(nodeParts));
    core.parseArgs(global.process.argv.slice(2), core.getConfigObject());
    nodeParts.nodeMain();
}
