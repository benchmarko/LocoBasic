import { NodeWorkerFnType, VMObject } from "./Interfaces";
export declare class ScriptCreator {
    private debug;
    constructor(debug: number);
    analyzeDependencies(vmObj: VMObject): Record<string, string[]>;
    getTransitiveDeps(usedFunctions: string[], depMap: Record<string, string[]>): Set<string>;
    filterVM(vmObj: VMObject, usedFunctions: string[]): Partial<VMObject>;
    private createParentPort;
    generateSource(vmObj: Partial<VMObject>): string;
    private compiledCodeInFrame;
    createStandaloneScript(workerFn: NodeWorkerFnType, compiledScript: string, usedInstr: string[]): string;
}
//# sourceMappingURL=ScriptCreator.d.ts.map