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
    getCore() {
        if (!this.core) {
            throw new Error("Core not initialized");
        }
        return this.core;
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
    setButtonDisabled(id, disabled) {
        const button = window.document.getElementById(id);
        button.disabled = disabled;
    }
    async onExecuteButtonClick(_event) {
        const core = this.getCore();
        if (!this.vm) {
            return;
        }
        const compiledScript = this.compiledCm ? this.compiledCm.getValue() : "";
        this.setButtonDisabled("executeButton", true);
        this.setButtonDisabled("stopButton", false);
        this.escape = false;
        this.keyBuffer.length = 0;
        const output = await core.executeScript(compiledScript, this.vm) || "";
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
    setExampleSelect(name) {
        const exampleSelect = document.getElementById("exampleSelect");
        exampleSelect.value = name;
    }
    onExampleSelectChange(event) {
        const core = this.getCore();
        const exampleSelect = event.target;
        const value = core.getExample(exampleSelect.value) || "";
        this.setOutputText("");
        if (this.basicCm) {
            this.basicCm.setValue(value);
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
    onWindowLoadContinue(core, vm) {
        this.core = core;
        this.vm = vm;
        const config = core.getConfigObject();
        const args = this.parseUri(config);
        core.parseArgs(args, config);
        core.setOnCheckSyntax((s) => Promise.resolve(this.checkSyntax(s)));
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
        UI.asyncDelay(() => {
            const exampleObject = core.getExampleObject() || {};
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