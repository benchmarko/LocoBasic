import { NodeWorkerFnType } from "./Interfaces";
export declare class ScriptCreator {
    private debug;
    constructor(debug: number);
    private analyzeDependencies;
    private getTransitiveDeps;
    private filterVM;
    private createParentPort;
    private generateSource;
    private compiledCodeInFrame;
    createStandaloneScript(workerFn: NodeWorkerFnType, compiledScript: string, usedInstr: string[], regexPrefix?: string, isTerminal?: boolean): string;
}
//# sourceMappingURL=ScriptCreator.d.ts.map