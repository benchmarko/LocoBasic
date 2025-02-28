import type { Editor } from 'codemirror';
import type { ConfigEntryType, ICore, IUI, IVmAdmin } from "../Interfaces";

// Worker:
type PlainErrorEventType = {
    lineno: number,
    colno: number,
    message: string
};

type ProcessingQueueType = {
    resolve: (value: PlainErrorEventType) => void,
    jsText: string
};

// Worker function to handle JavaScript evaluation and error reporting
const workerFn = (): void => {
    const doEvalAndReply = (jsText: string) => {
        self.addEventListener(
            'error',
            (errorEvent) => {
                errorEvent.preventDefault();
                const { lineno, colno, message } = errorEvent;
                const plainErrorEventObj: PlainErrorEventType = { lineno, colno, message };
                self.postMessage(JSON.stringify(plainErrorEventObj));
            },
            { once: true }
        );
        new Function("_o", jsText);
        const plainErrorEventObj: PlainErrorEventType = {
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

export class UI implements IUI {
    private core?: ICore;
    private vm?: IVmAdmin;
    private basicCm?: Editor;
    private compiledCm?: Editor;
    private readonly keyBuffer: string[] = []; // buffered pressed keys
    private escape = false;

    private static getErrorEvent?: (s: string) => Promise<PlainErrorEventType>;

    private debounce<T extends (...args: unknown[]) => void | Promise<void>>(func: T, fngetDelay: () => number): (...args: Parameters<T>) => void {
        let timeoutId: ReturnType<typeof setTimeout>;
        return function (this: unknown, ...args: Parameters<T>) {
            const context = this;
            const delay = fngetDelay();
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    private static asyncDelay(fn: () => void, timeout: number): Promise<number> {
        return (async () => {
            const timerId = window.setTimeout(fn, timeout);
            return timerId;
        })();
    }

    private getCore() {
        if (!this.core) {
            throw new Error("Core not initialized");
        }
        return this.core;
    }

    public getEscape() {
        return this.escape;
    }

    public addOutputText(value: string): void {
        const outputText = document.getElementById("outputText") as HTMLPreElement;
        outputText.innerHTML += value;
    }

    public setOutputText(value: string): void {
        const outputText = document.getElementById("outputText") as HTMLPreElement;
        outputText.innerText = value;
    }

    public getPaperColors(colorsForPens: string[]): string[] {
        return colorsForPens.map((color) => `<span style="background-color: ${color}">`);
    }

    public getPenColors(colorsForPens: string[]): string[] {
        return colorsForPens.map((color) => `<span style="color: ${color}">`);
    }

    /**
     * Prompts the user with a message and returns the input.
     * @param msg - The message to prompt.
     * @returns A promise that resolves to the user input or null if canceled.
     */
    public prompt(msg: string): string | null {
        const input = window.prompt(msg);
        return input;
    }

    private setButtonDisabled(id: string, disabled: boolean) {
        const button = window.document.getElementById(id) as HTMLButtonElement;
        button.disabled = disabled;
    }

    private async onExecuteButtonClick(_event: Event): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
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

    private onCompiledTextChange(): void {
        const autoExecuteInput = document.getElementById("autoExecuteInput") as HTMLInputElement;
        if (autoExecuteInput.checked) {
            const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
            if (!executeButton.disabled) {
                executeButton.dispatchEvent(new Event('click'));
            }
        }
    }

    private onCompileButtonClick(_event: Event): void { // eslint-disable-line @typescript-eslint/no-unused-vars
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

    private onStopButtonClick(_event: Event): void { // eslint-disable-line @typescript-eslint/no-unused-vars
        this.escape = true;
        this.setButtonDisabled("stopButton", true);
    }

    private async onBasicTextChange(): Promise<void> {
        const autoCompileInput = document.getElementById("autoCompileInput") as HTMLInputElement;
        if (autoCompileInput.checked) {
            const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
            if (!compileButton.disabled) {
                compileButton.dispatchEvent(new Event('click'));
            }
        }
    }

    private setExampleSelect(name: string): void {
        const exampleSelect = document.getElementById("exampleSelect") as HTMLSelectElement;
        exampleSelect.value = name;
    }

    private onExampleSelectChange(event: Event): void {
        const core = this.getCore();
        const exampleSelect = event.target as HTMLSelectElement;
        const value = core.getExample(exampleSelect.value) || "";
        this.setOutputText("");

        if (this.basicCm) {
            this.basicCm.setValue(value);
        }
    }

    private setExampleSelectOptions(examples: Record<string, string>): void {
        const exampleSelect = document.getElementById("exampleSelect") as HTMLSelectElement;

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

    private onHelpButtonClick(): void {
        window.open("https://github.com/benchmarko/LocoBasic/#readme");
    }

    public getKeyFromBuffer(): string {
		const key = this.keyBuffer.length ? this.keyBuffer.shift() as string : "";
		return key;
	}

    private putKeyInBuffer(key: string): void {
		this.keyBuffer.push(key);
    }

    private onOutputTextKeydown(event: KeyboardEvent): void {
        const key = event.key;
        if (key === "Escape") {
            this.escape = true;
        } else if (key === "Enter") {
            this.putKeyInBuffer("\x0d");
            event.preventDefault();
        } else if (key.length === 1 && event.ctrlKey === false && event.altKey === false) {
            this.putKeyInBuffer(key);
            event.preventDefault();
        }
    }

    private static getErrorEventFn(): (s: string) => Promise<PlainErrorEventType> {
        if (UI.getErrorEvent) {
            return UI.getErrorEvent;
        }

        const blob = new Blob(
            [`(${workerFn})();`],
            { type: "text/javascript" }
        );

        const worker = new Worker(window.URL.createObjectURL(blob));
        const processingQueue: ProcessingQueueType[] = [];
        let isProcessing = false;

        const processNext = () => {
            isProcessing = true;
            const { resolve, jsText } = processingQueue.shift() as ProcessingQueueType;
            worker.addEventListener(
                'message',
                ({ data }) => {
                    resolve(JSON.parse(data));
                    if (processingQueue.length) {
                        processNext();
                    } else {
                        isProcessing = false;
                    }
                },
                { once: true }
            );
            worker.postMessage(jsText);
        };

        const getErrorEvent = (jsText: string): Promise<PlainErrorEventType> => {
            return new Promise<PlainErrorEventType>((resolve) => {
                processingQueue.push({ resolve, jsText });
                if (!isProcessing) {
                    processNext();
                }
            });
        };

        UI.getErrorEvent = getErrorEvent;
        return getErrorEvent;
    }

    private static describeError(stringToEval: string, lineno: number, colno: number): string {
        const lines = stringToEval.split('\n');
        const line = lines[lineno - 1];
        return `${line}\n${' '.repeat(colno - 1) + '^'}`;
    }

    public async checkSyntax(str: string): Promise<string> {
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

    private fnDecodeUri(s: string): string {
        let decoded = "";

        try {
            decoded = decodeURIComponent(s.replace(/\+/g, " "));
        } catch (err) {
            if (err instanceof Error) {
                err.message += ": " + s;
            }
            console.error(err);
        }
        return decoded;
    }

    private parseUri(config: Record<string, ConfigEntryType>): string[] {
        const urlQuery = window.location.search.substring(1); 
        const rSearch = /([^&=]+)=?([^&]*)/g;
        const args: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = rSearch.exec(urlQuery)) !== null) {
            const name = this.fnDecodeUri(match[1]);
            const value = this.fnDecodeUri(match[2]);

            if (value !== null && config[name] !== undefined) {
                args.push(name + "=" + value);
            }
        }
        return args;
    }

    public onWindowLoadContinue(core: ICore, vm: IVmAdmin): void {
        this.core = core;
        this.vm = vm;
        const config = core.getConfigObject();
        const args = this.parseUri(config);
        core.parseArgs(args, config);
        core.setOnCheckSyntax((s: string) => Promise.resolve(this.checkSyntax(s)));

        const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
        compileButton.addEventListener('click', (event) => this.onCompileButtonClick(event), false);

        const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
        executeButton.addEventListener('click', (event) => this.onExecuteButtonClick(event), false);

        const stopButton = window.document.getElementById("stopButton") as HTMLButtonElement;
        stopButton.addEventListener('click', (event) => this.onStopButtonClick(event), false);

        const exampleSelect = window.document.getElementById("exampleSelect") as HTMLSelectElement;
        exampleSelect.addEventListener('change', (event) => this.onExampleSelectChange(event));

        const helpButton = window.document.getElementById("helpButton") as HTMLButtonElement;
        helpButton.addEventListener('click', () => this.onHelpButtonClick());

        const outputText = window.document.getElementById("outputText") as HTMLPreElement;
        outputText.addEventListener("keydown", (event) => this.onOutputTextKeydown(event), false);
        
        const WinCodeMirror = window.CodeMirror;
        if (WinCodeMirror) {
            const basicEditor = window.document.getElementById("basicEditor") as HTMLElement;
            this.basicCm = WinCodeMirror(basicEditor, {
                lineNumbers: true,
                mode: 'javascript' // should be 'basic' but not available
            });
            this.basicCm.on('changes', this.debounce(() => this.onBasicTextChange(), () => config.debounceCompile));

            const compiledEditor = window.document.getElementById("compiledEditor") as HTMLElement;
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
