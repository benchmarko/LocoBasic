// Ui.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Ui {
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
            this.setOutputText(this.getOutputText() + output);
        });
    }
    oncompiledTextChange(_event) {
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
        compiledText.addEventListener('change', (event) => this.oncompiledTextChange(event));
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
            this.compiledCm.on('changes', this.debounce((event) => this.oncompiledTextChange(event), "debounceExecute"));
        }
        Ui.asyncDelay(() => {
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
//# sourceMappingURL=Ui.js.map