import type { DefinedLabelEntryType, UsedLabelEntryType } from "./Interfaces";

export class SemanticsHelper {
    private lineIndex = 0;
    private indent = 0;
    private readonly compileMessages: string[] = [];
    private readonly variables: Record<string, number> = {};
    private readonly definedLabels: DefinedLabelEntryType[] = [];
    private readonly usedLabels: Record<string, Record<string, UsedLabelEntryType>> = {};
    private readonly dataList: (string | number)[] = [];
    private dataIndex = 0;
    private readonly restoreMap: Record<string, number> = {};
    private static readonly reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
    private readonly instrMap: Record<string, number> = {};
    private isDeg = false;
    private isDefContext = false;

    public addCompileMessage(message: string): void {
        this.compileMessages.push(message);
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

    public getInstrMap(): Record<string, number> {
        return this.instrMap;
    }

    public addInstr(name: string): number {
        this.instrMap[name] = (this.instrMap[name] || 0) + 1;
        return this.instrMap[name];
    }

    public getVariables(): string[] {
        return Object.keys(this.variables);
    }

    public getVariable(name: string): string {
        name = name.toLowerCase();
        const matches = name.match(/\/\* not supported: [%|!] \*\//);
        if (matches) {
            name = name.substring(0,matches.index);
        }

        if (SemanticsHelper.reJsKeyword.test(name)) {
            name = `_${name}`;
        }

        if (!this.isDefContext) {
            this.variables[name] = (this.variables[name] || 0) + 1;
        }
        return name + (matches ? matches[0] : "");
    }

    public setDefContext(isDef: boolean): void {
        this.isDefContext = isDef;
    }

    private static deleteAllItems(items: Record<string, unknown>): void {
        for (const name in items) {
            delete items[name];
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
