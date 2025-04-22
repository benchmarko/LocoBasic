(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.locobasicUI = {}));
})(this, (function (exports) { 'use strict';

    class LocoBasicMode {
        static getMode() {
            function words(array) {
                const keys = {};
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
                return function (stream, state) {
                    stream.eatWhile(/[^"]/);
                    stream.next();
                    state.tokenize = null;
                    return "string";
                };
            }
            function tokenBase(stream, state) {
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
                if (ch === "." && stream.match(/^\d\d*(?:[eE][+-]?\d+)?/)) {
                    return "number";
                }
                else if (ch === "&" && stream.match(/^(?:[\dA-Fa-f]+|[Xx][01]+)/)) {
                    return "number";
                }
                else if (/\d/.test(ch)) {
                    stream.match(/^\d*(?:n|(?:\.\d*)?(?:[eE][+-]?\d+)?)?/);
                    return "number";
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
                token: function (stream, state) {
                    if (stream.eatSpace()) {
                        return null;
                    }
                    const style = (state.tokenize || tokenBase)(stream, state);
                    return style;
                }
            };
        }
    }

    // Worker function to handle JavaScript evaluation and error reporting
    const workerFn = () => {
        const doEvalAndReply = (jsText) => {
            self.addEventListener("error", (errorEvent) => {
                errorEvent.preventDefault();
                const { lineno, colno, message } = errorEvent;
                const plainErrorEventObj = { lineno, colno, message };
                self.postMessage(JSON.stringify(plainErrorEventObj));
            }, { once: true });
            new Function("_o", jsText);
            const plainErrorEventObj = {
                lineno: -1,
                colno: -1,
                message: "No Error: Parsing successful!"
            };
            self.postMessage(JSON.stringify(plainErrorEventObj));
        };
        self.addEventListener("message", (e) => {
            doEvalAndReply(e.data);
        });
    };
    class UI {
        constructor() {
            this.keyBuffer = []; // buffered pressed keys
            this.escape = false;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onExecuteButtonClick = async (_event) => {
                const core = this.getCore();
                if (!this.vm || this.hasCompiledError()) {
                    return;
                }
                this.setAreaHidden("convertArea"); // to be sure for execute; TODO: hide area if clicked anywhere outside 
                this.setButtonDisabled("executeButton", true);
                this.setButtonDisabled("stopButton", false);
                this.setButtonDisabled("convertButton", true);
                this.setSelectDisabled("databaseSelect", true);
                this.setSelectDisabled("exampleSelect", true);
                this.escape = false;
                this.keyBuffer.length = 0;
                const outputText = document.getElementById("outputText");
                outputText.addEventListener("keydown", this.fnOnKeyPressHandler, false);
                const compiledScript = this.compiledCm ? this.compiledCm.getValue() : "";
                const output = await core.executeScript(compiledScript, this.vm) || "";
                outputText.removeEventListener("keydown", this.fnOnKeyPressHandler, false);
                this.setButtonDisabled("executeButton", false);
                this.setButtonDisabled("stopButton", true);
                this.setButtonDisabled("convertButton", false);
                this.setSelectDisabled("databaseSelect", false);
                this.setSelectDisabled("exampleSelect", false);
                this.addOutputText(output + (output.endsWith("\n") ? "" : "\n"));
            };
            this.onCompiledTextChange = () => {
                if (this.hasCompiledError()) {
                    return;
                }
                const autoExecuteInput = document.getElementById("autoExecuteInput");
                if (autoExecuteInput.checked) {
                    const executeButton = window.document.getElementById("executeButton");
                    if (!executeButton.disabled) {
                        executeButton.dispatchEvent(new Event("click"));
                    }
                }
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onCompileButtonClick = (_event) => {
                const core = this.getCore();
                this.setButtonDisabled("compileButton", true);
                const input = this.basicCm ? this.basicCm.getValue() : "";
                UI.asyncDelay(() => {
                    const compiledScript = core.compileScript(input) || "";
                    if (this.compiledCm) {
                        this.compiledCm.setValue(compiledScript);
                    }
                    this.setButtonDisabled("compileButton", false);
                    if (!compiledScript.startsWith("ERROR:")) {
                        this.setButtonDisabled("labelRemoveButton", false);
                    }
                }, 1);
            };
            this.onAutoCompileInputChange = (event) => {
                const autoCompileInput = event.target;
                this.updateConfigParameter("autoCompile", autoCompileInput.checked);
            };
            this.onAutoExecuteInputChange = (event) => {
                const autoExecuteInput = event.target;
                this.updateConfigParameter("autoExecute", autoExecuteInput.checked);
            };
            this.onShowOutputInputChange = (event) => {
                const showOutputInput = event.target;
                this.toggleAreaHidden("outputArea");
                this.updateConfigParameter("showOutput", showOutputInput.checked);
            };
            this.onShowBasicInputChange = (event) => {
                const showBasicInput = event.target;
                this.toggleAreaHidden("basicArea", this.basicCm);
                this.updateConfigParameter("showBasic", showBasicInput.checked);
            };
            this.onShowCompiledInputChange = (event) => {
                const showCompiledInput = event.target;
                this.toggleAreaHidden("compiledArea", this.compiledCm);
                this.updateConfigParameter("showCompiled", showCompiledInput.checked);
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onStopButtonClick = (_event) => {
                this.escape = true;
                this.setButtonDisabled("stopButton", true);
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onConvertButtonClick = (_event) => {
                this.toggleAreaHidden("convertArea");
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onLabelAddButtonClick = (_event) => {
                const input = this.basicCm.getValue();
                const output = input ? UI.addLabels(input) : "";
                if (output && output !== input) {
                    this.basicCm.setValue(output);
                }
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onLabelRemoveButtonClick = (_event) => {
                const input = this.basicCm.getValue();
                const core = this.getCore();
                const semanticsHelper = core.getSemanticsHelper();
                const usedLabels = semanticsHelper.getUsedLabels();
                const allUsedLabels = {};
                for (const type of Object.keys(usedLabels)) {
                    for (const label of Object.keys(usedLabels[type])) {
                        allUsedLabels[label] = true;
                    }
                }
                const output = UI.removeUnusedLabels(input, allUsedLabels);
                if (output && output !== input) {
                    this.basicCm.setValue(output);
                }
            };
            this.onBasicTextChange = async () => {
                this.setButtonDisabled("labelRemoveButton", true);
                const autoCompileInput = document.getElementById("autoCompileInput");
                if (autoCompileInput.checked) {
                    const compileButton = window.document.getElementById("compileButton");
                    if (!compileButton.disabled) {
                        compileButton.dispatchEvent(new Event("click"));
                    }
                }
            };
            this.onExampleSelectChange = async (event) => {
                const core = this.getCore();
                this.setOutputText("");
                const exampleSelect = event.target;
                const exampleName = exampleSelect.value;
                const example = core.getExample(exampleName); //.script || "";
                if (example) {
                    this.updateConfigParameter("example", exampleName);
                    const script = await this.getExampleScript(example);
                    if (this.basicCm) {
                        this.basicCm.setValue(script);
                    }
                }
                else {
                    console.warn("onExampleSelectChange: example not found:", exampleName);
                }
            };
            this.onDatabaseSelectChange = async (event) => {
                const core = this.getCore();
                const databaseSelect = event.target;
                const database = databaseSelect.value;
                const config = core.getConfigMap();
                config.database = database;
                const databaseMap = core.getDatabaseMap();
                const databaseItem = databaseMap[database];
                if (databaseItem) {
                    this.updateConfigParameter("database", database);
                }
                const exampleMap = await this.getExampleMap(databaseItem);
                this.setExampleSelectOptions(exampleMap, config.example);
                const exampleSelect = window.document.getElementById("exampleSelect");
                exampleSelect.dispatchEvent(new Event("change"));
            };
            this.onHelpButtonClick = () => {
                window.open("https://github.com/benchmarko/LocoBasic/#readme");
            };
            this.onExportSvgButtonClick = () => {
                const outputText = window.document.getElementById("outputText");
                const svgElements = outputText.getElementsByTagName("svg");
                if (!svgElements.length) {
                    console.warn("onExportSvgButtonClick: No SVG found.");
                    return;
                }
                const svgElement = svgElements[0];
                const svgData = svgElement.outerHTML;
                const preface = '<?xml version="1.0" standalone="no"?>\r\n';
                const svgBlob = new Blob([preface, svgData], {
                    type: "image/svg+xml;charset=utf-8"
                });
                const example = this.getExampleName();
                const filename = `${example}.svg`;
                UI.fnDownloadBlob(svgBlob, filename);
            };
            this.fnOnKeyPressHandler = (event) => this.onOutputTextKeydown(event);
        }
        debounce(func, fngetDelay) {
            let timeoutId;
            return function (...args) {
                var _a, _b;
                // use delay 0 when change comes from "SetValue" (ant not form "+input")
                const delay = ((_b = (_a = args === null || args === void 0 ? void 0 : args[1]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.origin) === "setValue" ? 0 : fngetDelay();
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args); // we expect "this" to be null
                }, delay);
            };
        }
        static asyncDelay(fn, timeout) {
            return (async () => {
                const timerId = window.setTimeout(fn, timeout);
                return timerId;
            })();
        }
        getCore() {
            if (!this.core) {
                throw new Error("Core not initialized");
            }
            return this.core;
        }
        getEscape() {
            return this.escape;
        }
        async fnLoadScriptOrStyle(script) {
            return new Promise((resolve, reject) => {
                const onScriptLoad = function (event) {
                    const type = event.type; // "load" or "error"
                    const node = event.currentTarget;
                    const key = node.getAttribute("data-key");
                    node.removeEventListener("load", onScriptLoad, false);
                    node.removeEventListener("error", onScriptLoad, false);
                    if (type === "load") {
                        resolve(key);
                    }
                    else {
                        reject(key);
                    }
                };
                script.addEventListener("load", onScriptLoad, false);
                script.addEventListener("error", onScriptLoad, false);
                document.getElementsByTagName("head")[0].appendChild(script);
            });
        }
        async loadScript(url, key) {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            script.src = url;
            script.setAttribute("data-key", key);
            return this.fnLoadScriptOrStyle(script);
        }
        getCurrentDataKey() {
            return document.currentScript && document.currentScript.getAttribute("data-key") || "";
        }
        addOutputText(value) {
            const outputText = document.getElementById("outputText");
            outputText.innerHTML += value;
            if (value.startsWith("<svg xmlns=")) {
                this.setButtonDisabled("exportSvgButton", false);
            }
        }
        setOutputText(value) {
            const outputText = document.getElementById("outputText");
            outputText.innerText = value;
            this.setButtonDisabled("exportSvgButton", true);
        }
        getColor(color, background) {
            return `<span style="${background ? 'background-color' : 'color'}: ${color}">`;
        }
        /**
         * Prompts the user with a message and returns the input.
         * @param msg - The message to prompt.
         * @returns A promise that resolves to the user input or null if canceled.
         */
        prompt(msg) {
            const input = window.prompt(msg);
            return input;
        }
        async speak(text, pitch) {
            // wait for user interaction to start sound (how to?)
            return new Promise((resolve, reject) => {
                if (!window.speechSynthesis) {
                    reject(new Error("Speech synthesis is not supported in this browser."));
                    return;
                }
                const msg = new SpeechSynthesisUtterance(text);
                msg.pitch = pitch; //0 to 2
                msg.onend = () => resolve();
                msg.onerror = (event) => {
                    if (event.error === "not-allowed") {
                        // Chrome needs user interaction
                        window.addEventListener("click", () => {
                            window.speechSynthesis.speak(msg);
                        }, { once: true });
                    }
                    else {
                        reject(new Error(`Speech synthesis error: ${event.error}`));
                    }
                };
                window.speechSynthesis.speak(msg);
            });
        }
        updateConfigParameter(name, value) {
            const core = this.getCore();
            const configAsRecord = core.getConfigMap();
            const defaultConfigAsRecord = core.getDefaultConfigMap();
            configAsRecord[name] = value;
            const url = new URL(window.location.href);
            if (configAsRecord[name] !== defaultConfigAsRecord[name]) {
                url.searchParams.set(name, String(value));
            }
            else {
                url.searchParams.delete(name);
            }
            history.pushState({}, "", url.href);
        }
        setButtonDisabled(id, disabled) {
            const button = window.document.getElementById(id);
            button.disabled = disabled;
        }
        setSelectDisabled(id, disabled) {
            const element = window.document.getElementById(id);
            element.disabled = disabled;
        }
        hasCompiledError() {
            const compiledScript = this.compiledCm ? this.compiledCm.getValue() : "";
            const hasError = compiledScript.startsWith("ERROR:");
            this.setOutputText(hasError ? compiledScript : "");
            return hasError;
        }
        toggleAreaHidden(id, editor) {
            const area = document.getElementById(id);
            area.hidden = !area.hidden;
            if (!area.hidden && editor) {
                editor.refresh();
            }
            return !area.hidden;
        }
        setAreaHidden(id) {
            const area = document.getElementById(id);
            if (!area.hidden) {
                area.hidden = true;
            }
            return area.hidden;
        }
        static addLabels(input) {
            const lineParts = input.split("\n");
            let lastLine = 0;
            for (let i = 0; i < lineParts.length; i += 1) {
                let lineNum = parseInt(lineParts[i], 10);
                if (isNaN(lineNum)) {
                    lineNum = lastLine + 1;
                    lineParts[i] = `${lineNum} ${lineParts[i]}`;
                }
                lastLine = lineNum;
            }
            return lineParts.join("\n");
        }
        static removeUnusedLabels(input, usedLabels) {
            const lineParts = input.split("\n");
            for (let i = 0; i < lineParts.length; i += 1) {
                const lineNum = parseInt(lineParts[i], 10);
                if (!isNaN(lineNum) && !usedLabels[lineNum]) {
                    lineParts[i] = lineParts[i].replace(/^\d+\s/, "");
                }
            }
            return lineParts.join("\n");
        }
        async getExampleScript(example) {
            if (example.script !== undefined) {
                return example.script;
            }
            const core = this.getCore();
            const database = core.getDatabase();
            const scriptName = database.source + "/" + example.key + ".js";
            try {
                await this.loadScript(scriptName, example.key);
            }
            catch (error) {
                console.error("Load Example", scriptName, error);
            }
            return example.script || "";
        }
        setExampleSelectOptions(exampleMap, exampleKey) {
            const maxTitleLength = 160;
            const maxTextLength = 60; // (32 visible?)
            const exampleSelect = document.getElementById("exampleSelect");
            exampleSelect.options.length = 0;
            for (const key of Object.keys(exampleMap)) {
                const example = exampleMap[key];
                if (example.meta !== "D") { // skip data files
                    const title = (key + ": " + example.title).substring(0, maxTitleLength);
                    const option = window.document.createElement("option");
                    option.value = key;
                    option.text = title.substring(0, maxTextLength);
                    option.title = title;
                    option.selected = key === exampleKey;
                    exampleSelect.add(option);
                }
            }
        }
        async getExampleMap(databaseItem) {
            if (databaseItem.exampleMap) {
                return databaseItem.exampleMap;
            }
            databaseItem.exampleMap = {};
            const scriptName = databaseItem.source + "/0index.js";
            try {
                await this.loadScript(scriptName, "0index");
            }
            catch (error) {
                console.error("Load Example Map ", scriptName, error);
            }
            return databaseItem.exampleMap;
        }
        setDatabaseSelectOptions(databaseMap, database) {
            const databaseSelect = document.getElementById("databaseSelect");
            databaseSelect.options.length = 0;
            for (const key of Object.keys(databaseMap)) {
                const example = databaseMap[key];
                const option = window.document.createElement("option");
                option.value = key;
                option.text = key;
                option.title = example.source;
                option.selected = key === database;
                databaseSelect.add(option);
            }
        }
        static fnDownloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const clickHandler = function () {
                setTimeout(function () {
                    URL.revokeObjectURL(url);
                    a.removeEventListener("click", clickHandler);
                }, 150);
            };
            a.href = url;
            a.download = filename;
            a.addEventListener("click", clickHandler, false);
            a.click();
        }
        getExampleName() {
            const input = this.basicCm ? this.basicCm.getValue() : "";
            const firstLine = input.slice(0, input.indexOf("\n"));
            const matches = firstLine.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
            const name = matches ? matches[1] : this.getCore().getConfigMap().example || "locobasic";
            return name;
        }
        getKeyFromBuffer() {
            const key = this.keyBuffer.length ? this.keyBuffer.shift() : "";
            return key;
        }
        putKeyInBuffer(key) {
            this.keyBuffer.push(key);
        }
        onOutputTextKeydown(event) {
            const key = event.key;
            if (key === "Escape") {
                this.escape = true;
            }
            else if (key === "Enter") {
                this.putKeyInBuffer("\x0d");
                event.preventDefault();
            }
            else if (key.length === 1 && event.ctrlKey === false && event.altKey === false) {
                this.putKeyInBuffer(key);
                event.preventDefault();
            }
        }
        static getErrorEventFn() {
            if (UI.getErrorEvent) {
                return UI.getErrorEvent;
            }
            const blob = new Blob([`(${workerFn})();`], { type: "text/javascript" });
            const worker = new Worker(window.URL.createObjectURL(blob));
            const processingQueue = [];
            let isProcessing = false;
            const processNext = () => {
                isProcessing = true;
                const { resolve, jsText } = processingQueue.shift();
                worker.addEventListener("message", ({ data }) => {
                    resolve(JSON.parse(data));
                    if (processingQueue.length) {
                        processNext();
                    }
                    else {
                        isProcessing = false;
                    }
                }, { once: true });
                worker.postMessage(jsText);
            };
            const getErrorEvent = (jsText) => {
                return new Promise((resolve) => {
                    processingQueue.push({ resolve, jsText });
                    if (!isProcessing) {
                        processNext();
                    }
                });
            };
            UI.getErrorEvent = getErrorEvent;
            return getErrorEvent;
        }
        static describeError(stringToEval, lineno, colno) {
            const lines = stringToEval.split("\n");
            const line = lines[lineno - 1];
            return `${line}\n${" ".repeat(colno - 1) + "^"}`;
        }
        async checkSyntax(str) {
            const getErrorEvent = UI.getErrorEventFn();
            let output = "";
            const { lineno, colno, message } = await getErrorEvent(str);
            if (message === "No Error: Parsing successful!") {
                return "";
            }
            output += `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`;
            output += UI.describeError(str, lineno - 2, colno) + "\n";
            output += message;
            return output;
        }
        fnDecodeUri(s) {
            let decoded = "";
            try {
                decoded = decodeURIComponent(s.replace(/\+/g, " "));
            }
            catch (err) {
                if (err instanceof Error) {
                    err.message += ": " + s;
                }
                console.error(err);
            }
            return decoded;
        }
        parseUri(config) {
            const urlQuery = window.location.search.substring(1);
            const rSearch = /([^&=]+)=?([^&]*)/g;
            const args = [];
            let match;
            while ((match = rSearch.exec(urlQuery)) !== null) {
                const name = this.fnDecodeUri(match[1]);
                const value = this.fnDecodeUri(match[2]);
                if (value !== null && config[name] !== undefined) {
                    args.push(name + "=" + value);
                }
            }
            return args;
        }
        onWindowLoadContinue(core, vm) {
            this.core = core;
            this.vm = vm;
            const config = core.getConfigMap();
            const args = this.parseUri(config);
            core.parseArgs(args, config);
            core.setOnCheckSyntax((s) => Promise.resolve(this.checkSyntax(s)));
            const compileButton = window.document.getElementById("compileButton");
            compileButton.addEventListener("click", this.onCompileButtonClick, false);
            const executeButton = window.document.getElementById("executeButton");
            executeButton.addEventListener("click", this.onExecuteButtonClick, false);
            const stopButton = window.document.getElementById("stopButton");
            stopButton.addEventListener("click", this.onStopButtonClick, false);
            const convertButton = window.document.getElementById("convertButton");
            convertButton.addEventListener("click", this.onConvertButtonClick, false);
            const labelAddButton = window.document.getElementById("labelAddButton");
            labelAddButton.addEventListener("click", this.onLabelAddButtonClick, false);
            const labelRemoveButton = window.document.getElementById("labelRemoveButton");
            labelRemoveButton.addEventListener("click", this.onLabelRemoveButtonClick, false);
            const autoCompileInput = window.document.getElementById("autoCompileInput");
            autoCompileInput.addEventListener("change", this.onAutoCompileInputChange, false);
            const autoExecuteInput = window.document.getElementById("autoExecuteInput");
            autoExecuteInput.addEventListener("change", this.onAutoExecuteInputChange, false);
            const showOutputInput = window.document.getElementById("showOutputInput");
            showOutputInput.addEventListener("change", this.onShowOutputInputChange, false);
            const showBasicInput = window.document.getElementById("showBasicInput");
            showBasicInput.addEventListener("change", this.onShowBasicInputChange, false);
            const showCompiledInput = window.document.getElementById("showCompiledInput");
            showCompiledInput.addEventListener("change", this.onShowCompiledInputChange, false);
            const databaseSelect = window.document.getElementById("databaseSelect");
            databaseSelect.addEventListener("change", this.onDatabaseSelectChange);
            const exampleSelect = window.document.getElementById("exampleSelect");
            exampleSelect.addEventListener("change", this.onExampleSelectChange);
            const helpButton = window.document.getElementById("helpButton");
            helpButton.addEventListener("click", this.onHelpButtonClick);
            const exportSvgButton = window.document.getElementById("exportSvgButton");
            exportSvgButton.addEventListener("click", this.onExportSvgButtonClick);
            const WinCodeMirror = window.CodeMirror;
            if (WinCodeMirror) {
                const getModeFn = LocoBasicMode.getMode;
                WinCodeMirror.defineMode("lbasic", getModeFn);
                const basicEditor = window.document.getElementById("basicEditor");
                this.basicCm = WinCodeMirror(basicEditor, {
                    lineNumbers: true,
                    mode: "lbasic"
                });
                this.basicCm.on("changes", this.debounce(this.onBasicTextChange, () => config.debounceCompile));
                const compiledEditor = window.document.getElementById("compiledEditor");
                this.compiledCm = WinCodeMirror(compiledEditor, {
                    lineNumbers: true,
                    mode: "javascript"
                });
                this.compiledCm.on("changes", this.debounce(this.onCompiledTextChange, () => config.debounceExecute));
            }
            // if the user navigate back...
            window.addEventListener("popstate", (event) => {
                if (event.state) {
                    Object.assign(config, core.getDefaultConfigMap); // load defaults
                    const args = this.parseUri(config);
                    core.parseArgs(args, config);
                    databaseSelect.dispatchEvent(new Event("change"));
                }
            });
            if (showOutputInput.checked !== config.showOutput) {
                showOutputInput.checked = config.showOutput;
                showOutputInput.dispatchEvent(new Event("change"));
            }
            if (showBasicInput.checked !== config.showBasic) {
                showBasicInput.checked = config.showBasic;
                showBasicInput.dispatchEvent(new Event("change"));
            }
            if (showCompiledInput.checked !== config.showCompiled) {
                showCompiledInput.checked = config.showCompiled;
                showCompiledInput.dispatchEvent(new Event("change"));
            }
            if (autoCompileInput.checked !== config.autoCompile) {
                autoCompileInput.checked = config.autoCompile;
                autoCompileInput.dispatchEvent(new Event("change"));
            }
            if (autoExecuteInput.checked !== config.autoExecute) {
                autoExecuteInput.checked = config.autoExecute;
                autoExecuteInput.dispatchEvent(new Event("change"));
            }
            UI.asyncDelay(() => {
                const databaseMap = core.initDatabaseMap();
                this.setDatabaseSelectOptions(databaseMap, config.database);
                const url = window.location.href;
                history.replaceState({}, "", url);
                databaseSelect.dispatchEvent(new Event("change"));
            }, 10);
        }
    }

    exports.UI = UI;

}));
//# sourceMappingURL=locobasicUI.js.map
