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
export class UI {
    constructor(core) {
        this.core = core;
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
    addOutputText(value) {
        const outputText = document.getElementById("outputText");
        outputText.innerHTML += value;
    }
    setOutputText(value) {
        const outputText = document.getElementById("outputText");
        outputText.innerText = value;
    }
    getPaperColors(colorsForPens) {
        return colorsForPens.map((color) => `<span style="background-color: ${color}">`);
    }
    getPenColors(colorsForPens) {
        return colorsForPens.map((color) => `<span style="color: ${color}">`);
    }
    prompt(msg) {
        const input = window.prompt(msg);
        return input;
    }
    async onExecuteButtonClick(_event) {
        const compiledText = document.getElementById("compiledText");
        const compiledScript = this.compiledCm ? this.compiledCm.getValue() : compiledText.value;
        const output = await this.core.executeScript(compiledScript) || "";
        this.addOutputText(output + (output.endsWith("\n") ? "" : "\n"));
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
        const compiledScript = this.core.compileScript(input) || "";
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
    async onbasicTextChange() {
        const autoCompileInput = document.getElementById("autoCompileInput");
        if (autoCompileInput.checked) {
            const compileButton = window.document.getElementById("compileButton");
            compileButton.dispatchEvent(new Event('click'));
        }
    }
    setExampleSelect(name) {
        const exampleSelect = document.getElementById("exampleSelect");
        exampleSelect.value = name;
    }
    onExampleSelectChange(event) {
        const exampleSelect = event.target;
        const basicText = document.getElementById("basicText");
        const value = this.core.getExample(exampleSelect.value) || "";
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
    parseUri(urlQuery, config) {
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
        const config = this.core.getConfigObject();
        const WinCodeMirror = window.CodeMirror;
        if (WinCodeMirror) {
            this.basicCm = WinCodeMirror.fromTextArea(basicText, {
                lineNumbers: true,
                mode: 'javascript'
            });
            this.basicCm.on('changes', this.debounce(() => this.onbasicTextChange(), () => config.debounceCompile));
            this.compiledCm = WinCodeMirror.fromTextArea(compiledText, {
                lineNumbers: true,
                mode: 'javascript'
            });
            this.compiledCm.on('changes', this.debounce(() => this.onCompiledTextChange(), () => config.debounceExecute));
        }
        UI.asyncDelay(() => {
            const exampleObject = this.core.getExampleObject() || {};
            this.setExampleSelectOptions(exampleObject);
            const example = config.example;
            if (example) {
                this.setExampleSelect(example);
            }
            exampleSelect.dispatchEvent(new Event('change'));
        }, 10);
    }
}
//# sourceMappingURL=UI.js.map