import type { CommandActions, Editor } from "codemirror";
import type { ConfigEntryType, DatabaseMapType, DatabaseType, ExampleMapType, ExampleType, ICore, IUI, NodeWorkerFnType } from "../Interfaces";
import { LocoBasicMode } from "./LocoBasicMode";
import { VmMain } from "./VmMain";
import { VmMessageHandlerCallbacks } from "../VmMessageHandler";

declare global {
    interface Window {
        locoVmWorker: NodeWorkerFnType
    }
}

interface CommandActionsWithFind extends CommandActions {
    find: () => void
}

const escapeText = (str: string) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export class UI implements IUI {
    private core?: ICore;
    private vmMain?: VmMain;
    private basicCm?: Editor;
    private compiledCm?: Editor;
    private compiledMessages: string[] = [];
    private initialUserAction = false;
    private readonly fnOnKeyPressHandler: (event: KeyboardEvent) => void;
    private readonly fnOnClickHandler: (event: MouseEvent) => void;
    private readonly fnOnUserKeyClickHandler: (event: MouseEvent) => void;
    private speechSynthesisUtterance?: SpeechSynthesisUtterance;
    private locoVmWorkerName = "";
    private pendingInputResolver?: (value: string | null) => void;

    constructor() {
        this.fnOnKeyPressHandler = (event: KeyboardEvent) => this.onOutputTextKeydown(event);
        this.fnOnClickHandler = (event: MouseEvent) => this.onOutputTextClick(event);
        this.fnOnUserKeyClickHandler = (event: MouseEvent) => this.onUserKeyClick(event);
    }

    private isCodeMirrorSetValue(args: unknown[]): boolean {
        // CodeMirror passes change metadata in args[1][0].origin
        // "setValue" indicates programmatic change (not user input)
        const changeMetadata = (args?.[1] as unknown[])?.[0] as Record<string, unknown> | undefined;
        return changeMetadata?.origin === "setValue";
    }

    private debounce<T extends (...args: unknown[]) => void | Promise<void>>(
        func: T,
        getDelay: () => number
    ): (...args: Parameters<T>) => void {
        let timeoutId: ReturnType<typeof setTimeout>;
        return (...args: Parameters<T>) => {
            // Use immediate delay (0ms) for programmatic changes, normal delay for user input
            const delay = this.isCodeMirrorSetValue(args as unknown[]) ? 0 : getDelay();
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
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
        return this.core as ICore;
    }

    private getVmMain() {
        return this.vmMain as VmMain;
    }

    private getBasicCm() {
        return this.basicCm as Editor;
    }

    private getCompiledCm() {
        return this.compiledCm as Editor;
    }

    private cancelSpeech() {
        if (this.speechSynthesisUtterance && this.speechSynthesisUtterance.text) {
            window.speechSynthesis.cancel();
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

    private getElementHidden(id: string): boolean {
        const element = document.getElementById(id) as HTMLElement;
        return element.hidden;
    }

    private setElementHidden(id: string, hidden: boolean): boolean {
        const element = document.getElementById(id) as HTMLElement;
        if (element.hidden !== hidden) {
            element.hidden = hidden;
        }
        return element.hidden;
    }

    private closeAllPopoversExcept(id: string): void {
        const popovers = document.querySelectorAll<HTMLElement>(".popover");
        popovers.forEach(popover => {
            const id2 = popover.getAttribute("id");
            if (id2 !== id) {
                popover.hidden = true;
            }
        });
    }

    private togglePopoverHidden(id: string) {
        const visible = this.toggleElementHidden(id);
        if (visible) {
            this.closeAllPopoversExcept(id);
        }
        return visible;
    }

    private getButtonOrSelectDisabled(id: string) {
        const element = window.document.getElementById(id) as HTMLButtonElement | HTMLSelectElement;
        return element.disabled;
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

    private scrollToBottom(id: string): void {
        const element = document.getElementById(id) as HTMLElement;
        element.scrollTop = element.scrollHeight;
    }

    addOutputText = (str: string, needCls?: boolean, hasGraphics?: boolean) => { // bound this
        const outputText = document.getElementById("outputText") as HTMLDivElement;
        if (needCls) {
            outputText.innerHTML = str;
            if (!hasGraphics) {
                this.setButtonOrSelectDisabled("exportSvgButton", true);
            }
        } else {
            outputText.innerHTML += str;
        }
        if (hasGraphics) {
            this.setButtonOrSelectDisabled("exportSvgButton", false);
        } else {
            this.scrollToBottom("outputText");
        }
    }

    private onUserKeyClick(event: Event) {
        const target = event.target as HTMLButtonElement;
        const dataKey = target.getAttribute("data-key");
        this.putKeysInBuffer(String.fromCharCode(Number(dataKey)));
    }

    private onSetUiKeys = (codes: number[]): void => { // bound this
        if (codes.length) {
            const code = codes[0];
            const userKeys = document.getElementById("userKeys") as HTMLSpanElement;
            if (code) {
                const char = String.fromCharCode(code);
                const buttonStr = `<button data-key="${code}" title="${char}">${char}</button>`;
                userKeys.innerHTML += buttonStr;
            } else {
                userKeys.innerHTML = "";
            }
        }
    }

    private async waitForVoices(callback: () => void): Promise<void> {
        return new Promise<void>((resolve) => {
            window.speechSynthesis.addEventListener("voiceschanged", () => {
                callback();
                resolve();
            }, { once: true });

            if (window.speechSynthesis.getVoices().length) {
                callback();
                resolve();
            }
        });
    }

    private async waitForUserInteraction(buttonId: string): Promise<void> {
        this.toggleElementHidden(buttonId);
        const button = document.getElementById(buttonId) as HTMLButtonElement;

        return new Promise<void>((resolve) => {
            button.addEventListener("click", () => {
                this.setElementHidden(buttonId, true);
                resolve();
            }, { once: true });
        });
    }

    private showConsoleInput(prompt: string): Promise<string | null> {
        return new Promise<string | null>((resolve) => {
            const outputText = document.getElementById("outputText") as HTMLDivElement;

            // Store the resolver for potential cancellation
            this.pendingInputResolver = resolve;

            // Add prompt to output
            const promptDiv = document.createElement("div");
            promptDiv.textContent = prompt;
            outputText.appendChild(promptDiv);

            // Create input field
            const input = document.createElement("input");
            input.type = "text";
            input.className = "console-input";
            outputText.appendChild(input);

            // Auto-scroll to input
            this.scrollToBottom("outputText");
            input.focus();

            const handleSubmit = () => {
                const value = input.value;
                // Replace input with submitted value
                input.replaceWith(document.createTextNode(value + "\n"));
                this.scrollToBottom("outputText");
                this.pendingInputResolver = undefined;
                resolve(value);
            };

            input.addEventListener("keypress", (e) => {
                e.stopPropagation(); // Prevent event from bubbling to outputText listeners
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                }
            });

            // Also stop keydown propagation
            input.addEventListener("keydown", (e) => {
                e.stopPropagation();
            });
        });
    }

    private logVoiceDebugInfo(selectedVoice?: SpeechSynthesisVoice): void {
        const debug = this.getCore().getConfigMap().debug;
        if (debug > 1) {
            const voicesString = window.speechSynthesis.getVoices().map((v, i) => `${i}: ${v.lang}: ${v.name}`).join("\n ");
            const msg = `getSpeechSynthesisUtterance: voice=${selectedVoice?.lang}: ${selectedVoice?.name}, voices:\n ${voicesString}`;
            console.log(msg);
            if (debug >= 16) {
                this.addOutputText(msg + "\n");
            }
        }
    }

    private async getSpeechSynthesisUtterance(): Promise<SpeechSynthesisUtterance> {
        if (this.speechSynthesisUtterance) {
            return this.speechSynthesisUtterance;
        }

        if (!window.speechSynthesis) {
            throw new Error("Speech Synthesis API is not supported in this browser.");
        }

        this.speechSynthesisUtterance = new SpeechSynthesisUtterance();
        const utterance = this.speechSynthesisUtterance;
        utterance.lang = document.documentElement.lang || "en";

        const selectVoice = (): SpeechSynthesisVoice | undefined => {
            const voices = window.speechSynthesis.getVoices();
            return voices.find((voice) => voice.lang === "en-GB" && voice.name === "Daniel");
        };

        const onVoicesChanged = (): void => {
            const selectedVoice = selectVoice();
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            this.logVoiceDebugInfo(selectedVoice);
        };

        await this.waitForVoices(onVoicesChanged);

        if (!this.initialUserAction) {
            await this.waitForUserInteraction("startSpeechButton");
        }

        return utterance;
    }

    private onGeolocation = async (): Promise<string> => { // bound this
        if (navigator.geolocation) {
            return new Promise<string>((resolve, reject) => {
                const positionCallback: PositionCallback = (position) => {
                    const { latitude, longitude } = position.coords;
                    const json = {
                        latitude,
                        longitude
                    }
                    resolve(JSON.stringify(json));
                };
                const options = {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                };
                navigator.geolocation.getCurrentPosition(positionCallback, reject, options);
            });
        }
        return Promise.reject("ERROR: Geolocation is not supported by this browser.");
    }

    private onSpeak = async (text: string, pitch: number): Promise<void> => { // bound this
        const debug = this.getCore().getConfigMap().debug;
        if (debug) {
            console.log("onSpeak: ", text, pitch);
        }

        const msg = await this.getSpeechSynthesisUtterance();
        const stopButton = window.document.getElementById("stopButton") as HTMLButtonElement;
        if (stopButton.disabled) { // Stop button inactive, program already stopped?
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
        const compiledScript = this.getCompiledCm().getValue();
        const hasError = compiledScript.startsWith("ERROR:");
        this.addOutputText(hasError ? escapeText(compiledScript) : "", true);
        return hasError;
    }

    // Helper function to update button states
    private updateButtonStates(states: Record<string, boolean>): void {
        Object.entries(states).forEach(([id, disabled]) => {
            this.setButtonOrSelectDisabled(id, disabled);
        });
    }

    private beforeExecute() {
        this.setElementHidden("convertArea", true);

        const buttonStates = {
            enterButton: false,
            executeButton: true,
            stopButton: false,
            pauseButton: false,
            resumeButton: true,
            convertButton: true,
            databaseSelect: true,
            exampleSelect: true
        };
        this.updateButtonStates(buttonStates);

        const outputText = document.getElementById("outputText") as HTMLDivElement;
        outputText.addEventListener("keydown", this.fnOnKeyPressHandler, false);
        outputText.addEventListener("click", this.fnOnClickHandler, false);

        const userKeys = document.getElementById("userKeys") as HTMLSpanElement;
        userKeys.addEventListener("click", this.fnOnUserKeyClickHandler, false);
    }

    private afterExecute() {
        const outputText = document.getElementById("outputText") as HTMLDivElement;
        outputText.removeEventListener("keydown", this.fnOnKeyPressHandler, false);
        outputText.removeEventListener("click", this.fnOnClickHandler, false);
        this.onSetUiKeys([0]); // remove user keys

        this.updateButtonStates({
            enterButton: true,
            executeButton: false,
            stopButton: true,
            pauseButton: true,
            resumeButton: true,
            convertButton: false,
            databaseSelect: false,
            exampleSelect: false
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onExecuteButtonClick = async (_event: Event): Promise<void> => {
        if (this.hasCompiledError()) {
            return;
        }
        this.beforeExecute();

        const compiledScript = this.getCompiledCm().getValue(); // Execute the compiled script
        const output = await this.getVmMain().run(compiledScript);
        if (output) { // some remaining output?
            this.addOutputText(output);
        }
        if (this.compiledMessages.length) { // compile warning messages?
            const messageString = escapeText(this.compiledMessages.join("\n"));
            this.addOutputText(`<hr><details><summary>Compile warning messages: ${this.compiledMessages.length}</summary>${messageString}</details>`);
        }
        this.afterExecute();
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
        const input = this.getBasicCm().getValue();
        UI.asyncDelay(() => {
            const { compiledScript, messages } = core.compileScript(input);

            this.compiledMessages = messages;
            this.getCompiledCm().setValue(compiledScript);
            this.setButtonOrSelectDisabled("compileButton", false);
            if (!compiledScript.startsWith("ERROR:")) {
                this.setButtonOrSelectDisabled("labelRemoveButton", false);
            }
        }, 1);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onEnterButtonClick = (_event: Event): void => { // bound this
        this.putKeysInBuffer("\x0d");
        this.clickStartSpeechButton(); // we just did a user interaction
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

    private clickStartSpeechButton() {
        const startSpeechButton = window.document.getElementById("startSpeechButton") as HTMLButtonElement;
        if (!startSpeechButton.hidden) { // if the startSpeech button is visible, activate it to allow speech
            startSpeechButton.dispatchEvent(new Event("click"));
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onStopButtonClick = (_event: Event): void => { // bound this
        this.cancelSpeech(); // maybe a speech was waiting
        this.clickStartSpeechButton(); // we just did a user interaction
        this.setButtonOrSelectDisabled("stopButton", true);
        this.setButtonOrSelectDisabled("pauseButton", true);
        if (!this.getButtonOrSelectDisabled("resumeButton")) {
            this.getVmMain().resume();
        }
        this.setButtonOrSelectDisabled("resumeButton", true);
        // Resolve any pending input promise
        if (this.pendingInputResolver) {
            this.pendingInputResolver(null);
            this.pendingInputResolver = undefined;
        }
        this.getVmMain().stop();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onPauseButtonClick = (_event: Event): void => { // bound this
        this.cancelSpeech(); // maybe a speech was waiting
        this.clickStartSpeechButton(); // we just did a user interaction
        this.setButtonOrSelectDisabled("pauseButton", true);
        this.setButtonOrSelectDisabled("resumeButton", false);
        this.getVmMain().pause();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onResumeButtonClick = (_event: Event): void => { // bound this
        this.cancelSpeech(); // maybe a speech was waiting
        this.clickStartSpeechButton(); // we just did a user interaction
        this.setButtonOrSelectDisabled("resumeButton", true);
        this.setButtonOrSelectDisabled("pauseButton", false);
        this.getVmMain().resume();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onResetButtonClick = (_event: Event): void => { // bound this
        this.cancelSpeech();
        this.clickStartSpeechButton(); // we just did a user interaction
        // Resolve any pending input promise
        if (this.pendingInputResolver) {
            this.pendingInputResolver(null);
            this.pendingInputResolver = undefined;
        }
        this.getVmMain().reset();

        const frameInput = window.document.getElementById("frameInput") as HTMLInputElement;
        if (Number(frameInput.value) !== 50) {
            frameInput.value = "50"; // default frame rate
            frameInput.dispatchEvent(new Event("change"));
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onOutputOptionsButtonClick = (_event: Event): void => { // bound this
        this.togglePopoverHidden("outputOptionsArea");

    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onConvertButtonClick = (_event: Event): void => { // bound this
        this.togglePopoverHidden("convertArea");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onBasicSearchButtonClick = (_event: Event): void => { // bound this
        if (!this.togglePopoverHidden("basicSearchArea")) {
            //this.getBasicCm().execCommand("clearSearch");
        } else {
            const basicSearchInput = document.getElementById("basicSearchInput") as HTMLInputElement;
            basicSearchInput.focus();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
   private onBasicReplaceButtonClick = (_event: Event): void => { // bound this
        const basicSearchInput = document.getElementById("basicSearchInput") as HTMLInputElement;
        const basicReplaceInput = document.getElementById("basicReplaceInput") as HTMLInputElement;
        const editor = this.getBasicCm();
        
        const searchText = basicSearchInput.value;
        const replaceText = basicReplaceInput.value;
        
        if (!searchText) return;
        
        // Get current cursor position
        const cursor = editor.getCursor("from");
        const content = editor.getValue();
        const lines = content.split("\n");
        
        // Calculate offset from start
        let offset = 0;
        for (let i = 0; i < cursor.line; i++) {
            offset += lines[i].length + 1; // +1 for newline
        }
        offset += cursor.ch;
        
        // Find from current position
        const index = content.indexOf(searchText, offset);
        
        if (index !== -1) {
            // Calculate the line and character position of the found text
            let currentOffset = 0;
            let lineNum = 0;
            for (let i = 0; i < lines.length; i++) {
                if (currentOffset + lines[i].length >= index) {
                    lineNum = i;
                    break;
                }
                currentOffset += lines[i].length + 1;
            }
            
            const chStart = index - currentOffset;
            const chEnd = chStart + searchText.length;
            
            // Replace the found text
            editor.replaceRange(replaceText, { line: lineNum, ch: chStart }, { line: lineNum, ch: chEnd });
            
            // Move cursor to after the replacement
            editor.setCursor({ line: lineNum, ch: chStart + replaceText.length });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onBasicReplaceAllButtonClick = (_event: Event): void => { // bound this
        const basicSearchInput = document.getElementById("basicSearchInput") as HTMLInputElement;
        const basicReplaceInput = document.getElementById("basicReplaceInput") as HTMLInputElement;
        const editor = this.getBasicCm();
        
        const searchText = basicSearchInput.value;
        const replaceText = basicReplaceInput.value;
        
        if (!searchText) return;
        
        // Replace all occurrences
        const content = editor.getValue();
        const newContent = content.split(searchText).join(replaceText);
        
        if (newContent !== content) {
            editor.setValue(newContent);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onBasicSearchNextButtonClick = (_event: Event): void => { // bound this
        const basicSearchInput = document.getElementById("basicSearchInput") as HTMLInputElement;
        const editor = this.getBasicCm();
        
        const searchText = basicSearchInput.value;
        if (!searchText) return;
        
        // Get current cursor position
        const cursor = editor.getCursor("to");
        const content = editor.getValue();
        const lines = content.split("\n");
        
        // Calculate offset from start
        let offset = 0;
        for (let i = 0; i < cursor.line; i++) {
            offset += lines[i].length + 1; // +1 for newline
        }
        offset += cursor.ch;
        
        // Find from current position
        const index = content.indexOf(searchText, offset);
        
        if (index !== -1) {
            // Calculate the line and character position of the found text
            let currentOffset = 0;
            let lineNum = 0;
            for (let i = 0; i < lines.length; i++) {
                if (currentOffset + lines[i].length >= index) {
                    lineNum = i;
                    break;
                }
                currentOffset += lines[i].length + 1;
            }
            
            const chStart = index - currentOffset;
            const chEnd = chStart + searchText.length;
            
            // Select the found text
            editor.setSelection({ line: lineNum, ch: chStart }, { line: lineNum, ch: chEnd });
            
            // Scroll into view
            editor.scrollIntoView({ line: lineNum, ch: chStart });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onBasicSearchPrevButtonClick = (_event: Event): void => { // bound this
        const basicSearchInput = document.getElementById("basicSearchInput") as HTMLInputElement;
        const editor = this.getBasicCm();
        
        const searchText = basicSearchInput.value;
        if (!searchText) return;
        
        // Get current cursor position
        const cursor = editor.getCursor("from");
        const content = editor.getValue();
        const lines = content.split("\n");
        
        // Calculate offset from start
        let offset = 0;
        for (let i = 0; i < cursor.line; i++) {
            offset += lines[i].length + 1; // +1 for newline
        }
        offset += cursor.ch;
        
        // Search backwards from current position
        const searchContent = content.substring(0, offset);
        const index = searchContent.lastIndexOf(searchText);
        
        if (index !== -1) {
            // Calculate the line and character position of the found text
            let currentOffset = 0;
            let lineNum = 0;
            for (let i = 0; i < lines.length; i++) {
                if (currentOffset + lines[i].length >= index) {
                    lineNum = i;
                    break;
                }
                currentOffset += lines[i].length + 1;
            }
            
            const chStart = index - currentOffset;
            const chEnd = chStart + searchText.length;
            
            // Select the found text
            editor.setSelection({ line: lineNum, ch: chStart }, { line: lineNum, ch: chEnd });
            
            // Scroll into view
            editor.scrollIntoView({ line: lineNum, ch: chStart });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onBasicSearchInputChange = (_event: Event): void => { // bound this
        // Update search as user types (CodeMirror search addon will handle this)
    }

    private onBasicSearchInputKeydown = (event: KeyboardEvent): void => { // bound this
        if (event.key === "Enter") {
            event.preventDefault();
            // Check if Shift is pressed for previous search
            if (event.shiftKey) {
                this.onBasicSearchPrevButtonClick(event);
            } else {
                this.onBasicSearchNextButtonClick(event);
            }
        } else if (event.key === "f" && (event.metaKey === true || event.ctrlKey === true)) {
            event.preventDefault();
            this.onBasicSearchNextButtonClick(event);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onFullscreenButtonClick = async (_event: Event) => { // bound this
        const outputText = document.getElementById("outputText") as HTMLDivElement;
        const fullscreenchangedHandler = (event: Event) => {
            const target = event.target as HTMLElement;
            if (!document.fullscreenElement) {
                target.removeEventListener("fullscreenchange", fullscreenchangedHandler);
            }
        };

        outputText.addEventListener("fullscreenchange", fullscreenchangedHandler); // { once: true}?
        await outputText.requestFullscreen.call(outputText); // can we ALLOW_KEYBOARD_INPUT?
    }

    private onFrameInputChange = (event: Event): void => { // bound this
        const frameInput = event.target as HTMLInputElement;
        const value = Number(frameInput.value);
        this.getVmMain().frameTime(value);

        const frameInputLabel = window.document.getElementById("frameInputLabel") as HTMLLabelElement;
        frameInputLabel.innerText = `${frameInput.value} ms`;
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
        const input = this.getBasicCm().getValue();
        const output = input ? UI.addLabels(input) : "";

        if (output && output !== input) {
            this.getBasicCm().setValue(output);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onLabelRemoveButtonClick = (_event: Event): void => { // bound this
        const input = this.getBasicCm().getValue();

        const core = this.getCore();
        const semantics = core.getSemantics();
        const usedLabels = semantics.getUsedLabels();

        const allUsedLabels: Record<string, boolean> = {};
        for (const type of Object.keys(usedLabels)) {
            for (const label of Object.keys(usedLabels[type])) {
                allUsedLabels[label] = true;
            }
        }

        const output = UI.removeUnusedLabels(input, allUsedLabels);

        if (output && output !== input) {
            this.getBasicCm().setValue(output);
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

        this.addOutputText("", true); // clear output

        const exampleSelect = event.target as HTMLSelectElement;
        const exampleName = exampleSelect.value;
        const example = core.getExample(exampleName); //.script || "";

        if (example) {
            this.updateConfigParameter("example", exampleName);

            const script = await this.getExampleScript(example);
            this.getBasicCm().setValue(script);
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
        const input = this.getBasicCm().getValue();
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

    private onStandaloneButtonClick = async () => { // bound this
        const locoVmWorker = await this.getLocoVmWorker();
        const core = this.getCore();
        const compiledScript = this.getCompiledCm().getValue();
        const usedInstrMap = core.getSemantics().getHelper().getInstrMap();
        const output = core.createStandaloneScript(locoVmWorker, compiledScript, Object.keys(usedInstrMap));

        const blob = new Blob([output], { type: "text/javascript" });
        const objectURL = window.URL.createObjectURL(blob);
        const win = window.open(objectURL, "Standalone Script", "width=640,height=300,resizable=yes,scrollbars=yes,dependent=yes");
        if (win && win.focus) {
            win.focus();
        }
        window.URL.revokeObjectURL(objectURL);
    }

    private putKeysInBuffer(keys: string): void {
        if (this.getCore().getConfigMap().debug) {
            console.log("putKeysInBuffer:", keys);
        }
        this.getVmMain().putKeys(keys);
    }

    private onOutputTextKeydown(event: KeyboardEvent): void {
        const key = event.key;
        let putKey = "";
        if (key.length === 1) {
            if (event.ctrlKey === false) {
                putKey = key;
            }
        } else if (key === "Escape") {
            this.cancelSpeech();
            this.getVmMain().stop(); // request stop
        } else if (key === "Enter") {
            putKey = "\x0d";
        } else if (key === "Dead") {
            //const keyAndCode = `${key}-${event.code}`;
            const code = event.code;
            if (code === "KeyN") {
                putKey = "~";
            } else if (event.code === "IntlBackslash") {
                putKey = "^";
            }
        }

        if (putKey) {
            this.putKeysInBuffer(putKey);
            event.preventDefault();
        }
    }

    private getClickedKey(e: MouseEvent): string | undefined {
        let textNode: Node | null = null;
        let offset: number;

        if (document.caretPositionFromPoint) {
            const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
            if (!caretPosition) {
                return;
            }
            textNode = caretPosition.offsetNode;
            offset = caretPosition.offset;
        } else if (document.caretRangeFromPoint) {
            // Use WebKit-proprietary fallback method
            const range = document.caretRangeFromPoint(e.clientX, e.clientY);
            if (!range) {
                return;
            }
            textNode = range.startContainer;
            offset = range.startOffset;
        } else {
            return;
        }

        if (textNode?.nodeType === 3) { // Check if the node is a text node
            const textContent = textNode.textContent;
            return textContent ? textContent.charAt(offset) : "";
        }
    }

    private onOutputTextClick(event: MouseEvent): void {
        const key = this.getClickedKey(event);
        if (key) {
            this.putKeysInBuffer(key);
            event.preventDefault(); // Prevent default action if needed
        }
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

    private async getLocoVmWorker() {
        if (!window.locoVmWorker) {
            await this.loadScript(this.locoVmWorkerName, "");
        }
        return window.locoVmWorker;
    }

    public async createWebWorker() {
        let worker: Worker;
        // Detect if running on file:// protocol
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            const locoVmWorker = await this.getLocoVmWorker();
            const preparedWorkerFnString = String(locoVmWorker.workerFn);
            const workerScript = `(${preparedWorkerFnString})(self);`;

            // Use Blob for file:// protocol
            const blob = new Blob([workerScript], { type: "text/javascript" });
            const objectURL = window.URL.createObjectURL(blob);
            worker = new Worker(objectURL);
            window.URL.revokeObjectURL(objectURL);
        } else {
            // Use file-based worker for http/https
            const workerUrl = new URL(this.locoVmWorkerName, window.location.href);
            worker = new Worker(workerUrl);
        }
        return worker;
    }

    private createMessageHandlerCallbacks() {
        const callbacks: VmMessageHandlerCallbacks = {
            onFlush: (message: string, needCls?: boolean, hasGraphics?: boolean) => {
                this.addOutputText(message, needCls, hasGraphics);
            },
            onInput: async (prompt: string) => {
                const input = await this.showConsoleInput(prompt);
                return input;
            },
            onGeolocation: () => this.onGeolocation(),
            onSpeak: (message: string, pitch: number) => this.onSpeak(message, pitch),
            onKeyDef: (codes: number[]) => {
                this.onSetUiKeys(codes);
            }
        };
        return callbacks;
    }

    public onWindowLoadContinue(core: ICore, locoVmWorkerName: string): void {
        this.core = core;
        const config = core.getConfigMap();
        const args = this.parseUri(config);
        core.parseArgs(args, config);
        this.locoVmWorkerName = locoVmWorkerName;

        // Map of element IDs to event handlers
        const buttonHandlers: Record<string, EventListener> = {
            outputOptionsButton: this.onOutputOptionsButtonClick,
            compileButton: this.onCompileButtonClick,
            enterButton: this.onEnterButtonClick,
            executeButton: this.onExecuteButtonClick,
            stopButton: this.onStopButtonClick,
            pauseButton: this.onPauseButtonClick,
            resumeButton: this.onResumeButtonClick,
            resetButton: this.onResetButtonClick,
            convertButton: this.onConvertButtonClick,
            basicReplaceButton: this.onBasicReplaceButtonClick,
            basicReplaceAllButton: this.onBasicReplaceAllButtonClick,
            basicSearchButton: this.onBasicSearchButtonClick,
            basicSearchNextButton: this.onBasicSearchNextButtonClick,
            basicSearchPrevButton: this.onBasicSearchPrevButtonClick,
            labelAddButton: this.onLabelAddButtonClick,
            labelRemoveButton: this.onLabelRemoveButtonClick,
            helpButton: this.onHelpButtonClick,
            exportSvgButton: this.onExportSvgButtonClick,
            fullscreenButton: this.onFullscreenButtonClick,
            standaloneButton: this.onStandaloneButtonClick
        };

        const inputAndSelectHandlers: Record<string, EventListener> = {
            autoCompileInput: this.onAutoCompileInputChange,
            autoExecuteInput: this.onAutoExecuteInputChange,
            showOutputInput: this.onShowOutputInputChange,
            showBasicInput: this.onShowBasicInputChange,
            showCompiledInput: this.onShowCompiledInputChange,
            databaseSelect: this.onDatabaseSelectChange,
            exampleSelect: this.onExampleSelectChange,
            basicSearchInput: this.onBasicSearchInputChange,
            frameInput: this.onFrameInputChange,
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

        // Attach keydown listener for basicSearchInput to handle Enter key
        const basicSearchInput = window.document.getElementById("basicSearchInput") as HTMLInputElement;
        if (basicSearchInput) {
            basicSearchInput.addEventListener("keydown", this.onBasicSearchInputKeydown, false);
        }

        // Initialize CodeMirror editors
        const WinCodeMirror = window.CodeMirror;
        if (WinCodeMirror) {
            const getModeFn = LocoBasicMode.getMode;
            WinCodeMirror.defineMode("lbasic", getModeFn);

            this.basicCm = this.initializeEditor("basicEditor", "lbasic", this.onBasicTextChange, config.debounceCompile);
            this.compiledCm = this.initializeEditor("compiledEditor", "javascript", this.onCompiledTextChange, config.debounceExecute);

            (WinCodeMirror.commands as CommandActionsWithFind).find = () => { // Ctrl-f / Cmd-f
                if (this.getElementHidden("basicSearchArea")) {
                    const basicSearchButton = window.document.getElementById("basicSearchButton") as HTMLSelectElement;
                    basicSearchButton.dispatchEvent(new Event("click"));
                } else {
                    const basicSearchNextButton = window.document.getElementById("basicSearchButton") as HTMLSelectElement;
                    basicSearchNextButton.dispatchEvent(new Event("click"));
                }
            };
            // find, findNext, findPrev, clearSearch, replace, replaceAll
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

        const messageHandlerCallbacks = this.createMessageHandlerCallbacks();
        this.vmMain = new VmMain(messageHandlerCallbacks, () => this.createWebWorker());

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
