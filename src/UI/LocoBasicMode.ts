import type { Mode, StringStream } from 'codemirror';


interface State {
    tokenize: ((stream: StringStream, state: State) => string | null) | null;
}

export class LocoBasicMode {
    public static getMode(): Mode<State> {
        function words(array: string[]) {
            const keys: Record<string, boolean> = {};
            for (let i = 0; i < array.length; i += 1) {
                keys[array[i]] = true;
            }
            return keys;
        }

        const keywords = [
            "ABS", "AFTER", "AND", "ASC", "ATN", "AUTO", "BIN$", "BORDER", "BREAK", "CALL", "CAT", "CHAIN", "CHR$", "CINT", "CLEAR", "CLG", "CLOSEIN",
            "CLOSEOUT", "CLS", "CONT", "COPYCHR$", "COS", "CREAL", "CURSOR", "DATA", "DEC$", "DEF", "DEFINT", "DEFREAL", "DEFSTR", "DEG", "DELETE",
            "DERR", "DI", "DIM", "DRAW", "DRAWR", "EDIT", "EI", "ELSE", "END", "ENT", "ENV", "EOF", "ERASE", "ERL", "ERR", "ERROR", "EVERY", "EXP",
            "FILL", "FIX", "FN", "FOR", "FRAME", "FRE", "GOSUB", "GOTO", "GRAPHICS", "HEX$", "HIMEM", "IF", "INK", "INKEY", "INKEY$", "INP", "INPUT",
            "INSTR", "INT", "JOY", "KEY", "LEFT$", "LEN", "LET", "LINE", "LIST", "LOAD", "LOCATE", "LOG", "LOG10", "LOWER$", "MASK", "MAX", "MEMORY",
            "MERGE", "MID$", "MIN", "MOD", "MODE", "MOVE", "MOVER", "NEW", "NEXT", "NOT", "ON", "OPENIN", "OPENOUT", "OR", "ORIGIN", "OUT", "PAPER",
            "PEEK", "PEN", "PI", "PLOT", "PLOTR", "POKE", "POS", "PRINT", "RAD", "RANDOMIZE", "READ", "RELEASE", "REM", "REMAIN", "RENUM", "RESTORE",
            "RESUME", "RETURN", "RIGHT$", "RND", "ROUND", "RUN", "SAVE", "SGN", "SIN", "SOUND", "SPACE$", "SPC", "SPEED", "SQ", "SQR", "STEP", "STOP",
            "STR$", "STRING$", "SWAP", "SYMBOL", "TAB", "TAG", "TAGOFF", "TAN", "TEST", "TESTR", "THEN", "TIME", "TO", "TROFF", "TRON", "UNT", "UPPER$",
            "USING", "VAL", "VPOS", "WAIT", "WEND", "WHILE", "WIDTH", "WINDOW", "WRITE", "XOR", "XPOS", "YPOS", "ZONE"
        ];

        const keywordMap = words([...keywords, ...keywords.map((word) => word.toLowerCase())]);

        const isOperatorChar = /[+\-*=<>^\\@/]/;

        function tokenString() {
            return function (stream: StringStream, state: State) {
                stream.eatWhile(/[^"]/);
                stream.next();
                state.tokenize = null;
                return "string";
            };
        }

        function tokenBase(stream: StringStream, state: State) {
            const ch = stream.next();
            if (ch === null) {
                return null;
            }

            if (ch === ":" || ch === ";") { // ; e.g. in print
                return null;
            }

            if (ch === "'") {
                stream.skipToEnd();
                return "comment";
            }
            if (ch === '"') {
                state.tokenize = tokenString();
                return state.tokenize(stream, state);
            }

            if (/[[\](),]/.test(ch)) {
                return null;
            }

            /*
            if (/\d/.test(ch)) {
                stream.eatWhile(/[\w.]/);
                return "number";
            }
            */

            if (ch === "." && stream.match(/^\d\d*(?:[eE][+-]?\d+)?/)) {
                return "number";
            } else if (ch === "&" && stream.match(/^(?:[\dA-Fa-f]+|[Xx][01]+)/)) {
                return "number";
            } else if (/\d/.test(ch)) {
                stream.match(/^\d*(?:n|(?:\.\d*)?(?:[eE][+-]?\d+)?)?/);
                return "number"
            }

            if (isOperatorChar.test(ch)) {
                stream.eatWhile(isOperatorChar);
                return "operator";
            }

            if (ch === "?") {
                return "keyword";
            }

            if (ch === "F" && stream.eat("N") || ch === "f" && stream.eat("n")) {
                return "keyword";
            }

            stream.eatWhile(/[\w]/);
            stream.eat("$");

            const word = stream.current();
            if (word === "REM" || word === "rem") {
                stream.skipToEnd();
                return "comment";
            }

            if (Object.prototype.hasOwnProperty.call(keywordMap, word)) {
                return "keyword";
            }

            return "variable";
        }

        // Interface
        return {
            startState: function () {
                return {
                    tokenize: null
                };
            },

            token: function (stream: StringStream, state: State): string | null {
                if (stream.eatSpace()) {
                    return null;
                }
                const style = (state.tokenize || tokenBase)(stream, state);
                return style;
            }
        } as Mode<State>;
    }
}
