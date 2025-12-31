import type { Editor } from "codemirror";
export declare class SearchHandler {
    private editor;
    private searchInput;
    private replaceInput;
    private setFocus;
    constructor(editor: Editor, searchInput: HTMLInputElement, replaceInput: HTMLInputElement, setFocus: boolean);
    /**
     * Common helper to find text in content and return its position and line information
     */
    private findText;
    /**
     * Calculate offset from start based on cursor position
     */
    private getCursorOffset;
    searchNext(): void;
    searchPrev(): void;
    replace(): void;
    replaceAll(): void;
}
//# sourceMappingURL=SearchHandler.d.ts.map