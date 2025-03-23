(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.locobasicUI = {}));
})(this, (function (exports) { 'use strict';

    // Worker function to handle JavaScript evaluation and error reporting
    const workerFn = () => {
        const doEvalAndReply = (jsText) => {
            self.addEventListener('error', (errorEvent) => {
                errorEvent.preventDefault();
                const { lineno, colno, message } = errorEvent;
                const plainErrorEventObj = { lineno, colno, message };
                self.postMessage(JSON.stringify(plainErrorEventObj));
            }, { once: true });
            new Function("_o", jsText);
            const plainErrorEventObj = {
                lineno: -1,
                colno: -1,
                message: 'No Error: Parsing successful!'
            };
            self.postMessage(JSON.stringify(plainErrorEventObj));
        };
        self.addEventListener('message', (e) => {
            doEvalAndReply(e.data);
        });
    };
    class UI {
        constructor() {
            this.keyBuffer = []; // buffered pressed keys
            this.escape = false;
            this.fnOnKeyPressHandler = (event) => this.onOutputTextKeydown(event);
        }
        debounce(func, fngetDelay) {
            let timeoutId;
            return function (...args) {
                const context = this;
                const delay = fngetDelay();
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(context, args);
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
        toggleAreaHidden(id, editor) {
            const area = document.getElementById(id);
            area.hidden = !area.hidden;
            if (!area.hidden && editor) {
                editor.refresh();
            }
            const parameterName = id.replace("Inner", "Hidden");
            this.updateConfigParameter(parameterName, area.hidden);
            return !area.hidden;
        }
        setClearLeft(id, clearLeft) {
            const area = document.getElementById(id);
            area.style.clear = clearLeft ? "left" : "";
        }
        onBasicAreaButtonClick(_event) {
            const basicVisible = this.toggleAreaHidden("basicAreaInner", this.basicCm);
            const compiledAreaInner = document.getElementById("compiledAreaInner");
            this.setClearLeft("compiledArea", !basicVisible || compiledAreaInner.hidden);
        }
        onCompiledAreaButtonClick(_event) {
            const compiledVisible = this.toggleAreaHidden("compiledAreaInner", this.compiledCm);
            const basicAreaInner = document.getElementById("basicAreaInner");
            this.setClearLeft("compiledArea", !compiledVisible || basicAreaInner.hidden);
            const outputAreaInner = document.getElementById("outputAreaInner");
            this.setClearLeft("outputArea", !compiledVisible || outputAreaInner.hidden);
        }
        onOutputAreaButtonClick(_event) {
            const outputVisible = this.toggleAreaHidden("outputAreaInner");
            const compiledAreaInner = document.getElementById("compiledAreaInner");
            this.setClearLeft("outputArea", !outputVisible || compiledAreaInner.hidden);
        }
        async onExecuteButtonClick(_event) {
            const core = this.getCore();
            if (!this.vm) {
                return;
            }
            const compiledScript = this.compiledCm ? this.compiledCm.getValue() : "";
            this.setButtonDisabled("executeButton", true);
            this.setButtonDisabled("stopButton", false);
            this.setSelectDisabled("databaseSelect", true);
            this.setSelectDisabled("exampleSelect", true);
            this.escape = false;
            this.keyBuffer.length = 0;
            const outputText = window.document.getElementById("outputText");
            outputText.addEventListener("keydown", this.fnOnKeyPressHandler, false);
            const output = await core.executeScript(compiledScript, this.vm) || "";
            outputText.removeEventListener("keydown", this.fnOnKeyPressHandler, false);
            this.setButtonDisabled("executeButton", false);
            this.setButtonDisabled("stopButton", true);
            this.setSelectDisabled("databaseSelect", false);
            this.setSelectDisabled("exampleSelect", false);
            this.addOutputText(output + (output.endsWith("\n") ? "" : "\n"));
        }
        onCompiledTextChange() {
            const autoExecuteInput = document.getElementById("autoExecuteInput");
            if (autoExecuteInput.checked) {
                const executeButton = window.document.getElementById("executeButton");
                if (!executeButton.disabled) {
                    executeButton.dispatchEvent(new Event('click'));
                }
            }
        }
        onCompileButtonClick(_event) {
            const core = this.getCore();
            this.setButtonDisabled("compileButton", true);
            const input = this.basicCm ? this.basicCm.getValue() : "";
            UI.asyncDelay(() => {
                const compiledScript = core.compileScript(input) || "";
                if (this.compiledCm) {
                    this.compiledCm.setValue(compiledScript);
                }
                this.setButtonDisabled("compileButton", false);
            }, 1);
        }
        onStopButtonClick(_event) {
            this.escape = true;
            this.setButtonDisabled("stopButton", true);
        }
        async onBasicTextChange() {
            const autoCompileInput = document.getElementById("autoCompileInput");
            if (autoCompileInput.checked) {
                const compileButton = window.document.getElementById("compileButton");
                if (!compileButton.disabled) {
                    compileButton.dispatchEvent(new Event('click'));
                }
            }
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
            return example.script || ""; //TTT
        }
        async onExampleSelectChange(event) {
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
        async onDatabaseSelectChange(event) {
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
            exampleSelect.dispatchEvent(new Event('change'));
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
        onHelpButtonClick() {
            window.open("https://github.com/benchmarko/LocoBasic/#readme");
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
        onExportSvgButtonClick() {
            const outputText = window.document.getElementById("outputText");
            const svgElements = outputText.getElementsByTagName("svg");
            if (!svgElements.length) {
                console.warn("onExportSvgButtonClick: No SVG found.");
                return;
            }
            const svgElement = svgElements[0];
            // svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            const svgData = svgElement.outerHTML;
            const preface = '<?xml version="1.0" standalone="no"?>\r\n';
            const svgBlob = new Blob([preface, svgData], {
                type: "image/svg+xml;charset=utf-8"
            });
            const example = this.getExampleName();
            const filename = `${example}.svg`;
            UI.fnDownloadBlob(svgBlob, filename);
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
                worker.addEventListener('message', ({ data }) => {
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
            const lines = stringToEval.split('\n');
            const line = lines[lineno - 1];
            return `${line}\n${' '.repeat(colno - 1) + '^'}`;
        }
        async checkSyntax(str) {
            const getErrorEvent = UI.getErrorEventFn();
            let output = "";
            const { lineno, colno, message } = await getErrorEvent(str);
            if (message === 'No Error: Parsing successful!') {
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
            compileButton.addEventListener('click', (event) => this.onCompileButtonClick(event), false);
            const executeButton = window.document.getElementById("executeButton");
            executeButton.addEventListener('click', (event) => this.onExecuteButtonClick(event), false);
            const stopButton = window.document.getElementById("stopButton");
            stopButton.addEventListener('click', (event) => this.onStopButtonClick(event), false);
            const databaseSelect = window.document.getElementById("databaseSelect");
            databaseSelect.addEventListener('change', (event) => this.onDatabaseSelectChange(event));
            const exampleSelect = window.document.getElementById("exampleSelect");
            exampleSelect.addEventListener('change', (event) => this.onExampleSelectChange(event));
            const helpButton = window.document.getElementById("helpButton");
            helpButton.addEventListener('click', () => this.onHelpButtonClick());
            const exportSvgButton = window.document.getElementById("exportSvgButton");
            exportSvgButton.addEventListener('click', () => this.onExportSvgButtonClick());
            const WinCodeMirror = window.CodeMirror;
            if (WinCodeMirror) {
                const basicEditor = window.document.getElementById("basicEditor");
                this.basicCm = WinCodeMirror(basicEditor, {
                    lineNumbers: true,
                    mode: 'javascript' // should be 'basic' but not available
                });
                this.basicCm.on('changes', this.debounce(() => this.onBasicTextChange(), () => config.debounceCompile));
                const compiledEditor = window.document.getElementById("compiledEditor");
                this.compiledCm = WinCodeMirror(compiledEditor, {
                    lineNumbers: true,
                    mode: 'javascript'
                });
                this.compiledCm.on('changes', this.debounce(() => this.onCompiledTextChange(), () => config.debounceExecute));
            }
            const basicAreaButton = window.document.getElementById("basicAreaButton");
            basicAreaButton.addEventListener('click', (event) => this.onBasicAreaButtonClick(event), false);
            const compiledAreaButton = window.document.getElementById("compiledAreaButton");
            compiledAreaButton.addEventListener('click', (event) => this.onCompiledAreaButtonClick(event), false);
            const outputAreaButton = window.document.getElementById("outputAreaButton");
            outputAreaButton.addEventListener('click', (event) => this.onOutputAreaButtonClick(event), false);
            window.addEventListener("popstate", (event) => {
                if (event.state) {
                    Object.assign(config, core.getDefaultConfigMap); // load defaults
                    const args = this.parseUri(config);
                    core.parseArgs(args, config);
                    databaseSelect.dispatchEvent(new Event('change'));
                }
            });
            if (config.basicAreaHidden) {
                this.onBasicAreaButtonClick(new Event('click'));
            }
            if (config.compiledAreaHidden) {
                this.onCompiledAreaButtonClick(new Event('click'));
            }
            if (config.outputAreaHidden) {
                this.onOutputAreaButtonClick(new Event('click'));
            }
            UI.asyncDelay(() => {
                const databaseMap = core.initDatabaseMap();
                this.setDatabaseSelectOptions(databaseMap, config.database);
                const url = window.location.href;
                history.replaceState({}, "", url);
                databaseSelect.dispatchEvent(new Event('change'));
            }, 10);
        }
    }

    exports.UI = UI;

}));
//# sourceMappingURL=locobasicUI.js.map
