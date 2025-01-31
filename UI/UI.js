// UI.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export class UI {
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
    addOutputText(value) {
        const outputText = document.getElementById("outputText");
        outputText.innerHTML += value;
    }
    setOutputText(value) {
        const outputText = document.getElementById("outputText");
        outputText.innerText = value;
    }
    getPaperColors() {
        return UI.colorsForPens.map((color) => `<span style="background-color: ${color}">`);
    }
    getPenColors() {
        return UI.colorsForPens.map((color) => `<span style="color: ${color}">`);
    }
    onExecuteButtonClick(_event) {
        return __awaiter(this, void 0, void 0, function* () {
            const compiledText = document.getElementById("compiledText");
            const compiledScript = this.compiledCm ? this.compiledCm.getValue() : compiledText.value;
            const output = yield this.core.executeScript(compiledScript);
            this.addOutputText(output + (output.endsWith("\n") ? "" : "\n"));
        });
    }
    onCompiledTextChange() {
        const autoExecuteInput = document.getElementById("autoExecuteInput");
        if (autoExecuteInput.checked) {
            const executeButton = window.document.getElementById("executeButton");
            executeButton.dispatchEvent(new Event('click'));
        }
    }
    onCompileButtonClick(_event) {
        const basicText = document.getElementById("basicText");
        const compiledText = document.getElementById("compiledText");
        const input = this.basicCm ? this.basicCm.getValue() : basicText.value;
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
    onbasicTextChange() {
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
    onHelpButtonClick() {
        window.open("https://github.com/benchmarko/LocoBasic/#readme");
    }
    static getErrorEventFn() {
        if (UI.getErrorEvent) {
            return UI.getErrorEvent;
        }
        const blob = new Blob([`(${workerFn})();`], { type: "text/javascript" });
        const worker = new Worker(window.URL.createObjectURL(blob));
        // Use a queue to ensure processNext only calls the worker once the worker is idle
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
    checkSyntax(str) {
        return __awaiter(this, void 0, void 0, function* () {
            const getErrorEvent = UI.getErrorEventFn();
            let output = "";
            const { lineno, colno, message } = yield getErrorEvent(str);
            if (message === 'No Error: Parsing successful!') {
                return "";
            }
            output += `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`; // lineNo -2 because of anonymous function added by new Function() constructor
            output += UI.describeError(str, lineno - 2, colno) + "\n";
            output += message;
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
        basicText.addEventListener('change', () => this.onbasicTextChange());
        const compiledText = window.document.getElementById("compiledText");
        compiledText.addEventListener('change', () => this.onCompiledTextChange());
        const compileButton = window.document.getElementById("compileButton");
        compileButton.addEventListener('click', (event) => this.onCompileButtonClick(event), false);
        const executeButton = window.document.getElementById("executeButton");
        executeButton.addEventListener('click', (event) => this.onExecuteButtonClick(event), false);
        const exampleSelect = window.document.getElementById("exampleSelect");
        exampleSelect.addEventListener('change', (event) => this.onExampleSelectChange(event));
        const helpButton = window.document.getElementById("helpButton");
        helpButton.addEventListener('click', () => this.onHelpButtonClick());
        const WinCodeMirror = window.CodeMirror;
        if (WinCodeMirror) {
            this.basicCm = WinCodeMirror.fromTextArea(basicText, {
                lineNumbers: true,
                mode: 'javascript'
            });
            this.basicCm.on('changes', this.debounce(() => this.onbasicTextChange(), "debounceCompile"));
            this.compiledCm = WinCodeMirror.fromTextArea(compiledText, {
                lineNumbers: true,
                mode: 'javascript'
            });
            this.compiledCm.on('changes', this.debounce(() => this.onCompiledTextChange(), "debounceExecute"));
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
UI.colorsForPens = [
    "#000080", //  1 Navy
    "#FFFF00", // 24 Bright Yellow
    "#00FFFF", // 20 Bright Cyan
    "#FF0000", //  6 Bright Red
    "#FFFFFF", // 26 Bright White
    "#000000", //  0 Black
    "#0000FF", //  2 Bright Blue
    "#FF00FF", //  8 Bright Magenta
    "#008080", // 10 Cyan
    "#808000", // 12 Yellow
    "#8080FF", // 14 Pastel Blue
    "#FF8080", // 16 Pink
    "#00FF00", // 18 Bright Green
    "#80FF80", // 22 Pastel Green
    "#000080", //  1 Navy (repeated)
    "#FF8080", // 16 Pink (repeated)
    "#000080" //  1 Navy (repeated)
];
//# sourceMappingURL=UI.js.map