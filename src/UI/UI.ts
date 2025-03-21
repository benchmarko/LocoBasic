import type { Editor } from 'codemirror';
import type { ConfigEntryType, DatabaseMapType, DatabaseType, ExampleMapType, ExampleType, ICore, IUI, IVmAdmin } from "../Interfaces";

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
    private fnOnKeyPressHandler: (event: KeyboardEvent) => void;

    private static getErrorEvent?: (s: string) => Promise<PlainErrorEventType>;

    constructor() {
        this.fnOnKeyPressHandler = (event: KeyboardEvent) => this.onOutputTextKeydown(event);
    }

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

    private async fnLoadScriptOrStyle(script: HTMLScriptElement | HTMLLinkElement): Promise<string> {
        return new Promise((resolve, reject) => {
            const onScriptLoad = function (event: Event) {
				const type = event.type; // "load" or "error"
				const node = event.currentTarget as HTMLScriptElement | HTMLLinkElement;
				const key = node.getAttribute("data-key") as string;

				node.removeEventListener("load", onScriptLoad, false);
				node.removeEventListener("error", onScriptLoad, false);

				if (type === "load") {
					resolve(key);
				} else {
					reject(key);
				}
			};
            script.addEventListener("load", onScriptLoad, false);
            script.addEventListener("error", onScriptLoad, false);
            document.getElementsByTagName("head")[0].appendChild(script);
        });
	}

	private async loadScript(url: string, key: string): Promise<string> {
		const script = document.createElement("script");

		script.type = "text/javascript";
		script.async = true;
		script.src = url;

		script.setAttribute("data-key", key);

		return this.fnLoadScriptOrStyle(script);
	}

    public getCurrentDataKey() : string {
        return document.currentScript && document.currentScript.getAttribute("data-key") || "";
    }

    public addOutputText(value: string): void {
        const outputText = document.getElementById("outputText") as HTMLPreElement;
        outputText.innerHTML += value;
    }

    public setOutputText(value: string): void {
        const outputText = document.getElementById("outputText") as HTMLPreElement;
        outputText.innerText = value;
    }

    public getColor(color: string, background: boolean): string {
        return `<span style="${background ? 'background-color' : 'color'}: ${color}">`;
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

    private updateConfigParameter(name: string, value: string | boolean) {
        const core = this.getCore();
        const configAsRecord = core.getConfigMap() as Record<string, unknown>;
        const defaultConfigAsRecord = core.getDefaultConfigMap() as Record<string, unknown>;

        configAsRecord[name] = value;

        const url = new URL(window.location.href);
        if (configAsRecord[name] !== defaultConfigAsRecord[name]) {
            url.searchParams.set(name, String(value));
        } else {
            url.searchParams.delete(name);
        }
        history.pushState({}, "", url.href);
    }

    private setButtonDisabled(id: string, disabled: boolean) {
        const button = window.document.getElementById(id) as HTMLButtonElement;
        button.disabled = disabled;
    }

    private setSelectDisabled(id: string, disabled: boolean) {
        const element = window.document.getElementById(id) as HTMLSelectElement;
        element.disabled = disabled;
    }

    private toggleAreaHidden(id: string, editor?: Editor): boolean {
        const area = document.getElementById(id) as HTMLElement;
        area.hidden = !area.hidden;
        if (!area.hidden && editor) {
            editor.refresh();
        }

        const parameterName = id.replace("Inner", "Hidden");
        this.updateConfigParameter(parameterName, area.hidden);

        return !area.hidden;
    }

    private setClearLeft(id: string, clearLeft: boolean): void {
        const area = document.getElementById(id) as HTMLElement;
        area.style.clear = clearLeft ? "left" : "";
    }

    private onBasicAreaButtonClick(_event: Event){ // eslint-disable-line @typescript-eslint/no-unused-vars
        const basicVisible = this.toggleAreaHidden("basicAreaInner", this.basicCm);
        const compiledAreaInner = document.getElementById("compiledAreaInner") as HTMLElement;
        this.setClearLeft("compiledArea", !basicVisible || compiledAreaInner.hidden);
    }

    private onCompiledAreaButtonClick(_event: Event){ // eslint-disable-line @typescript-eslint/no-unused-vars
        const compiledVisible = this.toggleAreaHidden("compiledAreaInner", this.compiledCm);
        const basicAreaInner = document.getElementById("basicAreaInner") as HTMLElement;
        this.setClearLeft("compiledArea", !compiledVisible || basicAreaInner.hidden);
        const outputAreaInner = document.getElementById("outputAreaInner") as HTMLElement;
        this.setClearLeft("outputArea", !compiledVisible || outputAreaInner.hidden);
    }

    private onOutputAreaButtonClick(_event: Event){ // eslint-disable-line @typescript-eslint/no-unused-vars
        const outputVisible = this.toggleAreaHidden("outputAreaInner");
        const compiledAreaInner = document.getElementById("compiledAreaInner") as HTMLElement;
        this.setClearLeft("outputArea", !outputVisible || compiledAreaInner.hidden);
    }

    private async onExecuteButtonClick(_event: Event): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
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
        const outputText = window.document.getElementById("outputText") as HTMLPreElement;
        outputText.addEventListener("keydown", this.fnOnKeyPressHandler, false);
        const output = await core.executeScript(compiledScript, this.vm) || "";
        outputText.removeEventListener("keydown", this.fnOnKeyPressHandler, false);
        this.setButtonDisabled("executeButton", false);
        this.setButtonDisabled("stopButton", true);
        this.setSelectDisabled("databaseSelect", false);
        this.setSelectDisabled("exampleSelect", false);
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

    private async getExampleScript(example: ExampleType) {
        if (example.script !== undefined) {
            return example.script;
        }
        const core = this.getCore();
        const database = core.getDatabase();
        const scriptName = database.source + "/" + example.key + ".js";
        try {
            await this.loadScript(scriptName, example.key);
        } catch (error) {
            console.error("Load Example", scriptName, error);
        }
        return example.script || ""; //TTT
    }

    private async onExampleSelectChange(event: Event): Promise<void> {
        const core = this.getCore();

        this.setOutputText("");

        const exampleSelect = event.target as HTMLSelectElement;
        const exampleName = exampleSelect.value;
        const example = core.getExample(exampleName); //.script || "";

        if (example) {
            this.updateConfigParameter("example", exampleName);

            const script = await this.getExampleScript(example);
       
            if (this.basicCm) {
                this.basicCm.setValue(script);
            }
        } else {
            console.warn("onExampleSelectChange: example not found:", exampleName);
        }
    }

    private setExampleSelectOptions(exampleMap: ExampleMapType, exampleKey: string): void {
        const maxTitleLength = 160;
		const maxTextLength = 60; // (32 visible?)
        const exampleSelect = document.getElementById("exampleSelect") as HTMLSelectElement;
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

    private async getExampleMap(databaseItem: DatabaseType) {
        if (databaseItem.exampleMap) {
            return databaseItem.exampleMap;
        }
        databaseItem.exampleMap = {};
        const scriptName = databaseItem.source + "/0index.js";
        try {
            await this.loadScript(scriptName, "0index");
        } catch (error) {
            console.error("Load Example Map ", scriptName, error);
        }
        return databaseItem.exampleMap;
    }

    private async onDatabaseSelectChange(event: Event): Promise<void> {
        const core = this.getCore();
        const databaseSelect = event.target as HTMLSelectElement;

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
        
        const exampleSelect = window.document.getElementById("exampleSelect") as HTMLSelectElement;
        exampleSelect.dispatchEvent(new Event('change'));
    }

    private setDatabaseSelectOptions(databaseMap: DatabaseMapType, database: string): void {
        const databaseSelect = document.getElementById("databaseSelect") as HTMLSelectElement;
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
        const config = core.getConfigMap();
        const args = this.parseUri(config);
        core.parseArgs(args, config);
        core.setOnCheckSyntax((s: string) => Promise.resolve(this.checkSyntax(s)));

        const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
        compileButton.addEventListener('click', (event) => this.onCompileButtonClick(event), false);

        const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
        executeButton.addEventListener('click', (event) => this.onExecuteButtonClick(event), false);

        const stopButton = window.document.getElementById("stopButton") as HTMLButtonElement;
        stopButton.addEventListener('click', (event) => this.onStopButtonClick(event), false);

        const databaseSelect = window.document.getElementById("databaseSelect") as HTMLSelectElement;
        databaseSelect.addEventListener('change', (event) => this.onDatabaseSelectChange(event));

        const exampleSelect = window.document.getElementById("exampleSelect") as HTMLSelectElement;
        exampleSelect.addEventListener('change', (event) => this.onExampleSelectChange(event));

        const helpButton = window.document.getElementById("helpButton") as HTMLButtonElement;
        helpButton.addEventListener('click', () => this.onHelpButtonClick());

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

        const basicAreaButton = window.document.getElementById("basicAreaButton") as HTMLButtonElement;
        basicAreaButton.addEventListener('click', (event) => this.onBasicAreaButtonClick(event), false);

        const compiledAreaButton = window.document.getElementById("compiledAreaButton") as HTMLButtonElement;
        compiledAreaButton.addEventListener('click', (event) => this.onCompiledAreaButtonClick(event), false);

        const outputAreaButton = window.document.getElementById("outputAreaButton") as HTMLButtonElement;
        outputAreaButton.addEventListener('click', (event) => this.onOutputAreaButtonClick(event), false);

        window.addEventListener("popstate", (event: PopStateEvent) => {
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
