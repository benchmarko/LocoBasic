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
        this.defContextStatus = ""; // collect | use | ""
        this.defContextVars = [];
    }
    addCompileMessage(message) {
        this.compileMessages.push(message);
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
    createVariableOrCount(name) {
        this.variables[name] = (this.variables[name] || 0) + 1;
        if (!this.variableScopes[name]) {
            this.variableScopes[name] = {};
        }
        const variableScope = this.variableScopes[name];
        variableScope[this.currentFunction] = (variableScope[this.currentFunction] || 0) + 1;
    }
    getVariable(name) {
        name = name.toLowerCase();
        const matches = name.match(/\/\* not supported: [%|!] \*\//);
        if (matches) {
            name = name.substring(0, matches.index);
        }
        if (SemanticsHelper.reJsKeyword.test(name)) {
            name = `_${name}`;
        }
        const defContextStatus = this.defContextStatus;
        if (defContextStatus === "") { // not in defContext?
            this.createVariableOrCount(name);
        }
        else if (defContextStatus === "collect") {
            this.defContextVars.push(name);
        }
        else if (defContextStatus === "use") {
            if (!this.defContextVars.includes(name)) { // variable not bound to DEF FN?
                this.createVariableOrCount(name);
            }
        }
        return name + (matches ? matches[0] : "");
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
    getVarType(name) {
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
        this.defContextStatus = "";
        this.defContextVars.length = 0;
    }
}
SemanticsHelper.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
//# sourceMappingURL=SemanticsHelper.js.map