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

    const basicErrors = [
        "Improper argument", // 0
        "Unexpected NEXT", // 1
        "Syntax Error", // 2
        "Unexpected RETURN", // 3
        "DATA exhausted", // 4
        "Improper argument", // 5
        "Overflow", // 6
        "Memory full", // 7
        "Line does not exist", // 8
        "Subscript out of range", // 9
        "Array already dimensioned", // 10
        "Division by zero", // 11
        "Invalid direct command", // 12
        "Type mismatch", // 13
        "String space full", // 14
        "String too long", // 15
        "String expression too complex", // 16
        "Cannot CONTinue", // 17
        "Unknown user function", // 18
        "RESUME missing", // 19
        "Unexpected RESUME", // 20
        "Direct command found", // 21
        "Operand missing", // 22
        "Line too long", // 23
        "EOF met", // 24
        "File type error", // 25
        "NEXT missing", // 26
        "File already open", // 27
        "Unknown command", // 28
        "WEND missing", // 29
        "Unexpected WEND", // 30
        "File not open", // 31,
        "Broken", // 32 "Broken in" (derr=146: xxx not found)
        "Unknown error" // 33...
    ];
    class VmMain {
        constructor(workerScript, setUiKeysFn, onSpeakFn) {
            this.code = "";
            this.workerOnMessageHandler = (event) => {
                const data = event.data;
                const result = document.getElementById('outputText');
                switch (data.type) {
                    case 'frame':
                        if (data.needCls) {
                            result.innerHTML = data.message;
                        }
                        else {
                            result.innerHTML += data.message;
                        }
                        break;
                    case 'input':
                        setTimeout(() => {
                            const userInput = prompt(data.prompt);
                            if (this.worker) {
                                this.worker.postMessage({ type: 'input', prompt: userInput });
                            }
                        }, 50); // 50ms delay to allow UI update
                        break;
                    case 'keyDef':
                        this.setUiKeysFn(data.codes);
                        break;
                    case 'result': {
                        let res = data.result || "";
                        if (res.startsWith("{")) {
                            const json = JSON.parse(res);
                            const { lineno, colno, message } = json;
                            if (message === "No Error: Parsing successful!") {
                                res = "";
                            }
                            else {
                                res = `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`
                                    + VmMain.describeError(this.code, lineno - 2, colno) + "\n"
                                    + message;
                            }
                        }
                        else if (res === "Error: INFO: Program stopped") {
                            res = "";
                        }
                        else {
                            const match1 = res.match(/^Error: (\d+)$/);
                            if (match1) {
                                res += ": " + basicErrors[Number(match1[1])];
                            }
                        }
                        if (this.finishedResolverFn) {
                            this.finishedResolverFn(res);
                            this.finishedResolverFn = undefined;
                        }
                        break;
                    }
                    case 'speak': {
                        const finishedPromise = this.onSpeakFn(data.message, data.pitch);
                        finishedPromise.then(() => {
                            if (this.worker) {
                                this.worker.postMessage({ type: 'continue' });
                            }
                        }).catch((msg) => {
                            console.log(msg);
                            if (this.worker) {
                                this.worker.postMessage({ type: 'stop' });
                                this.worker.postMessage({ type: 'continue' });
                            }
                        });
                        break;
                    }
                }
            };
            this.handleBeforeUnload = () => {
                var _a;
                (_a = this.worker) === null || _a === void 0 ? void 0 : _a.terminate();
            };
            this.workerScript = workerScript;
            this.setUiKeysFn = setUiKeysFn;
            this.onSpeakFn = onSpeakFn;
            window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
        }
        static describeError(stringToEval, lineno, colno) {
            const lines = stringToEval.split("\n");
            const line = lines[lineno - 1];
            return `${line}\n${" ".repeat(colno - 1) + "^"}`;
        }
        getOrCreateWorker() {
            if (!this.worker) {
                const blob = new Blob([this.workerScript], { type: "text/javascript" });
                const objectURL = window.URL.createObjectURL(blob);
                this.worker = new Worker(objectURL);
                window.URL.revokeObjectURL(objectURL);
                this.worker.onmessage = this.workerOnMessageHandler;
            }
            return this.worker;
        }
        run(code) {
            if (!code.endsWith("\n")) {
                code += "\n"; // make sure the script end with a new line (needed for line comment in last line)
            }
            this.code = code; // for error message
            const worker = this.getOrCreateWorker();
            const finishedPromise = new Promise((resolve) => {
                this.finishedResolverFn = resolve;
            });
            worker.postMessage({ type: 'run', code });
            return finishedPromise;
        }
        stop() {
            if (this.worker) {
                console.log("stop: Stop requested.");
                this.worker.postMessage({ type: 'stop' });
            }
        }
        reset() {
            if (this.worker) {
                this.worker.terminate();
                this.worker = undefined;
                console.log("reset: Worker terminated.");
            }
            if (this.finishedResolverFn) {
                this.finishedResolverFn("terminated.");
                this.finishedResolverFn = undefined;
            }
        }
        putKeys(keys) {
            if (this.worker) {
                console.log("putKeys: key:", keys);
                this.worker.postMessage({ type: 'putKeys', keys });
            }
        }
    }

    const escapeText = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    class UI {
        constructor() {
            this.compiledMessages = [];
            this.initialUserAction = false;
            this.onSetUiKeys = (codes) => {
                if (codes.length) {
                    const code = codes[0];
                    const userKeys = document.getElementById("userKeys");
                    if (code) {
                        const char = String.fromCharCode(code);
                        const buttonStr = `<button data-key="${code}" title="${char}">${char}</button>`;
                        userKeys.innerHTML += buttonStr;
                    }
                    else {
                        userKeys.innerHTML = "";
                    }
                }
            };
            this.onSpeak = async (text, pitch) => {
                const debug = this.getCore().getConfigMap().debug;
                if (debug) {
                    console.log("onSpeak: ", text, pitch);
                }
                const msg = await this.getSpeechSynthesisUtterance();
                const stopButton = window.document.getElementById("stopButton");
                if (stopButton.disabled) { // Stop button inactive, program already stopped?
                    return Promise.reject("Speech canceled.");
                }
                msg.text = text;
                msg.pitch = pitch; // 0 to 2
                return new Promise((resolve, reject) => {
                    msg.onend = () => resolve();
                    msg.onerror = (event) => {
                        reject(new Error(`Speech synthesis: ${event.error}`));
                    };
                    window.speechSynthesis.speak(msg);
                });
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onExecuteButtonClick = async (_event) => {
                var _a, _b;
                if (this.hasCompiledError()) {
                    return;
                }
                this.beforeExecute();
                const compiledScript = ((_a = this.compiledCm) === null || _a === void 0 ? void 0 : _a.getValue()) || ""; // Execute the compiled script
                const output = await ((_b = this.vmMain) === null || _b === void 0 ? void 0 : _b.run(compiledScript));
                if (output) { // some remaining output?
                    this.addOutputText(output);
                }
                if (this.compiledMessages.length) { // compile warning messages?
                    const messageString = escapeText(this.compiledMessages.join("\n"));
                    this.addOutputText(`<hr><details><summary>Compile warning messages: ${this.compiledMessages.length}</summary>${messageString}</details>`);
                }
                this.afterExecute();
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
                this.setButtonOrSelectDisabled("compileButton", true);
                const input = this.basicCm ? this.basicCm.getValue() : "";
                UI.asyncDelay(() => {
                    const { compiledScript, messages } = core.compileScript(input);
                    this.compiledMessages = messages;
                    if (this.compiledCm) {
                        this.compiledCm.setValue(compiledScript);
                    }
                    this.setButtonOrSelectDisabled("compileButton", false);
                    if (!compiledScript.startsWith("ERROR:")) {
                        this.setButtonOrSelectDisabled("labelRemoveButton", false);
                    }
                }, 1);
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onEnterButtonClick = (_event) => {
                this.putKeysInBuffer("\x0d");
                this.clickStartSpeechButton(); // we just did a user interaction
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
                this.toggleElementHidden("outputArea");
                this.updateConfigParameter("showOutput", showOutputInput.checked);
            };
            this.onShowBasicInputChange = (event) => {
                const showBasicInput = event.target;
                this.toggleElementHidden("basicArea", this.basicCm);
                this.updateConfigParameter("showBasic", showBasicInput.checked);
            };
            this.onShowCompiledInputChange = (event) => {
                const showCompiledInput = event.target;
                this.toggleElementHidden("compiledArea", this.compiledCm);
                this.updateConfigParameter("showCompiled", showCompiledInput.checked);
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onStopButtonClick = (_event) => {
                var _a;
                this.cancelSpeech(); // maybe a speech was waiting
                this.clickStartSpeechButton(); // we just did a user interaction
                this.setButtonOrSelectDisabled("stopButton", true);
                (_a = this.vmMain) === null || _a === void 0 ? void 0 : _a.stop();
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onResetButtonClick = (_event) => {
                var _a;
                this.cancelSpeech();
                this.clickStartSpeechButton(); // we just did a user interaction
                (_a = this.vmMain) === null || _a === void 0 ? void 0 : _a.reset();
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.onConvertButtonClick = (_event) => {
                this.toggleElementHidden("convertArea");
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
                const semantics = core.getSemantics();
                const usedLabels = semantics.getUsedLabels();
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
                this.setButtonOrSelectDisabled("labelRemoveButton", true);
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
            this.fnOnClickHandler = (event) => this.onOutputTextClick(event);
            this.fnOnUserKeyClickHandler = (event) => this.onUserKeyClick(event);
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
        cancelSpeech() {
            if (this.speechSynthesisUtterance && this.speechSynthesisUtterance.text) {
                window.speechSynthesis.cancel();
            }
        }
        toggleElementHidden(id, editor) {
            const element = document.getElementById(id);
            element.hidden = !element.hidden;
            if (!element.hidden && editor) {
                editor.refresh();
            }
            return !element.hidden;
        }
        setElementHidden(id) {
            const element = document.getElementById(id);
            if (!element.hidden) {
                element.hidden = true;
            }
            return element.hidden;
        }
        setButtonOrSelectDisabled(id, disabled) {
            const element = window.document.getElementById(id);
            element.disabled = disabled;
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
        scrollToBottom(id) {
            const element = document.getElementById(id);
            element.scrollTop = element.scrollHeight;
        }
        addOutputText(value, hasGraphics) {
            const outputText = document.getElementById("outputText");
            outputText.innerHTML += value;
            if (hasGraphics) {
                this.setButtonOrSelectDisabled("exportSvgButton", false);
            }
            else {
                this.scrollToBottom("outputText");
            }
        }
        setOutputText(value) {
            const outputText = document.getElementById("outputText");
            outputText.innerText = value;
            this.setButtonOrSelectDisabled("exportSvgButton", true);
        }
        onUserKeyClick(event) {
            const target = event.target;
            const dataKey = target.getAttribute("data-key");
            this.putKeysInBuffer(String.fromCharCode(Number(dataKey)));
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
        async waitForVoices(callback) {
            return new Promise((resolve) => {
                window.speechSynthesis.addEventListener("voiceschanged", () => {
                    callback();
                    resolve();
                }, { once: true });
                if (window.speechSynthesis.getVoices().length) {
                    callback();
                    resolve();
                }
            });
        }
        async waitForUserInteraction(buttonId) {
            this.toggleElementHidden(buttonId);
            const button = document.getElementById(buttonId);
            return new Promise((resolve) => {
                button.addEventListener("click", () => {
                    this.setElementHidden(buttonId);
                    resolve();
                }, { once: true });
            });
        }
        logVoiceDebugInfo(selectedVoice) {
            const debug = this.getCore().getConfigMap().debug;
            if (debug > 1) {
                const voicesString = window.speechSynthesis.getVoices().map((v, i) => `${i}: ${v.lang}: ${v.name}`).join("\n ");
                const msg = `getSpeechSynthesisUtterance: voice=${selectedVoice === null || selectedVoice === void 0 ? void 0 : selectedVoice.lang}: ${selectedVoice === null || selectedVoice === void 0 ? void 0 : selectedVoice.name}, voices:\n ${voicesString}`;
                console.log(msg);
                if (debug >= 16) {
                    this.addOutputText(msg + "\n");
                }
            }
        }
        async getSpeechSynthesisUtterance() {
            if (this.speechSynthesisUtterance) {
                return this.speechSynthesisUtterance;
            }
            if (!window.speechSynthesis) {
                throw new Error("Speech Synthesis API is not supported in this browser.");
            }
            this.speechSynthesisUtterance = new SpeechSynthesisUtterance();
            const utterance = this.speechSynthesisUtterance;
            utterance.lang = document.documentElement.lang || "en";
            const selectVoice = () => {
                const voices = window.speechSynthesis.getVoices();
                return voices.find((voice) => voice.lang === "en-GB" && voice.name === "Daniel");
            };
            const onVoicesChanged = () => {
                const selectedVoice = selectVoice();
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
                this.logVoiceDebugInfo(selectedVoice);
            };
            await this.waitForVoices(onVoicesChanged);
            if (!this.initialUserAction) {
                await this.waitForUserInteraction("startSpeechButton");
            }
            return utterance;
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
        hasCompiledError() {
            const compiledScript = this.compiledCm ? this.compiledCm.getValue() : "";
            const hasError = compiledScript.startsWith("ERROR:");
            this.setOutputText(hasError ? compiledScript : "");
            return hasError;
        }
        // Helper function to update button states
        updateButtonStates(states) {
            Object.entries(states).forEach(([id, disabled]) => {
                this.setButtonOrSelectDisabled(id, disabled);
            });
        }
        beforeExecute() {
            this.setElementHidden("convertArea");
            const buttonStates = {
                enterButton: false,
                executeButton: true,
                stopButton: false,
                convertButton: true,
                databaseSelect: true,
                exampleSelect: true
            };
            this.updateButtonStates(buttonStates);
            const outputText = document.getElementById("outputText");
            outputText.setAttribute("contenteditable", "false");
            outputText.addEventListener("keydown", this.fnOnKeyPressHandler, false);
            outputText.addEventListener("click", this.fnOnClickHandler, false);
            const userKeys = document.getElementById("userKeys");
            userKeys.addEventListener("click", this.fnOnUserKeyClickHandler, false);
        }
        afterExecute() {
            const outputText = document.getElementById("outputText");
            outputText.removeEventListener("keydown", this.fnOnKeyPressHandler, false);
            outputText.removeEventListener("click", this.fnOnClickHandler, false);
            outputText.setAttribute("contenteditable", "true");
            this.onSetUiKeys([0]); // remove user keys
            this.updateButtonStates({
                enterButton: true,
                executeButton: false,
                stopButton: true,
                convertButton: false,
                databaseSelect: false,
                exampleSelect: false
            });
        }
        clickStartSpeechButton() {
            const startSpeechButton = window.document.getElementById("startSpeechButton");
            if (!startSpeechButton.hidden) { // if the startSpeech button is visible, activate it to allow speech
                startSpeechButton.dispatchEvent(new Event("click"));
            }
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
        putKeysInBuffer(keys) {
            var _a;
            (_a = this.vmMain) === null || _a === void 0 ? void 0 : _a.putKeys(keys);
        }
        onOutputTextKeydown(event) {
            var _a;
            const key = event.key;
            if (key === "Escape") {
                this.cancelSpeech();
                (_a = this.vmMain) === null || _a === void 0 ? void 0 : _a.stop(); // request stop
            }
            else if (key === "Enter") {
                this.putKeysInBuffer("\x0d");
                event.preventDefault();
            }
            else if (key.length === 1 && event.ctrlKey === false && event.altKey === false) {
                this.putKeysInBuffer(key);
                event.preventDefault();
            }
        }
        getClickedKey(e) {
            let textNode = null;
            let offset;
            if (document.caretPositionFromPoint) {
                const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
                if (!caretPosition) {
                    return;
                }
                textNode = caretPosition.offsetNode;
                offset = caretPosition.offset;
            }
            else if (document.caretRangeFromPoint) {
                // Use WebKit-proprietary fallback method
                const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                if (!range) {
                    return;
                }
                textNode = range.startContainer;
                offset = range.startOffset;
            }
            else {
                return;
            }
            if ((textNode === null || textNode === void 0 ? void 0 : textNode.nodeType) === 3) { // Check if the node is a text node
                const textContent = textNode.textContent;
                return textContent ? textContent.charAt(offset) : "";
            }
        }
        onOutputTextClick(event) {
            const key = this.getClickedKey(event);
            if (key) {
                this.putKeysInBuffer(key);
                event.preventDefault(); // Prevent default action if needed
            }
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
        initializeEditor(editorId, mode, changeHandler, debounceDelay) {
            const editorElement = window.document.getElementById(editorId);
            const editor = window.CodeMirror(editorElement, {
                lineNumbers: true,
                mode,
            });
            editor.on("changes", this.debounce(changeHandler, () => debounceDelay)); // changeHandler.bind(this)
            return editor;
        }
        syncInputState(inputId, configValue) {
            const input = window.document.getElementById(inputId);
            if (input.checked !== configValue) {
                input.checked = configValue;
                input.dispatchEvent(new Event("change"));
            }
        }
        onWindowLoadContinue(core, workerFn) {
            this.core = core;
            const config = core.getConfigMap();
            const args = this.parseUri(config);
            core.parseArgs(args, config);
            // Map of element IDs to event handlers
            const buttonHandlers = {
                compileButton: this.onCompileButtonClick,
                enterButton: this.onEnterButtonClick,
                executeButton: this.onExecuteButtonClick,
                stopButton: this.onStopButtonClick,
                resetButton: this.onResetButtonClick,
                convertButton: this.onConvertButtonClick,
                labelAddButton: this.onLabelAddButtonClick,
                labelRemoveButton: this.onLabelRemoveButtonClick,
                helpButton: this.onHelpButtonClick,
                exportSvgButton: this.onExportSvgButtonClick,
            };
            const inputAndSelectHandlers = {
                autoCompileInput: this.onAutoCompileInputChange,
                autoExecuteInput: this.onAutoExecuteInputChange,
                showOutputInput: this.onShowOutputInputChange,
                showBasicInput: this.onShowBasicInputChange,
                showCompiledInput: this.onShowCompiledInputChange,
                databaseSelect: this.onDatabaseSelectChange,
                exampleSelect: this.onExampleSelectChange,
            };
            // Attach event listeners for buttons
            Object.entries(buttonHandlers).forEach(([id, handler]) => {
                const element = window.document.getElementById(id);
                element.addEventListener("click", handler, false);
            });
            // Attach event listeners for inputs or selects
            Object.entries(inputAndSelectHandlers).forEach(([id, handler]) => {
                const element = window.document.getElementById(id);
                element.addEventListener("change", handler, false); // handler.bind(this)
            });
            // Initialize CodeMirror editors
            const WinCodeMirror = window.CodeMirror;
            if (WinCodeMirror) {
                const getModeFn = LocoBasicMode.getMode;
                WinCodeMirror.defineMode("lbasic", getModeFn);
                this.basicCm = this.initializeEditor("basicEditor", "lbasic", this.onBasicTextChange, config.debounceCompile);
                this.compiledCm = this.initializeEditor("compiledEditor", "javascript", this.onCompiledTextChange, config.debounceExecute);
            }
            // Handle browser navigation (popstate)
            window.addEventListener("popstate", (event) => {
                if (event.state) {
                    Object.assign(config, core.getDefaultConfigMap()); // load defaults
                    const args = this.parseUri(config);
                    core.parseArgs(args, config);
                    const databaseSelect = window.document.getElementById("databaseSelect");
                    databaseSelect.dispatchEvent(new Event("change"));
                }
            });
            // Sync UI state with config
            this.syncInputState("showOutputInput", config.showOutput);
            this.syncInputState("showBasicInput", config.showBasic);
            this.syncInputState("showCompiledInput", config.showCompiled);
            this.syncInputState("autoCompileInput", config.autoCompile);
            this.syncInputState("autoExecuteInput", config.autoExecute);
            window.document.addEventListener("click", () => {
                this.initialUserAction = true;
            }, { once: true });
            const workerScript = `(${workerFn})();`;
            this.vmMain = new VmMain(workerScript, this.onSetUiKeys, this.onSpeak);
            // Initialize database and examples
            UI.asyncDelay(() => {
                const databaseMap = core.initDatabaseMap();
                this.setDatabaseSelectOptions(databaseMap, config.database);
                const url = window.location.href;
                history.replaceState({}, "", url);
                const databaseSelect = window.document.getElementById("databaseSelect");
                databaseSelect.dispatchEvent(new Event("change"));
            }, 10);
        }
    }

    exports.UI = UI;

}));
//# sourceMappingURL=locobasicUI.js.map
