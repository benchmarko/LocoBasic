(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.locobasicUI = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    // UI.ts
    // based on: https://stackoverflow.com/questions/35252731/find-details-of-syntaxerror-thrown-by-javascript-new-function-constructor
    // https://stackoverflow.com/a/55555357
    const workerFn = () => {
        const doEvalAndReply = (jsText) => {
            self.addEventListener('error', (errorEvent) => {
                // Don't pollute the browser console:
                errorEvent.preventDefault();
                // The properties we want are actually getters on the prototype;
                // they won't be retrieved when just stringifying so, extract them manually, and put them into a new object:
                const { lineno, colno, message } = errorEvent;
                const plainErrorEventObj = { lineno, colno, message };
                self.postMessage(JSON.stringify(plainErrorEventObj));
            }, { once: true });
            /* const fn = */ new Function("_o", jsText);
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
        constructor(core) {
            this.core = core;
        }
        debounce(func, delayPara) {
            let timeoutId;
            const core = this.core;
            return function (...args) {
                const context = this;
                const delay = core.getConfig(delayPara);
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(context, args);
                }, delay);
            };
        }
        static asyncDelay(fn, timeout) {
            return (() => __awaiter(this, void 0, void 0, function* () {
                const timerId = setTimeout(fn, timeout);
                return timerId;
            }))();
        }
        getOutputText() {
            const outputText = document.getElementById("outputText");
            return outputText.value;
        }
        setOutputText(value) {
            const outputText = document.getElementById("outputText");
            outputText.value = value;
        }
        onExecuteButtonClick(_event) {
            return __awaiter(this, void 0, void 0, function* () {
                const compiledText = document.getElementById("compiledText");
                const compiledScript = this.compiledCm ? this.compiledCm.getValue() : compiledText.value;
                const output = yield this.core.executeScript(compiledScript);
                this.setOutputText(this.getOutputText() + output + (output.endsWith("\n") ? "" : "\n"));
            });
        }
        onCompiledTextChange(_event) {
            const autoExecuteInput = document.getElementById("autoExecuteInput");
            if (autoExecuteInput.checked) {
                const executeButton = window.document.getElementById("executeButton");
                executeButton.dispatchEvent(new Event('click'));
            }
        }
        onCompileButtonClick(_event) {
            const basicText = document.getElementById("basicText");
            const compiledText = document.getElementById("compiledText");
            const input = this.compiledCm ? this.basicCm.getValue() : basicText.value;
            const compiledScript = this.core.compileScript(input);
            if (this.compiledCm) {
                this.compiledCm.setValue(compiledScript);
            }
            else {
                compiledText.value = compiledScript;
                const autoExecuteInput = document.getElementById("autoExecuteInput");
                if (autoExecuteInput.checked) {
                    const newEvent = new Event('change');
                    compiledText.dispatchEvent(newEvent);
                }
            }
        }
        onbasicTextChange(_event) {
            return __awaiter(this, void 0, void 0, function* () {
                const autoCompileInput = document.getElementById("autoCompileInput");
                if (autoCompileInput.checked) {
                    const compileButton = window.document.getElementById("compileButton");
                    compileButton.dispatchEvent(new Event('click'));
                }
            });
        }
        setExampleSelect(name) {
            const exampleSelect = document.getElementById("exampleSelect");
            exampleSelect.value = name;
        }
        onExampleSelectChange(event) {
            const exampleSelect = event.target;
            const basicText = document.getElementById("basicText");
            const value = this.core.getExample(exampleSelect.value);
            this.setOutputText("");
            if (this.basicCm) {
                this.basicCm.setValue(value);
            }
            else {
                basicText.value = value;
                basicText.dispatchEvent(new Event('change'));
            }
        }
        setExampleSelectOptions(examples) {
            const exampleSelect = document.getElementById("exampleSelect");
            for (const key of Object.keys(examples)) {
                const script = examples[key];
                const firstLine = script.slice(0, script.indexOf("\n"));
                const option = window.document.createElement("option");
                option.value = key;
                option.text = key;
                option.title = firstLine;
                option.selected = false;
                exampleSelect.add(option);
            }
        }
        static getErrorEventFn() {
            if (UI.getErrorEvent) {
                return UI.getErrorEvent;
            }
            const blob = new Blob([`(${workerFn})();`], { type: "text/javascript" });
            const worker = new Worker(window.URL.createObjectURL(blob));
            // Use a queue to ensure processNext only calls the worker once the worker is idle
            const processingQueue = [];
            let processing = false;
            const processNext = () => {
                processing = true;
                const { resolve, jsText } = processingQueue.shift();
                worker.addEventListener('message', ({ data }) => {
                    resolve(JSON.parse(data));
                    if (processingQueue.length) {
                        processNext();
                    }
                    else {
                        processing = false;
                    }
                }, { once: true });
                worker.postMessage(jsText);
            };
            const getErrorEvent = (jsText) => new Promise((resolve) => {
                processingQueue.push({ resolve, jsText });
                if (!processing) {
                    processNext();
                }
            });
            UI.getErrorEvent = getErrorEvent;
            return getErrorEvent;
        }
        static describeError(stringToEval, lineno, colno) {
            const lines = stringToEval.split('\n');
            const line = lines[lineno - 1];
            return `${line}\n${' '.repeat(colno - 1) + '^'}`;
        }
        checkSyntax(str) {
            return __awaiter(this, void 0, void 0, function* () {
                const getErrorEvent = UI.getErrorEventFn();
                let output = "";
                const { lineno, colno, message } = yield getErrorEvent(str);
                if (message === 'No Error: Parsing successful!') {
                    return "";
                }
                output += `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`; // lineNo -2 because of anonymous function added by new Function() constructor
                output += UI.describeError(str, lineno - 2, colno);
                return output;
            });
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
        // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
        parseUri(urlQuery, config) {
            const rSearch = /([^&=]+)=?([^&]*)/g, args = [];
            let match;
            while ((match = rSearch.exec(urlQuery)) !== null) {
                const name = this.fnDecodeUri(match[1]), value = this.fnDecodeUri(match[2]);
                if (value !== null && config[name] !== undefined) {
                    args.push(name + "=" + value);
                }
            }
            return args;
        }
        onWindowLoad(_event) {
            const basicText = window.document.getElementById("basicText");
            basicText.addEventListener('change', (event) => this.onbasicTextChange(event));
            const compiledText = window.document.getElementById("compiledText");
            compiledText.addEventListener('change', (event) => this.onCompiledTextChange(event));
            const compileButton = window.document.getElementById("compileButton");
            compileButton.addEventListener('click', (event) => this.onCompileButtonClick(event), false);
            const executeButton = window.document.getElementById("executeButton");
            executeButton.addEventListener('click', (event) => this.onExecuteButtonClick(event), false);
            const exampleSelect = window.document.getElementById("exampleSelect");
            exampleSelect.addEventListener('change', (event) => this.onExampleSelectChange(event));
            const WinCodeMirror = window.CodeMirror;
            if (WinCodeMirror) {
                this.basicCm = WinCodeMirror.fromTextArea(basicText, {
                    lineNumbers: true,
                    mode: 'javascript'
                });
                this.basicCm.on('changes', this.debounce((event) => this.onbasicTextChange(event), "debounceCompile"));
                this.compiledCm = WinCodeMirror.fromTextArea(compiledText, {
                    lineNumbers: true,
                    mode: 'javascript'
                });
                this.compiledCm.on('changes', this.debounce((event) => this.onCompiledTextChange(event), "debounceExecute"));
            }
            UI.asyncDelay(() => {
                const core = this.core;
                this.setExampleSelectOptions(core.getExampleObject());
                const example = this.core.getConfig("example");
                if (example) {
                    this.setExampleSelect(example);
                }
                exampleSelect.dispatchEvent(new Event('change'));
            }, 10);
        }
    }

    exports.UI = UI;

}));
//# sourceMappingURL=locobasicUI.js.map
