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
    constructor() {
        this.keyBuffer = []; // buffered pressed keys
        this.escape = false;
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
    getEscape() {
        return this.escape;
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
    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    prompt(msg) {
        const input = window.prompt(msg);
        return input;
    }
    /*
    private getButtonDisabled(id: string) {
        return (window.document.getElementById(id) as HTMLButtonElement).disabled;
    }
    */
    setButtonDisabled(id, disabled) {
        const button = window.document.getElementById(id);
        button.disabled = disabled;
    }
    async onExecuteButtonClick(_event) {
        var _a;
        const compiledText = document.getElementById("compiledText");
        const compiledScript = this.compiledCm ? this.compiledCm.getValue() : compiledText.value;
        this.setButtonDisabled("executeButton", true);
        this.setButtonDisabled("stopButton", false);
        this.escape = false;
        this.keyBuffer.length = 0;
        const output = await ((_a = this.core) === null || _a === void 0 ? void 0 : _a.executeScript(compiledScript)) || "";
        this.setButtonDisabled("executeButton", false);
        this.setButtonDisabled("stopButton", true);
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
        var _a;
        const basicText = document.getElementById("basicText");
        const compiledText = document.getElementById("compiledText");
        const input = this.basicCm ? this.basicCm.getValue() : basicText.value;
        const compiledScript = ((_a = this.core) === null || _a === void 0 ? void 0 : _a.compileScript(input)) || "";
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
    onStopButtonClick(_event) {
        this.escape = true;
        this.setButtonDisabled("stopButton", true);
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
        var _a;
        const exampleSelect = event.target;
        const basicText = document.getElementById("basicText");
        const value = ((_a = this.core) === null || _a === void 0 ? void 0 : _a.getExample(exampleSelect.value)) || "";
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
    onWindowLoadContinue(core) {
        this.core = core;
        const config = core.getConfigObject();
        const args = this.parseUri(config);
        core.parseArgs(args, config);
        core.setOnCheckSyntax((s) => Promise.resolve(this.checkSyntax(s)));
        const basicText = window.document.getElementById("basicText");
        basicText.addEventListener('change', () => this.onbasicTextChange());
        const compiledText = window.document.getElementById("compiledText");
        compiledText.addEventListener('change', () => this.onCompiledTextChange());
        const compileButton = window.document.getElementById("compileButton");
        compileButton.addEventListener('click', (event) => this.onCompileButtonClick(event), false);
        const executeButton = window.document.getElementById("executeButton");
        executeButton.addEventListener('click', (event) => this.onExecuteButtonClick(event), false);
        const stopButton = window.document.getElementById("stopButton");
        stopButton.addEventListener('click', (event) => this.onStopButtonClick(event), false);
        const exampleSelect = window.document.getElementById("exampleSelect");
        exampleSelect.addEventListener('change', (event) => this.onExampleSelectChange(event));
        const helpButton = window.document.getElementById("helpButton");
        helpButton.addEventListener('click', () => this.onHelpButtonClick());
        const outputText = window.document.getElementById("outputText");
        outputText.addEventListener("keydown", (event) => this.onOutputTextKeydown(event), false);
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
            var _a;
            const exampleObject = ((_a = this.core) === null || _a === void 0 ? void 0 : _a.getExampleObject()) || {};
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