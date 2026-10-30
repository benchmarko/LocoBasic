import type { DefinedLabelEntryType, InstrMapType, UsedLabelEntryType, VmInstructionName } from "./Interfaces";

interface VariableEntryType {
    count: number;
    type: string;
}

type VariableScopesEntryType = Record<string, number>;
export type VariableScopesType = Record<string, VariableScopesEntryType>;

export class SemanticsHelper {
    private lineIndex = 0;
    private indent = 0;
    private readonly compileMessages: string[] = [];
    private readonly variables: Record<string, VariableEntryType> = {};
    private readonly variableScopes: VariableScopesType = {};
    private readonly varLetterTypes: Record<string, string> = {};

    private currentFunction = "";
    private readonly definedLabels: DefinedLabelEntryType[] = [];
    private readonly usedLabels: Record<string, Record<string, UsedLabelEntryType>> = {};
    private readonly dataList: (string | number)[] = [];
    private dataIndex = 0;
    private readonly restoreMap: Record<string, number> = {};
    private static readonly reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
    private readonly instrMap: InstrMapType = {};
    private isDeg = false;
    private isTag = false;
    private syntaxTarget: "loco20" | "loco11" = "loco20";
    private currentRoutineKind: "function" | "sub" | "" = "";
    private currentRoutineName = "";
    private readonly routineLocals: Record<string, Record<string, boolean>> = {};
    private readonly routineParameters: Record<string, Record<string, boolean>> = {};
    private readonly routineShared: Record<string, Record<string, boolean>> = {};
    private readonly routineFunctions: Record<string, boolean> = {};
    private defContextStatus = ""; // collect | use | ""
    private readonly defContextVars: string[] = [];

    public addCompileMessage(message: string): void {
        this.compileMessages.push(message);
    }

    public getSyntaxTarget(): "loco20" | "loco11" {
        return this.syntaxTarget;
    }

    public setSyntaxTarget(syntaxTarget: "loco20" | "loco11"): void {
        this.syntaxTarget = syntaxTarget;
    }

    public reportSyntaxExtension(feature: string, location: string): void {
        if (this.syntaxTarget === "loco11") {
            this.addCompileMessage(`WARNING: Not valid Loco BASIC 1.1 syntax: ${feature} (${location})`);
        }
    }

    public getCompileMessages(): string[] {
        return this.compileMessages;
    }

    public getDeg(): boolean {
        return this.isDeg;
    }

    public setDeg(isDeg: boolean): void {
        this.isDeg = isDeg;
    }

    public getTag(): boolean {
        return this.isTag;
    }

    public setTag(isTag: boolean): void {
        this.isTag = isTag;
    }

    public beginRoutine(name: string, kind: "function" | "sub"): void {
        this.currentRoutineKind = kind;
        this.currentRoutineName = name.toLowerCase();
        this.currentFunction = `routine:${this.currentRoutineName}`;
        this.routineLocals[this.currentRoutineName] = {};
        this.routineParameters[this.currentRoutineName] = {};
        this.routineShared[this.currentRoutineName] = {};
    }

    public endRoutine(): void {
        this.currentRoutineKind = "";
        this.currentRoutineName = "";
        this.currentFunction = "";
    }

    public getCurrentRoutineKind(): "function" | "sub" | "" {
        return this.currentRoutineKind;
    }

    public getCurrentRoutineName(): string {
        return this.currentRoutineName;
    }

    public registerRoutineFunction(name: string): void {
        this.routineFunctions[name.toLowerCase()] = true;
    }

    public isRoutineFunction(name: string): boolean {
        return Boolean(this.routineFunctions[name.toLowerCase()]);
    }

    public isRoutineScope(name: string): boolean {
        return name.startsWith("routine:");
    }

    public addRoutineParameter(name: string): void {
        name = name.toLowerCase();
        this.routineLocals[this.currentRoutineName][name] = true;
        this.routineParameters[this.currentRoutineName][name] = true;
        this.createVariableOrCount(name, name.endsWith("$") ? "S" : "", this.currentFunction);
    }

    public addSharedVariable(name: string, type = ""): void {
        if (!this.currentRoutineKind) {
            this.addCompileMessage("ERROR: SHARED is only valid inside a FUNCTION or SUB.");
            return;
        }
        name = name.toLowerCase();
        this.routineShared[this.currentRoutineName][name] = true;
        this.createVariableOrCount(name, type || (name.endsWith("$") ? "S" : ""), "");
    }

    public getRoutineLocalVariables(name: string): string[] {
        return Object.keys(this.routineLocals[name] || {}).filter(variableName =>
            !this.routineParameters[name]?.[variableName] && !this.routineShared[name]?.[variableName]
        );
    }

    public getRoutineReturnVariable(): string {
        return "_routineResult";
    }

    public addIndent(num: number): number {
        this.indent += num;
        return this.indent;
    }

    public setIndent(indent: number): void {
        this.indent = indent;
    }

    public getIndent(): number {
        return this.indent;
    }

    public getIndentStr(): string {
        if (this.indent < 0) {
            console.error("getIndentStr: lineIndex=", this.lineIndex, ", indent=", this.indent);
            return "";
        }
        return " ".repeat(this.indent);
    }

    public addDataIndex(count: number): number {
        return this.dataIndex += count;
    }

    public getDataIndex(): number {
        return this.dataIndex;
    }

    public addDefinedLabel(label: string, line: number): void {
        this.definedLabels.push({
            label,
            first: line,
            last: -1,
            dataIndex: -1
        });
    }

    public getDefinedLabels(): DefinedLabelEntryType[] {
        return this.definedLabels;
    }

    public addUsedLabel(label: string, type: string): void {
        if (!this.usedLabels[type]) {
            this.usedLabels[type] = {};
        }
        const usedLabelsForType = this.usedLabels[type];
        usedLabelsForType[label] = usedLabelsForType[label] || {
            count: 0
        };
        usedLabelsForType[label].count = (usedLabelsForType[label].count || 0) + 1;
    }

    public getUsedLabels(): Record<string, Record<string, UsedLabelEntryType>> {
        return this.usedLabels;
    }

    public getInstrMap(): InstrMapType {
        return this.instrMap;
    }

    public addInstr(name: VmInstructionName): number {
        this.instrMap[name] = (this.instrMap[name] || 0) + 1;
        return this.instrMap[name];
    }

    public getVariables(): string[] {
        return Object.keys(this.variables);
    }

    private createVariableOrCount(name: string, type: string, scope = this.currentFunction) {
        if (!this.variables[name]) {
            this.variables[name] = {
                count: 1,
                type
            }
        } else {
            this.variables[name].count += 1;
            if (type !== this.variables[name].type) {
                console.warn(`Var type changed for '${name}': ${this.variables[name].type} => ${type}`);
                this.addCompileMessage(`WARNING: Variable has plain and array type: ${name}`);
                this.variables[name].type = type;
            }
        }

        if (!this.variableScopes[name]) {
            this.variableScopes[name] = {};
        }
        const variableScope = this.variableScopes[name];
        variableScope[scope] = (variableScope[scope] || 0) + 1;
    }

    public getVariable(name: string, type = ""): string {
        name = name.toLowerCase();
        const matches = name.match(/\/\* not supported: [%|!] \*\//);
        if (matches) {
            name = name.substring(0, matches.index);
        }

        if (SemanticsHelper.reJsKeyword.test(name)) {
            name = `_${name}`;
        }

        if (name === this.getRoutineReturnVariable().toLowerCase()) {
            return this.getRoutineReturnVariable();
        }

        if (this.currentRoutineKind === "function" && name === this.currentRoutineName) {
            return this.getRoutineReturnVariable();
        }

        const defContextStatus = this.defContextStatus;
        if (defContextStatus === "") { // not in defContext?
            if (this.currentRoutineKind) {
                if (this.routineShared[this.currentRoutineName]?.[name]) {
                    this.createVariableOrCount(name, type, "");
                } else {
                    this.routineLocals[this.currentRoutineName][name] = true;
                    this.createVariableOrCount(name, type, this.currentFunction);
                }
            } else {
                this.createVariableOrCount(name, type);
            }
        } else if (defContextStatus === "collect") {
            this.defContextVars.push(name);
        } else if (defContextStatus === "use") {
            if (!this.defContextVars.includes(name)) { // variable not bound to DEF FN?
                this.createVariableOrCount(name, type);
            }
        }
        return name + (matches ? matches[0] : "");
    }

    public getVariableEntry(name: string): VariableEntryType {
        return this.variables[name];
    }

    public getVariableScopes() {
        return this.variableScopes;
    }

    public setCurrentFunction(label: string) {
        this.currentFunction = label;
    }

    public setDefContextStatus(status: string): void {
        this.defContextStatus = status;
        if (status === "collect" || status === "") {
            this.defContextVars.length = 0;
        }
    }

    public setVarLetterTypes(letters: string[], type: string) {
        for (const letter of letters) {
            this.varLetterTypes[letter] = type;
        }
    }

    public getVarLetterType(name: string) {
        const letter = name.charAt(0);
        return this.varLetterTypes[letter] || "";
    }

    private static deleteAllItems(items: Record<string, unknown>): void {
        for (const name in items) {
            delete items[name]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
        }
    }

    public incrementLineIndex(): number {
        this.lineIndex += 1;
        return this.lineIndex;
    }

    public getRestoreMap(): Record<string, number> {
        return this.restoreMap;
    }

    public addRestoreLabel(label: string): void {
        this.restoreMap[label] = -1;
    }

    public getDataList(): (string | number)[] {
        return this.dataList;
    }

    public resetParser(): void {
        this.lineIndex = 0;
        this.indent = 0;
        this.compileMessages.length = 0;
        SemanticsHelper.deleteAllItems(this.variables);
        SemanticsHelper.deleteAllItems(this.variableScopes);
        SemanticsHelper.deleteAllItems(this.varLetterTypes);
        this.currentFunction = "";
        this.definedLabels.length = 0;
        SemanticsHelper.deleteAllItems(this.usedLabels);
        this.dataList.length = 0;
        this.dataIndex = 0;
        SemanticsHelper.deleteAllItems(this.restoreMap);
        SemanticsHelper.deleteAllItems(this.instrMap);
        this.isDeg = false;
        this.isTag = false;
        this.currentRoutineKind = "";
        this.currentRoutineName = "";
        SemanticsHelper.deleteAllItems(this.routineLocals);
        SemanticsHelper.deleteAllItems(this.routineParameters);
        SemanticsHelper.deleteAllItems(this.routineShared);
        SemanticsHelper.deleteAllItems(this.routineFunctions);
        this.defContextStatus = "";
        this.defContextVars.length = 0;
    }
}
