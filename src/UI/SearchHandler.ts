
import type { Editor } from "codemirror";

export class SearchHandler {
    private editor: Editor;
    private searchInput: HTMLInputElement;
    private replaceInput: HTMLInputElement;

    constructor(editor: Editor, searchInput: HTMLInputElement, replaceInput: HTMLInputElement) {
        this.editor = editor;
        this.searchInput = searchInput;
        this.replaceInput = replaceInput;
    }

    /**
     * Common helper to find text in content and return its position and line information
     */
    private findText(content: string, searchText: string, startOffset: number, backwards: boolean = false): { index: number; lineNum: number; chStart: number; chEnd: number } | null {
        let index: number;
        
        if (backwards) {
            const searchContent = content.substring(0, startOffset);
            index = searchContent.lastIndexOf(searchText);
        } else {
            index = content.indexOf(searchText, startOffset);
        }

        if (index === -1) {
            return null;
        }

        const lines = content.split("\n");
        let currentOffset = 0;
        let lineNum = 0;

        for (let i = 0; i < lines.length; i++) {
            if (currentOffset + lines[i].length >= index) {
                lineNum = i;
                break;
            }
            currentOffset += lines[i].length + 1; // +1 for newline
        }

        const chStart = index - currentOffset;
        const chEnd = chStart + searchText.length;

        return { index, lineNum, chStart, chEnd };
    }

    /**
     * Calculate offset from start based on cursor position
     */
    private getCursorOffset(lines: string[], cursor: { line: number; ch: number }): number {
        let offset = 0;
        for (let i = 0; i < cursor.line; i++) {
            offset += lines[i].length + 1; // +1 for newline
        }
        offset += cursor.ch;
        return offset;
    }

    searchNext(): void {
        const searchText = this.searchInput.value;
        if (!searchText) {
            return;
        }

        const cursor = this.editor.getCursor("to");
        const content = this.editor.getValue();
        const lines = content.split("\n");
        const offset = this.getCursorOffset(lines, cursor);

        const result = this.findText(content, searchText, offset, false);

        if (result) {
            const { lineNum, chStart, chEnd } = result;
            this.editor.setSelection({ line: lineNum, ch: chStart }, { line: lineNum, ch: chEnd });
            this.editor.scrollIntoView({ line: lineNum, ch: chStart });
        }
    }

    searchPrev(): void {
        const searchText = this.searchInput.value;
        if (!searchText) {
            return;
        }

        const cursor = this.editor.getCursor("from");
        const content = this.editor.getValue();
        const lines = content.split("\n");
        const offset = this.getCursorOffset(lines, cursor);

        const result = this.findText(content, searchText, offset, true);

        if (result) {
            const { lineNum, chStart, chEnd } = result;
            this.editor.setSelection({ line: lineNum, ch: chStart }, { line: lineNum, ch: chEnd });
            this.editor.scrollIntoView({ line: lineNum, ch: chStart });
        }
    }

    replace(): void {
        const searchText = this.searchInput.value;
        const replaceText = this.replaceInput.value;

        if (!searchText) return;

        const cursor = this.editor.getCursor("from");
        const content = this.editor.getValue();
        const lines = content.split("\n");
        const offset = this.getCursorOffset(lines, cursor);

        const result = this.findText(content, searchText, offset, false);

        if (result) {
            const { lineNum, chStart, chEnd } = result;
            this.editor.replaceRange(replaceText, { line: lineNum, ch: chStart }, { line: lineNum, ch: chEnd });
            this.editor.setCursor({ line: lineNum, ch: chStart + replaceText.length });
        }
    }

    replaceAll(): void {
        const searchText = this.searchInput.value;
        const replaceText = this.replaceInput.value;

        if (!searchText) {
            return;
        }

        const content = this.editor.getValue();
        const newContent = content.split(searchText).join(replaceText);

        if (newContent !== content) {
            this.editor.setValue(newContent);
        }
    }
}
