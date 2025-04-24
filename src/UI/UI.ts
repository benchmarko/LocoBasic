import type { Editor } from "codemirror";
import type { ConfigEntryType, DatabaseMapType, DatabaseType, ExampleMapType, ExampleType, ICore, IUI, IVmAdmin } from "../Interfaces";
import { LocoBasicMode } from "./LocoBasicMode";

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
            "error",
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
            message: "No Error: Parsing successful!"
        };
        self.postMessage(JSON.stringify(plainErrorEventObj));
    };

    self.addEventListener("message", (e) => {
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
    private initialUserAction = false;
    private fnOnKeyPressHandler: (event: KeyboardEvent) => void;
    private speechSynthesisUtterance?: SpeechSynthesisUtterance;

    private static getErrorEvent?: (s: string) => Promise<PlainErrorEventType>;

    constructor() {
        this.fnOnKeyPressHandler = (event: KeyboardEvent) => this.onOutputTextKeydown(event);
    }

    private debounce<T extends (...args: unknown[]) => void | Promise<void>>(func: T, fngetDelay: () => number): (...args: Parameters<T>) => void {
        let timeoutId: ReturnType<typeof setTimeout>;
        return function (this: unknown, ...args: Parameters<T>) {
            // use delay 0 when change comes from "SetValue" (ant not form "+input")
            const delay = (args as any)?.[1]?.[0]?.origin === "setValue" ? 0 : fngetDelay();
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args); // we expect "this" to be null
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

    public setEscape(escape: boolean) {
        this.escape = escape;
        if (escape) {
            if (this.speechSynthesisUtterance && this.speechSynthesisUtterance.text) {
                window.speechSynthesis.cancel();
            }
        }
    }

    private toggleElementHidden(id: string, editor?: Editor): boolean {
        const element = document.getElementById(id) as HTMLElement;
        element.hidden = !element.hidden;
        if (!element.hidden && editor) {
            editor.refresh();
        }
        return !element.hidden;
    }

    private setElementHidden(id: string): boolean {
        const element = document.getElementById(id) as HTMLElement;
        if (!element.hidden) {
            element.hidden = true;
        }
        return element.hidden;
    }

    private setButtonOrSelectDisabled(id: string, disabled: boolean) {
        const element = window.document.getElementById(id) as HTMLButtonElement | HTMLSelectElement;
        element.disabled = disabled;
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

    public getCurrentDataKey(): string {
        return document.currentScript && document.currentScript.getAttribute("data-key") || "";
    }

    public addOutputText(value: string): void {
        const outputText = document.getElementById("outputText") as HTMLPreElement;
        outputText.innerHTML += value;
        if (value.startsWith("<svg xmlns=")) {
            this.setButtonOrSelectDisabled("exportSvgButton", false);
        }
    }

    public setOutputText(value: string): void {
        const outputText = document.getElementById("outputText") as HTMLPreElement;
        outputText.innerText = value;
        this.setButtonOrSelectDisabled("exportSvgButton", true);
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

    private async getSpeechSynthesisUtterance() {
        if (this.speechSynthesisUtterance) {
            return this.speechSynthesisUtterance;
        }
        this.speechSynthesisUtterance = new SpeechSynthesisUtterance();
        this.speechSynthesisUtterance.lang = document.documentElement.lang; // should be "en"
        if (this.initialUserAction) {
            return this.speechSynthesisUtterance;
        }

        this.toggleElementHidden("startSpeechButton");
        const startSpeechButton = window.document.getElementById("startSpeechButton") as HTMLButtonElement;
        return new Promise<SpeechSynthesisUtterance>((resolve) => {
            startSpeechButton.addEventListener("click", () => {
                this.setElementHidden("startSpeechButton");
                resolve(this.speechSynthesisUtterance as SpeechSynthesisUtterance);
            }, { once: true });
        });
    }

    public async speak(text: string, pitch: number): Promise<void> {
        const msg = await this.getSpeechSynthesisUtterance();
        if (this.getEscape()) { // program already escaped? 
            return Promise.reject("Speech canceled.");
        }
        msg.text = text;
        msg.pitch = pitch; // 0 to 2
    
        return new Promise<void>((resolve, reject) => {
            msg.onend = () => resolve();
            msg.onerror = (event) => {
                reject(new Error(`Speech synthesis: ${event.error}`));
            };

            window.speechSynthesis.speak(msg);
        });
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

    private hasCompiledError() {
        const compiledScript = this.compiledCm ? this.compiledCm.getValue() : "";
        const hasError = compiledScript.startsWith("ERROR:");
        this.setOutputText(hasError ? compiledScript : "");
        return hasError;
    }

    // Helper function to update button states
    private updateButtonStates(states: Record<string, boolean>): void {
        Object.entries(states).forEach(([id, disabled]) => {
            this.setButtonOrSelectDisabled(id, disabled);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onExecuteButtonClick = async (_event: Event): Promise<void> => {
        const core = this.getCore();
        if (!this.vm || this.hasCompiledError()) {
            return;
        }
    
        this.setElementHidden("convertArea");
    
        const buttonStates = {
            executeButton: true,
            stopButton: false,
            convertButton: true,
            databaseSelect: true,
            exampleSelect: true
        };
        this.updateButtonStates(buttonStates);
    
        this.setEscape(false);
        this.keyBuffer.length = 0;
    
        const outputText = document.getElementById("outputText") as HTMLPreElement;
        outputText.addEventListener("keydown", this.fnOnKeyPressHandler, false);
    
        // Execute the compiled script
        const compiledScript = this.compiledCm?.getValue() || "";
        const output = await core.executeScript(compiledScript, this.vm) || "";
    
        outputText.removeEventListener("keydown", this.fnOnKeyPressHandler, false);
    
        this.updateButtonStates({
            executeButton: false,
            stopButton: true,
            convertButton: false,
            databaseSelect: false,
            exampleSelect: false
        });
    
        this.addOutputText(output + (output.endsWith("\n") ? "" : "\n"));
    };

    private onCompiledTextChange = (): void => { // bound this
        if (this.hasCompiledError()) {
            return;
        }
        const autoExecuteInput = document.getElementById("autoExecuteInput") as HTMLInputElement;
        if (autoExecuteInput.checked) {
            const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
            if (!executeButton.disabled) {
                executeButton.dispatchEvent(new Event("click"));
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onCompileButtonClick = (_event: Event): void => { // bound this
        const core = this.getCore();
        this.setButtonOrSelectDisabled("compileButton", true);
        const input = this.basicCm ? this.basicCm.getValue() : "";
        UI.asyncDelay(() => {
            const compiledScript = core.compileScript(input) || "";

            if (this.compiledCm) {
                this.compiledCm.setValue(compiledScript);
            }
            this.setButtonOrSelectDisabled("compileButton", false);
            if (!compiledScript.startsWith("ERROR:")) {
                this.setButtonOrSelectDisabled("labelRemoveButton", false);
            }
        }, 1);
    }

    private onAutoCompileInputChange = (event: Event): void => { // bound this
        const autoCompileInput = event.target as HTMLInputElement;

        this.updateConfigParameter("autoCompile", autoCompileInput.checked);
    }

    private onAutoExecuteInputChange = (event: Event): void => { // bound this
        const autoExecuteInput = event.target as HTMLInputElement;

        this.updateConfigParameter("autoExecute", autoExecuteInput.checked);
    }

    private onShowOutputInputChange = (event: Event): void => { // bound this
        const showOutputInput = event.target as HTMLInputElement;
        this.toggleElementHidden("outputArea");

        this.updateConfigParameter("showOutput", showOutputInput.checked);
    }

    private onShowBasicInputChange = (event: Event): void => { // bound this
        const showBasicInput = event.target as HTMLInputElement;
        this.toggleElementHidden("basicArea", this.basicCm);

        this.updateConfigParameter("showBasic", showBasicInput.checked);
    }

    private onShowCompiledInputChange = (event: Event): void => { // bound this
        const showCompiledInput = event.target as HTMLInputElement;
        this.toggleElementHidden("compiledArea", this.compiledCm);

        this.updateConfigParameter("showCompiled", showCompiledInput.checked);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onStopButtonClick = (_event: Event): void => { // bound this
        this.setEscape(true);
        this.setButtonOrSelectDisabled("stopButton", true);
        const startSpeechButton = window.document.getElementById("startSpeechButton") as HTMLButtonElement;
        if (!startSpeechButton.hidden) {
            startSpeechButton.dispatchEvent(new Event("click"));
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onConvertButtonClick = (_event: Event): void => { // bound this
        this.toggleElementHidden("convertArea");
    }

    private static addLabels(input: string) {
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

    private static removeUnusedLabels(input: string, usedLabels: Record<string, unknown>) {
        const lineParts = input.split("\n");
		for (let i = 0; i < lineParts.length; i += 1) {
			const lineNum = parseInt(lineParts[i], 10);

			if (!isNaN(lineNum) && !usedLabels[lineNum]) {
				lineParts[i] = lineParts[i].replace(/^\d+\s/, "");
			}
		}
		return lineParts.join("\n");
	}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onLabelAddButtonClick = (_event: Event): void => { // bound this
        const input = this.basicCm!.getValue();
        const output = input ? UI.addLabels(input) : "";

        if (output && output !== input) {
            this.basicCm!.setValue(output);
        }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onLabelRemoveButtonClick = (_event: Event): void => { // bound this
        const input = this.basicCm!.getValue();

        const core = this.getCore();
        const semanticsHelper = core.getSemanticsHelper();
        const usedLabels = semanticsHelper.getUsedLabels();
       
        const allUsedLabels: Record<string, boolean> = {};
        for (const type of Object.keys(usedLabels)) {
            for (const label of Object.keys(usedLabels[type])) {
                allUsedLabels[label] = true;
            }
        }

        const output = UI.removeUnusedLabels(input, allUsedLabels);

        if (output && output !== input) {
            this.basicCm!.setValue(output);
        }
    }

    private onBasicTextChange = async (): Promise<void> => { // bound this
        this.setButtonOrSelectDisabled("labelRemoveButton", true);
        const autoCompileInput = document.getElementById("autoCompileInput") as HTMLInputElement;
        if (autoCompileInput.checked) {
            const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
            if (!compileButton.disabled) {
                compileButton.dispatchEvent(new Event("click"));
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
        return example.script || "";
    }

    private onExampleSelectChange = async (event: Event): Promise<void> => { // bound this
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

    private onDatabaseSelectChange = async (event: Event): Promise<void> => { // bound this
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
        exampleSelect.dispatchEvent(new Event("change"));
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

    private onHelpButtonClick = (): void => { // bound this
        window.open("https://github.com/benchmarko/LocoBasic/#readme");
    }

    private static fnDownloadBlob(blob: Blob, filename: string): void {
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

    private getExampleName(): string {
        const input = this.basicCm ? this.basicCm.getValue() : "";
        const firstLine = input.slice(0, input.indexOf("\n"));
        const matches = firstLine.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
        const name = matches ? matches[1] : this.getCore().getConfigMap().example || "locobasic";
        return name;
    }

    private onExportSvgButtonClick = (): void => { // bound this
        const outputText = window.document.getElementById("outputText") as HTMLElement;
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
            this.setEscape(true);
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
                "message",
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
        const lines = stringToEval.split("\n");
        const line = lines[lineno - 1];
        return `${line}\n${" ".repeat(colno - 1) + "^"}`;
    }

    public async checkSyntax(str: string): Promise<string> {
        const getErrorEvent = UI.getErrorEventFn();

        let output = "";
        const { lineno, colno, message } = await getErrorEvent(str);
        if (message === "No Error: Parsing successful!") {
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

    private initializeEditor(
        editorId: string,
        mode: string,
        changeHandler: () => void,
        debounceDelay: number
    ): Editor {
        const editorElement = window.document.getElementById(editorId) as HTMLElement;
        const editor = window.CodeMirror(editorElement, {
            lineNumbers: true,
            mode,
        });
        editor.on("changes", this.debounce(changeHandler, () => debounceDelay)); // changeHandler.bind(this)
        return editor;
    }
    
    private syncInputState(inputId: string, configValue: boolean): void {
        const input = window.document.getElementById(inputId) as HTMLInputElement;
        if (input.checked !== configValue) {
            input.checked = configValue;
            input.dispatchEvent(new Event("change"));
        }
    }

    public onWindowLoadContinue(core: ICore, vm: IVmAdmin): void {
        this.core = core;
        this.vm = vm;
        const config = core.getConfigMap();
        const args = this.parseUri(config);
        core.parseArgs(args, config);
        core.setOnCheckSyntax((s: string) => Promise.resolve(this.checkSyntax(s)));
    
        // Map of element IDs to event handlers
        const buttonHandlers: Record<string, EventListener> = {
            compileButton: this.onCompileButtonClick,
            executeButton: this.onExecuteButtonClick,
            stopButton: this.onStopButtonClick,
            convertButton: this.onConvertButtonClick,
            labelAddButton: this.onLabelAddButtonClick,
            labelRemoveButton: this.onLabelRemoveButtonClick,
            helpButton: this.onHelpButtonClick,
            exportSvgButton: this.onExportSvgButtonClick,
        };
    
        const inputAndSelectHandlers: Record<string, EventListener> = {
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
            const element = window.document.getElementById(id) as HTMLButtonElement;
            element.addEventListener("click", handler, false);
        });
    
        // Attach event listeners for inputs or selects
        Object.entries(inputAndSelectHandlers).forEach(([id, handler]) => {
            const element = window.document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
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
        window.addEventListener("popstate", (event: PopStateEvent) => {
            if (event.state) {
                Object.assign(config, core.getDefaultConfigMap()); // load defaults
                const args = this.parseUri(config);
                core.parseArgs(args, config);
                const databaseSelect = window.document.getElementById("databaseSelect") as HTMLSelectElement;
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
            
        // Initialize database and examples
        UI.asyncDelay(() => {
            const databaseMap = core.initDatabaseMap();
            this.setDatabaseSelectOptions(databaseMap, config.database);
            const url = window.location.href;
            history.replaceState({}, "", url);
            const databaseSelect = window.document.getElementById("databaseSelect") as HTMLSelectElement;
            databaseSelect.dispatchEvent(new Event("change"));
        }, 10);
    }
}
