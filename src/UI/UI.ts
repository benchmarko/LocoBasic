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

    private handleNotAllowedError(msg: SpeechSynthesisUtterance): void {
        const speakFn = () => {
            window.removeEventListener("click", speakFn);
            window.removeEventListener("touchend", speakFn);
            this.setElementHidden("startSpeechButton");
            window.speechSynthesis.speak(msg);
        };
        // wait for user action and retry
        this.toggleElementHidden("startSpeechButton");
        window.addEventListener("click", speakFn);
        window.addEventListener("touchend", speakFn); // maybe needed for iPhone
    }

    private getSpeechSynthesisUtterance() {
        if (this.speechSynthesisUtterance) {
            return this.speechSynthesisUtterance;
        }
        this.speechSynthesisUtterance = new SpeechSynthesisUtterance();
        this.speechSynthesisUtterance.lang = document.documentElement.lang; // should be "en"
        return this.speechSynthesisUtterance;
    }

    public async speak(text: string, pitch: number): Promise<void> {
        const msg = this.getSpeechSynthesisUtterance();
        msg.text = text;
        msg.pitch = pitch; // 0 to 2
    
        return new Promise<void>((resolve, reject) => {
            msg.onend = () => resolve();
            msg.onerror = (event) => {
                if (event.error === "not-allowed") {
                    this.handleNotAllowedError(msg);
                } else {
                    reject(new Error(`Speech synthesis error: ${event.error}`));
                }
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onExecuteButtonClick = async (_event: Event): Promise<void> => { // bound this
        const core = this.getCore();
        if (!this.vm || this.hasCompiledError()) {
            return;
        }
        
        this.setElementHidden("convertArea"); // to be sure for execute; TODO: hide area if clicked anywhere outside 

        this.setButtonOrSelectDisabled("executeButton", true);
        this.setButtonOrSelectDisabled("stopButton", false);
        this.setButtonOrSelectDisabled("convertButton", true);
        this.setButtonOrSelectDisabled("databaseSelect", true);
        this.setButtonOrSelectDisabled("exampleSelect", true);
        this.escape = false;
        this.keyBuffer.length = 0;
        const outputText = document.getElementById("outputText") as HTMLPreElement;
        outputText.addEventListener("keydown", this.fnOnKeyPressHandler, false);
        const compiledScript = this.compiledCm ? this.compiledCm.getValue() : "";
        const output = await core.executeScript(compiledScript, this.vm) || "";
        outputText.removeEventListener("keydown", this.fnOnKeyPressHandler, false);
        this.setButtonOrSelectDisabled("executeButton", false);
        this.setButtonOrSelectDisabled("stopButton", true);
        this.setButtonOrSelectDisabled("convertButton", false);
        this.setButtonOrSelectDisabled("databaseSelect", false);
        this.setButtonOrSelectDisabled("exampleSelect", false);
        this.addOutputText(output + (output.endsWith("\n") ? "" : "\n"));
    }

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
        this.escape = true;
        this.setButtonOrSelectDisabled("stopButton", true);
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

    public onWindowLoadContinue(core: ICore, vm: IVmAdmin): void {
        this.core = core;
        this.vm = vm;
        const config = core.getConfigMap();
        const args = this.parseUri(config);
        core.parseArgs(args, config);
        core.setOnCheckSyntax((s: string) => Promise.resolve(this.checkSyntax(s)));

        const compileButton = window.document.getElementById("compileButton") as HTMLButtonElement;
        compileButton.addEventListener("click", this.onCompileButtonClick, false);

        const executeButton = window.document.getElementById("executeButton") as HTMLButtonElement;
        executeButton.addEventListener("click", this.onExecuteButtonClick, false);

        const stopButton = window.document.getElementById("stopButton") as HTMLButtonElement;
        stopButton.addEventListener("click", this.onStopButtonClick, false);

        const convertButton = window.document.getElementById("convertButton") as HTMLButtonElement;
        convertButton.addEventListener("click", this.onConvertButtonClick, false);

        const labelAddButton = window.document.getElementById("labelAddButton") as HTMLButtonElement;
        labelAddButton.addEventListener("click", this.onLabelAddButtonClick, false);
        
        const labelRemoveButton = window.document.getElementById("labelRemoveButton") as HTMLButtonElement;
        labelRemoveButton.addEventListener("click", this.onLabelRemoveButtonClick, false);
        
        const autoCompileInput = window.document.getElementById("autoCompileInput") as HTMLInputElement;
        autoCompileInput.addEventListener("change", this.onAutoCompileInputChange, false);

        const autoExecuteInput = window.document.getElementById("autoExecuteInput") as HTMLInputElement;
        autoExecuteInput.addEventListener("change", this.onAutoExecuteInputChange, false);

        const showOutputInput = window.document.getElementById("showOutputInput") as HTMLInputElement;
        showOutputInput.addEventListener("change", this.onShowOutputInputChange, false);

        const showBasicInput = window.document.getElementById("showBasicInput") as HTMLInputElement;
        showBasicInput.addEventListener("change", this.onShowBasicInputChange, false);

        const showCompiledInput = window.document.getElementById("showCompiledInput") as HTMLInputElement;
        showCompiledInput.addEventListener("change", this.onShowCompiledInputChange, false);

        const databaseSelect = window.document.getElementById("databaseSelect") as HTMLSelectElement;
        databaseSelect.addEventListener("change", this.onDatabaseSelectChange);

        const exampleSelect = window.document.getElementById("exampleSelect") as HTMLSelectElement;
        exampleSelect.addEventListener("change", this.onExampleSelectChange);

        const helpButton = window.document.getElementById("helpButton") as HTMLButtonElement;
        helpButton.addEventListener("click", this.onHelpButtonClick);

        const exportSvgButton = window.document.getElementById("exportSvgButton") as HTMLButtonElement;
        exportSvgButton.addEventListener("click", this.onExportSvgButtonClick);

        const WinCodeMirror = window.CodeMirror;
        if (WinCodeMirror) {
            const getModeFn = LocoBasicMode.getMode;
            WinCodeMirror.defineMode("lbasic", getModeFn);

            const basicEditor = window.document.getElementById("basicEditor") as HTMLElement;
            this.basicCm = WinCodeMirror(basicEditor, {
                lineNumbers: true,
                mode: "lbasic"
            });
            this.basicCm.on("changes", this.debounce(this.onBasicTextChange, () => config.debounceCompile));

            const compiledEditor = window.document.getElementById("compiledEditor") as HTMLElement;
            this.compiledCm = WinCodeMirror(compiledEditor, {
                lineNumbers: true,
                mode: "javascript"
            });
            this.compiledCm.on("changes", this.debounce(this.onCompiledTextChange, () => config.debounceExecute));
        }

        // if the user navigate back...
        window.addEventListener("popstate", (event: PopStateEvent) => {
            if (event.state) {
                Object.assign(config, core.getDefaultConfigMap); // load defaults
                const args = this.parseUri(config);
                core.parseArgs(args, config);
                databaseSelect.dispatchEvent(new Event("change"));
            }
        });

        if (showOutputInput.checked !== config.showOutput) {
            showOutputInput.checked = config.showOutput;
            showOutputInput.dispatchEvent(new Event("change"));
        }

        if (showBasicInput.checked !== config.showBasic) {
            showBasicInput.checked = config.showBasic;
            showBasicInput.dispatchEvent(new Event("change"));
        }

        if (showCompiledInput.checked !== config.showCompiled) {
            showCompiledInput.checked = config.showCompiled;
            showCompiledInput.dispatchEvent(new Event("change"));
        }

        if (autoCompileInput.checked !== config.autoCompile) {
            autoCompileInput.checked = config.autoCompile;
            autoCompileInput.dispatchEvent(new Event("change"));
        }

        if (autoExecuteInput.checked !== config.autoExecute) {
            autoExecuteInput.checked = config.autoExecute;
            autoExecuteInput.dispatchEvent(new Event("change"));
        }

        UI.asyncDelay(() => {
            const databaseMap = core.initDatabaseMap();
            this.setDatabaseSelectOptions(databaseMap, config.database);
            const url = window.location.href;
            history.replaceState({}, "", url);
            databaseSelect.dispatchEvent(new Event("change"));
        }, 10);
    }
}
