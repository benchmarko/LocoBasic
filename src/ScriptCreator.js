// Script creator for standalone scripts (complied script + worker function)
export class ScriptCreator {
    constructor(debug) {
        this.debug = debug;
    }
    /**
     * Scans vm object for function references (dependencies)
     * Returns a map of function names to their dependencies and positions
     */
    scanVmFunctionReferences(workerFnString) {
        const result = {
            functions: new Map(),
            vmObjectStart: -1,
            vmObjectEnd: -1
        };
        // Find vm object boundaries
        const vmObjectStart = workerFnString.indexOf('const vm = {');
        if (vmObjectStart === -1) {
            return result;
        }
        // Find the closing brace of vm object (need to match braces properly)
        let braceCount = 0;
        let vmObjectEnd = -1;
        let inString = false;
        let stringChar = '';
        let foundOpenBrace = false;
        for (let i = vmObjectStart + 11; i < workerFnString.length; i += 1) {
            const ch = workerFnString[i];
            const prevCh = i > 0 ? workerFnString[i - 1] : '';
            // Handle string literals
            if ((ch === '"' || ch === '`' || ch === "'") && prevCh !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = ch;
                }
                else if (ch === stringChar) {
                    inString = false;
                }
            }
            if (!inString) {
                if (ch === '{') {
                    if (!foundOpenBrace) {
                        foundOpenBrace = true;
                    }
                    braceCount++;
                }
                else if (ch === '}') {
                    braceCount--;
                    if (foundOpenBrace && braceCount === 0) {
                        vmObjectEnd = i;
                        break;
                    }
                }
            }
        }
        if (vmObjectEnd === -1) {
            return result;
        }
        result.vmObjectStart = vmObjectStart;
        result.vmObjectEnd = vmObjectEnd;
        const vmObjectStr = workerFnString.substring(vmObjectStart, vmObjectEnd + 1);
        // Pattern to match: key: [async] (...) => {
        const funcPattern = /([\w$]+)\s*:\s*(async\s+)?\([^)]*\)\s*=>\s*\{/g;
        let match;
        while ((match = funcPattern.exec(vmObjectStr)) !== null) {
            const funcName = match[1];
            const isAsync = !!match[2];
            const startPos = match.index + match[0].length;
            // Find matching closing brace for this function
            let braceCount = 1;
            let endPos = startPos;
            let inString = false;
            let stringChar = '';
            for (let i = startPos; i < vmObjectStr.length && braceCount > 0; i++) {
                const ch = vmObjectStr[i];
                const prevCh = i > 0 ? vmObjectStr[i - 1] : '';
                // Handle string literals
                if ((ch === '"' || ch === '`' || ch === "'") && prevCh !== '\\') {
                    if (!inString) {
                        inString = true;
                        stringChar = ch;
                    }
                    else if (ch === stringChar) {
                        inString = false;
                    }
                }
                if (!inString) {
                    if (ch === '{')
                        braceCount++;
                    else if (ch === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            endPos = i + 1; //vmObjectStart + match.index + match[0].length + i;
                        }
                    }
                }
            }
            const functionBody = vmObjectStr.substring(startPos, endPos);
            // Extract all vm.xxx references in the function body
            const deps = new Set();
            const vmRefPattern = /vm\.(\w+)/g;
            let vmMatch;
            while ((vmMatch = vmRefPattern.exec(functionBody)) !== null) {
                const refName = vmMatch[1];
                // Do not add self-references
                if (refName !== funcName) {
                    deps.add(refName);
                }
            }
            result.functions.set(funcName, {
                startPos: vmObjectStart + match.index,
                endPos: vmObjectStart + endPos,
                async: isAsync,
                deps
            });
        }
        return result;
    }
    /**
     * Filters worker function string to remove unused vm functions
     * based on the instruction map from compilation
     */
    filterWorkerFnString(workerFnString, usedInstrMap) {
        if (!usedInstrMap || Object.keys(usedInstrMap).length === 0) {
            return workerFnString;
        }
        const scanResult = this.scanVmFunctionReferences(workerFnString);
        if (this.debug) {
            let output = "";
            console.log("Scanning Standalone Worker Function...\n");
            const scanResult = this.scanVmFunctionReferences(workerFnString);
            output += `/*\nScanned functions: ${scanResult.functions.size}\n`;
            for (const [funcName, funcInfo] of scanResult.functions) {
                output += `// Function: ${funcName}, async: ${funcInfo.async}, deps: [${[...funcInfo.deps].join(", ")}], startPos: ${funcInfo.startPos}, endPos: ${funcInfo.endPos}, body:\n${workerFnString.substring(funcInfo.startPos, funcInfo.endPos)}\n`;
            }
            output += `\n*/\n`;
            console.log(output);
        }
        const vmFunctionMap = scanResult.functions;
        if (vmFunctionMap.size === 0) {
            return workerFnString;
        }
        // Build set of functions to keep using breadth-first search (transitive closure)
        const functionsToKeep = new Set();
        const queue = Object.keys(usedInstrMap);
        while (queue.length > 0) {
            const funcName = queue.shift();
            if (!funcName || functionsToKeep.has(funcName))
                continue;
            functionsToKeep.add(funcName);
            const funcInfo = vmFunctionMap.get(funcName);
            if (funcInfo) {
                for (const dep of funcInfo.deps) {
                    if (!functionsToKeep.has(dep) && vmFunctionMap.has(dep)) {
                        queue.push(dep);
                    }
                }
            }
        }
        // Collect positions to remove, sorted in descending order
        const functionsToRemove = [];
        for (const [funcName, funcInfo] of vmFunctionMap.entries()) {
            if (!functionsToKeep.has(funcName)) {
                functionsToRemove.push({
                    startPos: funcInfo.startPos,
                    endPos: funcInfo.endPos
                });
            }
        }
        // Sort by position (descending) so we can remove from end to start
        functionsToRemove.sort((a, b) => b.startPos - a.startPos);
        // Apply removals from end to start to preserve positions
        let result = workerFnString;
        for (const removal of functionsToRemove) {
            // Find the actual end position including trailing comma/whitespace
            let endPos = removal.endPos;
            // Look for trailing comma and/or whitespace
            while (endPos < result.length && /[,\s\n\r]/.test(result[endPos])) {
                endPos++;
            }
            result = result.substring(0, removal.startPos) + result.substring(endPos);
        }
        return result;
    }
    createParentPort() {
        const parentPort = new class {
            constructor() {
                // Dummy message handler
                this.onMessageHandler = (data) => {
                    console.log("onMessageHandler called with:", data);
                };
            }
            // This method will be stringified into the standalone script
            on(_event, messageHandler) {
                this.onMessageHandler = messageHandler;
                this.onMessageHandler({
                    type: "config",
                    isTerminal: true
                });
            }
            // This method will be stringified into the standalone script
            postMessage(data) {
                switch (data.type) {
                    case 'frame':
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
                            prompt: ""
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
        };
        return parentPort;
    }
    compiledCodeInFrame(compiledScript, workerFnString) {
        const asyncStr = compiledScript.includes("await ") ? "async " : ""; // fast hack: check if we need async function
        const parentPort = this.createParentPort();
        let postMessageStr = String(parentPort.postMessage);
        // replace indentation
        postMessageStr = postMessageStr.replace(/\n\s{12}/g, "\n");
        let onStr = String(parentPort.on);
        onStr = onStr.replace(/\n\s{12}/g, "\n");
        const inFrame = `(${asyncStr}function(_o) {
    ${compiledScript}
})(
    (${workerFnString})({
        ${onStr},
        ${postMessageStr}
    })
);`;
        return inFrame;
    }
    createStandaloneScript(workerString, compiledScript, usedInstrMap) {
        if (Object.keys(usedInstrMap).length > 0) {
            workerString = this.filterWorkerFnString(workerString, usedInstrMap);
        }
        const inFrame = this.compiledCodeInFrame(compiledScript, workerString);
        return inFrame;
    }
}
//# sourceMappingURL=ScriptCreator.js.map