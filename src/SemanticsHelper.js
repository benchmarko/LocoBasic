export class SemanticsHelper {
    constructor() {
        this.lineIndex = 0;
        this.indent = 0;
        this.compileMessages = [];
        this.variables = {};
        this.variableScopes = {};
        this.varLetterTypes = {};
        this.currentFunction = "";
        this.definedLabels = [];
        this.usedLabels = {};
        this.dataList = [];
        this.dataIndex = 0;
        this.restoreMap = {};
        this.instrMap = {};
        this.isDeg = false;
        this.isTag = false;
        this.syntaxTarget = "loco20";
        this.currentRoutineKind = "";
        this.currentRoutineName = "";
        this.routineLocals = {};
        this.routineParameters = {};
        this.routineShared = {};
        this.routineFunctions = {};
        this.defContextStatus = ""; // collect | use | ""
        this.defContextVars = [];
    }
    addCompileMessage(message) {
        this.compileMessages.push(message);
    }
    getSyntaxTarget() {
        return this.syntaxTarget;
    }
    setSyntaxTarget(syntaxTarget) {
        this.syntaxTarget = syntaxTarget;
    }
    reportSyntaxExtension(feature, location) {
        if (this.syntaxTarget === "loco11") {
            this.addCompileMessage(`WARNING: Not valid Loco BASIC 1.1 syntax: ${feature} (${location})`);
        }
    }
    getCompileMessages() {
        return this.compileMessages;
    }
    getDeg() {
        return this.isDeg;
    }
    setDeg(isDeg) {
        this.isDeg = isDeg;
    }
    getTag() {
        return this.isTag;
    }
    setTag(isTag) {
        this.isTag = isTag;
    }
    beginRoutine(name, kind) {
        this.currentRoutineKind = kind;
        this.currentRoutineName = name.toLowerCase();
        this.currentFunction = `routine:${this.currentRoutineName}`;
        this.routineLocals[this.currentRoutineName] = {};
        this.routineParameters[this.currentRoutineName] = {};
        this.routineShared[this.currentRoutineName] = {};
    }
    endRoutine() {
        this.currentRoutineKind = "";
        this.currentRoutineName = "";
        this.currentFunction = "";
    }
    getCurrentRoutineKind() {
        return this.currentRoutineKind;
    }
    getCurrentRoutineName() {
        return this.currentRoutineName;
    }
    registerRoutineFunction(name) {
        this.routineFunctions[name.toLowerCase()] = true;
    }
    isRoutineFunction(name) {
        return Boolean(this.routineFunctions[name.toLowerCase()]);
    }
    isRoutineScope(name) {
        return name.startsWith("routine:");
    }
    addRoutineParameter(name) {
        name = name.toLowerCase();
        this.routineLocals[this.currentRoutineName][name] = true;
        this.routineParameters[this.currentRoutineName][name] = true;
        this.createVariableOrCount(name, name.endsWith("$") ? "S" : "", this.currentFunction);
    }
    addSharedVariable(name, type = "") {
        if (!this.currentRoutineKind) {
            this.addCompileMessage("ERROR: SHARED is only valid inside a FUNCTION or SUB.");
            return;
        }
        name = name.toLowerCase();
        this.routineShared[this.currentRoutineName][name] = true;
        this.createVariableOrCount(name, type || (name.endsWith("$") ? "S" : ""), "");
    }
    getRoutineLocalVariables(name) {
        return Object.keys(this.routineLocals[name] || {}).filter(variableName => !this.routineParameters[name]?.[variableName] && !this.routineShared[name]?.[variableName]);
    }
    getRoutineReturnVariable() {
        return "_routineResult";
    }
    addIndent(num) {
        this.indent += num;
        return this.indent;
    }
    setIndent(indent) {
        this.indent = indent;
    }
    getIndent() {
        return this.indent;
    }
    getIndentStr() {
        if (this.indent < 0) {
            console.error("getIndentStr: lineIndex=", this.lineIndex, ", indent=", this.indent);
            return "";
        }
        return " ".repeat(this.indent);
    }
    addDataIndex(count) {
        return this.dataIndex += count;
    }
    getDataIndex() {
        return this.dataIndex;
    }
    addDefinedLabel(label, line) {
        this.definedLabels.push({
            label,
            first: line,
            last: -1,
            dataIndex: -1
        });
    }
    getDefinedLabels() {
        return this.definedLabels;
    }
    addUsedLabel(label, type) {
        if (!this.usedLabels[type]) {
            this.usedLabels[type] = {};
        }
        const usedLabelsForType = this.usedLabels[type];
        usedLabelsForType[label] = usedLabelsForType[label] || {
            count: 0
        };
        usedLabelsForType[label].count = (usedLabelsForType[label].count || 0) + 1;
    }
    getUsedLabels() {
        return this.usedLabels;
    }
    getInstrMap() {
        return this.instrMap;
    }
    addInstr(name) {
        this.instrMap[name] = (this.instrMap[name] || 0) + 1;
        return this.instrMap[name];
    }
    getVariables() {
        return Object.keys(this.variables);
    }
    createVariableOrCount(name, type, scope = this.currentFunction) {
        if (!this.variables[name]) {
            this.variables[name] = {
                count: 1,
                type
            };
        }
        else {
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
    getVariable(name, type = "") {
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
                }
                else {
                    this.routineLocals[this.currentRoutineName][name] = true;
                    this.createVariableOrCount(name, type, this.currentFunction);
                }
            }
            else {
                this.createVariableOrCount(name, type);
            }
        }
        else if (defContextStatus === "collect") {
            this.defContextVars.push(name);
        }
        else if (defContextStatus === "use") {
            if (!this.defContextVars.includes(name)) { // variable not bound to DEF FN?
                this.createVariableOrCount(name, type);
            }
        }
        return name + (matches ? matches[0] : "");
    }
    getVariableEntry(name) {
        return this.variables[name];
    }
    getVariableScopes() {
        return this.variableScopes;
    }
    setCurrentFunction(label) {
        this.currentFunction = label;
    }
    setDefContextStatus(status) {
        this.defContextStatus = status;
        if (status === "collect" || status === "") {
            this.defContextVars.length = 0;
        }
    }
    setVarLetterTypes(letters, type) {
        for (const letter of letters) {
            this.varLetterTypes[letter] = type;
        }
    }
    getVarLetterType(name) {
        const letter = name.charAt(0);
        return this.varLetterTypes[letter] || "";
    }
    static deleteAllItems(items) {
        for (const name in items) {
            delete items[name]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
        }
    }
    incrementLineIndex() {
        this.lineIndex += 1;
        return this.lineIndex;
    }
    getRestoreMap() {
        return this.restoreMap;
    }
    addRestoreLabel(label) {
        this.restoreMap[label] = -1;
    }
    getDataList() {
        return this.dataList;
    }
    resetParser() {
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
SemanticsHelper.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
//# sourceMappingURL=SemanticsHelper.js.map