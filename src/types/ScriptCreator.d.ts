export declare class ScriptCreator {
    private debug;
    constructor(debug: number);
    /**
     * Scans vm object for function references (dependencies)
     * Returns a map of function names to their dependencies and positions
     */
    private scanVmFunctionReferences;
    /**
     * Filters worker function string to remove unused vm functions
     * based on the instruction map from compilation
     */
    private filterWorkerFnString;
    private createParentPort;
    private compiledCodeInFrame;
    createStandaloneScript(workerString: string, compiledScript: string, usedInstrMap: Record<string, number>): string;
}
//# sourceMappingURL=ScriptCreator.d.ts.map