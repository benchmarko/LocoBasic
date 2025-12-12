// Script creator for standalone scripts (complied script + worker function)

import type { MessageFromWorker, MessageToWorker, NodeWorkerThreadsType } from "./Interfaces";

export class ScriptCreator {
    private debug: number;

    constructor(debug: number) {
        this.debug = debug;
    }

    private scanBoundaries(mainString: string, startPos: number): { startPos: number; endPos: number } {
        // Find opening and closing braces of function or object (need to match braces properly)
        let endPos = -1;
        let braceCount = 0;
        let inString = false;
        let stringChar = '';
        let foundOpenBrace = false;

        //for (let i = startPos + searchString.length; i < mainString.length && (!foundOpenBrace || braceCount > 0); i += 1) {
        for (let i = startPos; i < mainString.length && (!foundOpenBrace || braceCount > 0); i += 1) {
            const ch = mainString[i];
            const prevCh = i > 0 ? mainString[i - 1] : '';

            // Handle string literals
            if ((ch === '"' || ch === '`' || ch === "'") && prevCh !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = ch;
                } else if (ch === stringChar) {
                    inString = false;
                }
            }

            if (!inString) {
                if (ch === '{') {
                    if (!foundOpenBrace) {
                        foundOpenBrace = true;
                    }
                    braceCount++;
                } else if (ch === '}') {
                    braceCount--;
                    if (foundOpenBrace && braceCount === 0) {
                        endPos = i;
                    }
                }
            }
        }
        return { startPos, endPos };
    }

    private scanFunctionOrObjectBoundaries(mainString: string, searchString: string): { startPos: number; endPos: number } {
        // Find function or object boundaries
        const startPos = mainString.indexOf(searchString);
        if (startPos === -1) {
            const endPos = -1;
            return { startPos, endPos };
        }
        return this.scanBoundaries(mainString, startPos + searchString.length);
    }

    /**
     * Scans vm object for function references (dependencies)
     * Returns a map of function names to their dependencies and positions
     */
    private scanVmFunctionReferences(workerFnString: string, objectString: string, refPrefix: string): {
        functions: Map<string, { startPos: number; endPos: number; async: boolean; deps: Set<string> }>;
        vmObjectStart: number;
        vmObjectEnd: number;
    } {

        // Find vm object boundaries
        const { startPos: vmObjectStart, endPos: vmObjectEnd } = this.scanFunctionOrObjectBoundaries(workerFnString, objectString); // e.g. 'const vm = '

        const result = {
            functions: new Map<string, { startPos: number; endPos: number; async: boolean; deps: Set<string> }>(),
            vmObjectStart,
            vmObjectEnd
        };

        if (vmObjectStart < 0 || vmObjectEnd < 0) {
            return result;
        }

        result.vmObjectStart = vmObjectStart;
        result.vmObjectEnd = vmObjectEnd;

        const vmObjectStr = workerFnString.substring(vmObjectStart, vmObjectEnd + 1);

        // Pattern to match: key: [async] (...) => {
        const funcPattern = /([\w$]+)\s*:\s*(async\s+)?\([^)]*\)\s*=>\s*\{/g;
        const vmRefPattern = new RegExp(`${refPrefix}\\.([\\w$]+)`, "g"); // e.g. vm\.(\w+)
        let match;

        while ((match = funcPattern.exec(vmObjectStr)) !== null) {
            const funcName = match[1];
            const isAsync = Boolean(match[2]);
            const startPos = match.index + match[0].length;
            const { endPos } = this.scanBoundaries(vmObjectStr, startPos - 1); // -1 to include the opening brace

            const functionBody = vmObjectStr.substring(startPos, endPos);

            // Extract all <refPrefix>.xxx references in the function body
            const deps = new Set<string>();
            let vmMatch;
            while ((vmMatch = vmRefPattern.exec(functionBody)) !== null) {
                const refName = vmMatch[1];
                    deps.add(refName); // add dependency (we assume no self-reference)
            }

            result.functions.set(funcName, {
                startPos: vmObjectStart + match.index,
                endPos: vmObjectStart + endPos + 1,
                async: isAsync,
                deps
            });
        }

        if (this.debug >= 2) {
            let output = "";
            output += `Scanned functions for objectString '${objectString}', refPrefix '${refPrefix}': ${result.functions.size}\n`;
            for (const [funcName, funcInfo] of result.functions) {
                output += `// Function: ${funcName}, async: ${funcInfo.async}, deps: [${[...funcInfo.deps].join(", ")}], startPos: ${funcInfo.startPos}, endPos: ${funcInfo.endPos}, body:\n${workerFnString.substring(funcInfo.startPos, funcInfo.endPos)}\n`;
            }
            console.log(output);
        }
        return result;
    }

    /**
     * Filters worker function string to remove unused vm functions
     * based on the instruction map from compilation
     */
    private filterWorkerFnString(workerFnString: string, usedInstrList: string[], objectString: string, refPrefix: string): string {
        const scanVm = this.scanVmFunctionReferences(workerFnString, objectString, refPrefix); // e.g. 'const vm = ', 'vm'
        const vmFunctionMap = scanVm.functions;

        if (vmFunctionMap.size === 0) {
            return workerFnString;
        }

        // Build set of functions to keep using breadth-first search (transitive closure)
        const functionsToKeep = new Set<string>();
        const queue = [...usedInstrList];

        while (queue.length > 0) {
            const funcName = queue.shift();
            if (!funcName || functionsToKeep.has(funcName)) {
                continue;
            }

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
        const functionsToRemove: Array<{ startPos: number; endPos: number }> = [];

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

    private compiledCodeInFrame(compiledScript: string, workerFnString: string) {
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

    public createStandaloneScript(workerString: string, compiledScript: string, usedInstrMap: Record<string, number>) {
        const usedInstrList = Object.keys(usedInstrMap);
        workerString = this.filterWorkerFnString(workerString, usedInstrList, 'const vm = ', 'vm');

        const inFrame = this.compiledCodeInFrame(compiledScript, workerString);
        return inFrame;
    }
}
