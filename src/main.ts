import type { ExampleType, ICore, IUI } from "./Interfaces";
import { Core } from "./Core";
import { NodeParts } from "./NodeParts";

interface WindowProperties {
    cpcBasic: {
        addIndex: (dir: string, input: Record<string, ExampleType[]> | (() => void)) => void,
        addItem: (key: string, input: string | (() => void)) => void
    };
    locobasicUI: {
        UI: {
            new(): IUI
        }
    };
    locoVmWorker: {
        workerFn: () => unknown
    }
    onload: (event: Event) => void;
}

declare const window: WindowProperties | undefined;

const core: ICore = new Core({
    action: "compile,run",
    autoCompile: true,
    autoExecute: true,
    databaseDirs: "examples", // example base directories (comma separated)
    database: "examples", // examples, apps, saved
    debounceCompile: 800,
    debounceExecute: 400,
    debug: 0,
    example: "locobas",
    fileName: "",
    grammar: "basic", // basic or strict
    input: "",
    showBasic: true,
    showCompiled: false,
    showOutput: true
});

if (typeof window !== "undefined") {
    window.onload = () => {
        const UI = window.locobasicUI.UI; // we expect that it is already loaded in the HTML page
        const workerFn = window.locoVmWorker.workerFn; // we expect that it is already loaded in the HTML page
        const ui = new UI();
        window.cpcBasic = {
            addIndex: core.addIndex,
            addItem: (key: string, input: string | (() => void)) => {
                if (!key) { // maybe ""
                    key = ui.getCurrentDataKey();
                }
                core.addItem(key, input);
            }
        };
        ui.onWindowLoadContinue(core, workerFn);
    };
} else { // node.js
    new NodeParts().nodeMain(core);
}
