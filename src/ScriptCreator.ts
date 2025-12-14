// Script creator for standalone scripts (complied script + worker function)

import { MessageFromWorker, MessageToWorker, NodeWorkerFnType, NodeWorkerThreadsType, VMObject } from "./Interfaces";

export class ScriptCreator {
    private debug: number;

    constructor(debug: number) {
        this.debug = debug;
    }

    // Build dependency map by analyzing vm properties
    analyzeDependencies(vmObj: VMObject): Record<string, string[]> {
        const depMap: Record<string, string[]> = {};

        for (const key in vmObj) {
            const value = vmObj[key];
            const valueStr = String(value);
            const deps: string[] = [];

            // Find all vm.propertyName references
            const regex = /vm\.([\w$]+)/g;
            let match;
            while ((match = regex.exec(valueStr)) !== null) {
                const refProp = match[1];
                if (!deps.includes(refProp)) {
                    deps.push(refProp);
                }
            }

            depMap[key] = deps;
        }
        return depMap;
    };

    // Calculate transitive closure of dependencies
    getTransitiveDeps(usedFunctions: string[], depMap: Record<string, string[]>): Set<string> {
        const result = new Set<string>(usedFunctions);
        let changed = true;

        while (changed) {
            changed = false;
            for (const fn of Array.from(result)) {
                const deps = depMap[fn] || [];
                for (const dep of deps) {
                    if (!result.has(dep)) {
                        result.add(dep);
                        changed = true;
                    }
                }
            }
        }

        return result;
    }

    // Filter vm object based on used functions
    filterVM(vmObj: VMObject, usedFunctions: string[]): Partial<VMObject> {
        const depMap = this.analyzeDependencies(vmObj);

        if (this.debug) {
            const allKeys = Object.keys(vmObj);
            for (const fn of usedFunctions) {
                if (!allKeys.includes(fn)) {
                    console.warn(
                        `Warning: Function '${fn}' does not exist in vm object`
                    );
                }
            }
        }

        // Get transitive closure
        const includeKeys = this.getTransitiveDeps(usedFunctions, depMap);

        // Build filtered object (maintain original vm order)
        const filtered: Partial<VMObject> = {};
        for (const key in vmObj) {
            if (includeKeys.has(key)) {
                filtered[key] = vmObj[key];
            }
        }

        if (this.debug >= 2) {
            console.log(`Filtered VM object, included keys: [${Array.from(includeKeys).join(", ")}]`);
        }

        return filtered;
    }

    private createParentPort(): NodeWorkerThreadsType["parentPort"] {
        const parentPort = new class {
            // Dummy message handler
            onMessageHandler: (data: MessageToWorker) => void = (data: MessageToWorker) => {
                console.log("onMessageHandler called with:", data);
            }

            // This method will be stringified into the standalone script
            on(_event: string, messageHandler: (data: MessageToWorker) => void) {
                this.onMessageHandler = messageHandler;
                this.onMessageHandler({
                    type: "config",
                    isTerminal: true
                });
            }

            // This method will be stringified into the standalone script
            postMessage(data: MessageFromWorker) {
                switch (data.type) {
                    case 'flush':
                        if (data.needCls) {
                            console.clear();
                        }
                        console.log(data.message);
                        break;
                    case 'geolocation':
                        this.onMessageHandler({
                            type: "continue",
                            result: ""
                        });
                        break;
                    case 'input':
                        console.log(data.prompt);
                        this.onMessageHandler({
                            type: "input",
                            input: ""
                        });
                        break;
                    case 'keyDef':
                        break;
                    case 'result':
                        break;
                    case 'speak':
                        this.onMessageHandler({
                            type: "continue",
                            result: ""
                        });
                        break;
                    default:
                        console.error("postMessageHandler: Unknown message type:", data);
                        break;

                }
            }
        }
        return parentPort;
    }

    // Generate source code for filtered vm object
    generateSource(vmObj: Partial<VMObject>): string {
        const indent = " ".repeat(8); 
        let output = "";

        const keys = Object.keys(vmObj);
        for (const [index, key] of keys.entries()) {
            const value = vmObj[key];
            const comma = index === keys.length - 1 ? "" : ",";
            const valueStr = typeof value === "function" ? String(value) : JSON.stringify(value);
            output += `${indent}${key}: ${valueStr}${comma}\n`;
        }
        return output;
    }

    private compiledCodeInFrame(compiledScript: string, workerFnString: string) {
        const parentPort = this.createParentPort();
        const parentFns: string[] = [];

        parentFns.push(String(parentPort.on));
        parentFns.push(String(parentPort.postMessage));

        // replace indentation
        const parentPortStr = parentFns.map((fnStr) => fnStr.replace(/\n\s{12}/g, "\n")).join(",\n    ");

        const inFrame = `(async (_o) => {
    ${compiledScript}
})(
    ((parentPort) => {
        const vm = {
${workerFnString}
        };
        parentPort.on('message', (data) => vm.onMessageHandler(data));
        globalThis.LocoBasicVm = vm;
        return vm;
    })({
    ${parentPortStr}
    })
).then((result) => {
    globalThis.LocoBasicVm.flush();
});`;
        return inFrame;
    }

    public createStandaloneScript(workerFn: NodeWorkerFnType, compiledScript: string, usedInstr: string[]) {
        const mockParent = {
            on: () => undefined,
            postMessage: () => undefined,
        };
        const vmObj = workerFn.workerFn(mockParent);
        const filteredVM = this.filterVM(vmObj as VMObject, [...usedInstr, "flush", "onMessageHandler"]);
        const workerString = this.generateSource(filteredVM);

        const inFrame = this.compiledCodeInFrame(compiledScript, workerString);
        return inFrame;
    }
}
