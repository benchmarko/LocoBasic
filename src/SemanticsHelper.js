export class SemanticsHelper {
    constructor() {
        this.lineIndex = 0;
        this.indent = 0;
        this.variables = {};
        this.definedLabels = [];
        this.usedLabels = {};
        this.dataList = [];
        this.dataIndex = 0;
        this.restoreMap = {};
        this.instrMap = {};
        this.isDeg = false;
        this.isDefContext = false;
    }
    getDeg() {
        return this.isDeg;
    }
    setDeg(isDeg) {
        this.isDeg = isDeg;
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
    getVariable(name) {
        name = name.toLowerCase();
        if (SemanticsHelper.reJsKeyword.test(name)) {
            name = `_${name}`;
        }
        if (!this.isDefContext) {
            this.variables[name] = (this.variables[name] || 0) + 1;
        }
        return name;
    }
    setDefContext(isDef) {
        this.isDefContext = isDef;
    }
    static deleteAllItems(items) {
        for (const name in items) {
            delete items[name];
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
        SemanticsHelper.deleteAllItems(this.variables);
        this.definedLabels.length = 0;
        SemanticsHelper.deleteAllItems(this.usedLabels);
        this.dataList.length = 0;
        this.dataIndex = 0;
        SemanticsHelper.deleteAllItems(this.restoreMap);
        SemanticsHelper.deleteAllItems(this.instrMap);
        this.isDeg = false;
        this.isDefContext = false;
    }
}
SemanticsHelper.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
//# sourceMappingURL=SemanticsHelper.js.map