// Script creator for standalone scripts (complied script + worker function)
export class ScriptCreator {
    constructor(debug) {
        this.debug = debug;
    }
    // Build dependency map by analyzing vm properties
    analyzeDependencies(vmObj, regexPrefix) {
        const depMap = {};
        for (const key in vmObj) {
            const deps = [];
            const value = vmObj[key];
            const valueStr = String(value);
            // Find all <prefix>propertyName references (default prefix: vm.)
            const regex = new RegExp(`${regexPrefix}([\\w$]+)`, "g");
            let match;
            while ((match = regex.exec(valueStr)) !== null) {
                const refProp = match[1];
                if (!deps.includes(refProp)) {
                    // cls manages state directly; don't include its private references as dependencies
                    if (key === "cls" && refProp.startsWith("_")) {
                        continue;
                    }
                    deps.push(refProp);
                }
            }
            depMap[key] = deps;
        }
        return depMap;
    }
    ;
    // Calculate transitive closure of dependencies
    getTransitiveDeps(usedFunctions, depMap) {
        const result = new Set(usedFunctions);
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
    filterVM(vmObj, usedFunctions, regexPrefix) {
        const depMap = this.analyzeDependencies(vmObj, regexPrefix);
        if (this.debug) {
            const allKeys = Object.keys(vmObj);
            for (const fn of usedFunctions) {
                if (!allKeys.includes(fn)) {
                    console.warn(`Warning: Function '${fn}' does not exist in vm object`);
                }
            }
        }
        // Get transitive closure
        const includeKeys = this.getTransitiveDeps(usedFunctions, depMap);
        // Build set of private properties that are actually referenced by included functions
        const referencedPrivateProps = new Set();
        for (const key of Array.from(includeKeys)) {
            const deps = depMap[key] || [];
            for (const dep of deps) {
                if (dep.startsWith("_")) {
                    referencedPrivateProps.add(dep);
                }
            }
        }
        // Remove private properties that are NOT referenced by any included function
        includeKeys.forEach(key => {
            if (key.startsWith("_") && !referencedPrivateProps.has(key)) {
                includeKeys.delete(key);
            }
        });
        // Build filtered object (maintain original vm order)
        const filtered = {};
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
    createParentPort(isTerminal) {
        const parentPort = {
            // Dummy message handler
            onMessageHandler: (data) => {
                console.log("onMessageHandler called with:", data);
            },
            // This method will be stringified into the standalone script
            on: isTerminal ? function (_event, messageHandler) {
                this.onMessageHandler = messageHandler;
                this.onMessageHandler({
                    type: "config",
                    isTerminal: true
                });
            } : function (_event, messageHandler) {
                this.onMessageHandler = messageHandler;
                this.onMessageHandler({
                    type: "config",
                    isTerminal: false
                });
            },
            // This method will be stringified into the standalone script
            postMessage(data) {
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
                    case 'inputKeys':
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
        };
        return parentPort;
    }
    // Generate source code for filtered vm object
    generateSource(vmObj) {
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
    compiledCodeInFrame(compiledScript, workerFnString, isTerminal) {
        const parentPort = this.createParentPort(isTerminal);
        const parentFns = [];
        const ensureNamedObjectMethod = (methodName, fnStr) => {
            if (fnStr.startsWith("function")) {
                return `${methodName}${fnStr.substring("function".length)}`;
            }
            return fnStr;
        };
        parentFns.push(ensureNamedObjectMethod("on", String(parentPort.on)));
        parentFns.push(ensureNamedObjectMethod("postMessage", String(parentPort.postMessage)));
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
    createStandaloneScript(workerFn, compiledScript, usedInstr, regexPrefix = "vm\\.", isTerminal = true) {
        const mockParent = {
            on: () => undefined,
            postMessage: () => undefined,
        };
        const vmObj = workerFn.workerFn(mockParent);
        const filteredVM = this.filterVM(vmObj, [...usedInstr, "flush", "onMessageHandler"], regexPrefix);
        const workerString = this.generateSource(filteredVM);
        const inFrame = this.compiledCodeInFrame(compiledScript, workerString, isTerminal);
        return inFrame;
    }
}
//# sourceMappingURL=ScriptCreator.js.map