// main.ts
//
// Usage:
// node dist/locobasic.js [action='compile,run'] [input=<statements>] [example=<name>] [fileName=<file>] [grammar=<name>] [debug=0] [debounceCompile=800] [debounceExecute=400]
//
// - Examples for compile and run:
// node dist/locobasic.js input='PRINT "Hello!"'
// npx ts-node dist/locobasic.js input='PRINT "Hello!"'
// node dist/locobasic.js input="?3 + 5 * (2 - 8)"
// node dist/locobasic.js example=euler
// node dist/locobasic.js fileName=dist/examples/example.bas
// node dist/locobasic.js grammar="strict" input='a$="Bob":PRINT "Hello ";a$;"!"'
//
// - Example for compile only:
// node dist/locobasic.js action='compile' input='PRINT "Hello!"' > hello1.js
//   [Windows: Use node.exe when redirecting into a file; or npx ts-node ...]
// node hello1.js
// [When using async functions like FRAME or INPUT, redirect to hello1.mjs]
//
import { Core } from "./Core";
import { NodeParts } from "./NodeParts";
import { BasicVmBrowser } from "./BasicVmBrowser";
import { BasicVmNode } from "./BasicVmNode";
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
        const UI = window.locobasicUI.UI; // we expaect that it is already loaded in the html page
        const ui = new UI(core);
        core.setVm(new BasicVmBrowser(ui));
        const config = core.getConfigObject();
        const args = ui.parseUri(window.location.search.substring(1), config);
        core.parseArgs(args, config);
        core.setOnCheckSyntax((s) => Promise.resolve(ui.checkSyntax(s)));
        ui.onWindowLoad(new Event("onload"));
    };
}
else { // node.js
    core.setVm(new BasicVmNode());
    core.parseArgs(global.process.argv.slice(2), core.getConfigObject());
    const nodeParts = new NodeParts(core);
    nodeParts.nodeMain();
}
//# sourceMappingURL=main.js.map