import { SearchHandler } from "./SearchHandler";
import { LocoBasicMode } from "./LocoBasicMode";
import { VmMain } from "./VmMain";
function initHtmlElements() {
    const doc = window.document;
    return {
        autoCompileInput: doc.getElementById("autoCompileInput"),
        autoExecuteInput: doc.getElementById("autoExecuteInput"),
        basicArea: doc.getElementById("basicArea"),
        basicEditor: doc.getElementById("basicEditor"),
        basicReplaceButton: window.document.getElementById("basicReplaceButton"),
        basicReplaceAllButton: window.document.getElementById("basicReplaceAllButton"),
        basicReplaceInput: doc.getElementById("basicReplaceInput"),
        basicSearchButton: window.document.getElementById("basicSearchButton"),
        basicSearchInput: doc.getElementById("basicSearchInput"),
        basicSearchNextButton: window.document.getElementById("basicSearchNextButton"),
        basicSearchPrevButton: window.document.getElementById("basicSearchPrevButton"),
        basicSearchPopover: doc.getElementById("basicSearchPopover"),
        compileButton: doc.getElementById("compileButton"),
        compiledArea: doc.getElementById("compiledArea"),
        compiledEditor: doc.getElementById("compiledEditor"),
        compiledReplaceButton: window.document.getElementById("compiledReplaceButton"),
        compiledReplaceAllButton: window.document.getElementById("compiledReplaceAllButton"),
        compiledReplaceInput: doc.getElementById("compiledReplaceInput"),
        compiledSearchButton: window.document.getElementById("compiledSearchButton"),
        compiledSearchInput: doc.getElementById("compiledSearchInput"),
        compiledSearchNextButton: window.document.getElementById("compiledSearchNextButton"),
        compiledSearchPrevButton: window.document.getElementById("compiledSearchPrevButton"),
        compiledSearchPopover: doc.getElementById("compiledSearchPopover"),
        convertButton: doc.getElementById("convertButton"),
        convertPopover: doc.getElementById("convertPopover"),
        databaseSelect: doc.getElementById("databaseSelect"),
        enterButton: doc.getElementById("enterButton"),
        exampleSelect: doc.getElementById("exampleSelect"),
        executeButton: doc.getElementById("executeButton"),
        exportSvgButton: doc.getElementById("exportSvgButton"),
        frameInput: window.document.getElementById("frameInput"),
        frameInputLabel: window.document.getElementById("frameInputLabel"),
        fullscreenButton: doc.getElementById("fullscreenButton"),
        helpButton: doc.getElementById("helpButton"),
        labelAddButton: doc.getElementById("labelAddButton"),
        labelRemoveButton: doc.getElementById("labelRemoveButton"),
        outputArea: doc.getElementById("outputArea"),
        outputOptionsButton: doc.getElementById("outputOptionsButton"),
        outputOptionsPopover: doc.getElementById("outputOptionsPopover"),
        outputText: doc.getElementById("outputText"),
        pauseButton: doc.getElementById("pauseButton"),
        resetButton: doc.getElementById("resetButton"),
        resumeButton: doc.getElementById("resumeButton"),
        showBasicInput: doc.getElementById("showBasicInput"),
        showCompiledInput: doc.getElementById("showCompiledInput"),
        showOutputInput: doc.getElementById("showOutputInput"),
        standaloneButton: doc.getElementById("standaloneButton"),
        startSpeechButton: doc.getElementById("startSpeechButton"),
        stopButton: doc.getElementById("stopButton"),
        userKeys: doc.getElementById("userKeys")
    };
}
const escapeText = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
export class UI {
    constructor() {
        this.compiledMessages = [];
        this.initialUserAction = false;
        this.locoVmWorkerName = "";
        this.isMobile = false;
        this.addOutputText = (str, needCls, hasGraphics) => {
            const outputText = this.htmlElements.outputText;
            if (needCls) {
                outputText.innerHTML = str;
                if (!hasGraphics) {
                    this.htmlElements.exportSvgButton.disabled = true;
                }
            }
            else {
                outputText.innerHTML += str;
            }
            if (hasGraphics) {
                this.htmlElements.exportSvgButton.disabled = false;
            }
            else {
                this.scrollToBottom(outputText);
            }
        };
        this.onSetUiKeys = (codes) => {
            if (codes.length) {
                const code = codes[0];
                const userKeys = this.htmlElements.userKeys;
                if (code) {
                    const char = String.fromCharCode(code);
                    const buttonStr = `<button data-key="${code}" title="${char}">${char}</button>`;
                    userKeys.innerHTML += buttonStr;
                }
                else {
                    userKeys.innerHTML = "";
                }
            }
        };
        this.onGeolocation = async () => {
            if (navigator.geolocation) {
                return new Promise((resolve, reject) => {
                    this.geolocationPromiseRejecter = reject;
                    const positionCallback = (position) => {
                        const { latitude, longitude } = position.coords;
                        const json = {
                            latitude,
                            longitude
                        };
                        resolve(JSON.stringify(json));
                        this.geolocationPromiseRejecter = undefined;
                    };
                    const rejectCallback = (error) => {
                        reject(`ERROR: Geolocation error (${error.code}): ${error.message}`);
                        this.geolocationPromiseRejecter = undefined;
                    };
                    const options = {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    };
                    navigator.geolocation.getCurrentPosition(positionCallback, rejectCallback, options);
                });
            }
            return Promise.reject("ERROR: Geolocation is not supported by this browser.");
        };
        this.onSpeak = async (text, pitch) => {
            const debug = this.getCore().getConfigMap().debug;
            if (debug) {
                console.log("onSpeak: ", text, pitch);
            }
            const msg = await this.getSpeechSynthesisUtterance();
            if (this.htmlElements.stopButton.disabled) { // Stop button inactive, program already stopped?
                return Promise.reject("Speech canceled.");
            }
            msg.text = text;
            msg.pitch = pitch; // 0 to 2
            return new Promise((resolve, reject) => {
                msg.onend = () => resolve();
                msg.onerror = (event) => {
                    reject(new Error(`Speech synthesis: ${event.error}`));
                };
                window.speechSynthesis.speak(msg);
            });
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onExecuteButtonClick = async (_event) => {
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
        this.onCompiledTextChange = () => {
            if (this.hasCompiledError()) {
                return;
            }
            if (this.htmlElements.autoExecuteInput.checked) {
                const executeButton = this.htmlElements.executeButton;
                if (!executeButton.disabled) {
                    executeButton.dispatchEvent(new Event("click"));
                }
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onCompileButtonClick = (_event) => {
            const core = this.getCore();
            this.htmlElements.compileButton.disabled = true;
            const input = this.getBasicCm().getValue();
            UI.asyncDelay(() => {
                const { compiledScript, messages } = core.compileScript(input);
                this.compiledMessages = messages;
                this.getCompiledCm().setValue(compiledScript);
                this.htmlElements.compileButton.disabled = false;
                if (!compiledScript.startsWith("ERROR:")) {
                    this.htmlElements.labelRemoveButton.disabled = false;
                }
            }, 1);
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onEnterButtonClick = (_event) => {
            this.putKeysInBuffer("\x0d");
            this.clickStartSpeechButton(); // we just did a user interaction
        };
        this.onAutoCompileInputChange = (event) => {
            const autoCompileInput = event.target;
            this.updateConfigParameter("autoCompile", autoCompileInput.checked);
        };
        this.onAutoExecuteInputChange = (event) => {
            const autoExecuteInput = event.target;
            this.updateConfigParameter("autoExecute", autoExecuteInput.checked);
        };
        this.onShowOutputInputChange = (event) => {
            const showOutputInput = event.target;
            const outputArea = this.htmlElements.outputArea;
            outputArea.hidden = !outputArea.hidden;
            this.updateConfigParameter("showOutput", showOutputInput.checked);
        };
        this.onShowBasicInputChange = (event) => {
            const showBasicInput = event.target;
            const basicArea = this.htmlElements.basicArea;
            basicArea.hidden = !basicArea.hidden;
            if (!basicArea.hidden) {
                this.getBasicCm().refresh();
            }
            this.updateConfigParameter("showBasic", showBasicInput.checked);
        };
        this.onShowCompiledInputChange = (event) => {
            const showCompiledInput = event.target;
            const compiledArea = this.htmlElements.compiledArea;
            compiledArea.hidden = !compiledArea.hidden;
            if (!compiledArea.hidden) {
                this.getCompiledCm().refresh();
            }
            this.updateConfigParameter("showCompiled", showCompiledInput.checked);
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onStopButtonClick = (_event) => {
            this.cancelSpeech(); // maybe a speech was waiting
            this.cancelGeolocation(); // maybe a geolocation was waiting
            this.clickStartSpeechButton(); // we just did a user interaction
            if (!this.htmlElements.labelRemoveButton.disabled) {
                this.getVmMain().resume();
            }
            this.htmlElements.stopButton.disabled = true;
            this.htmlElements.pauseButton.disabled = true;
            this.htmlElements.resumeButton.disabled = true;
            // Resolve any pending input promise
            if (this.pendingInputResolver) {
                this.pendingInputResolver(null);
                this.pendingInputResolver = undefined;
            }
            this.getVmMain().stop();
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onPauseButtonClick = (_event) => {
            this.cancelSpeech(); // maybe a speech was waiting
            this.clickStartSpeechButton(); // we just did a user interaction
            this.htmlElements.pauseButton.disabled = true;
            this.htmlElements.resumeButton.disabled = false;
            this.getVmMain().pause();
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onResumeButtonClick = (_event) => {
            this.htmlElements.pauseButton.disabled = false;
            this.htmlElements.resumeButton.disabled = true;
            this.getVmMain().resume();
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onResetButtonClick = (_event) => {
            this.cancelSpeech();
            this.cancelGeolocation(); // maybe a geolocation was waiting
            this.clickStartSpeechButton(); // we just did a user interaction
            // Resolve any pending input promise
            if (this.pendingInputResolver) {
                this.pendingInputResolver(null);
                this.pendingInputResolver = undefined;
            }
            this.getVmMain().reset();
            const frameInput = this.htmlElements.frameInput;
            if (Number(frameInput.value) !== 50) {
                frameInput.value = "50"; // default frame rate
                frameInput.dispatchEvent(new Event("change"));
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onOutputOptionsButtonClick = (_event) => {
            this.togglePopoverHidden(this.htmlElements.outputOptionsPopover);
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onConvertButtonClick = (_event) => {
            this.togglePopoverHidden(this.htmlElements.convertPopover);
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onBasicSearchButtonClick = (_event) => {
            const basicSearchPopover = this.htmlElements.basicSearchPopover;
            this.togglePopoverHidden(basicSearchPopover);
            if (!basicSearchPopover.hidden) {
                this.htmlElements.basicSearchInput.focus();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onCompiledSearchButtonClick = (_event) => {
            const compiledSearchPopover = this.htmlElements.compiledSearchPopover;
            this.togglePopoverHidden(compiledSearchPopover);
            if (!compiledSearchPopover.hidden) {
                this.htmlElements.compiledSearchInput.focus();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onBasicReplaceButtonClick = (_event) => {
            if (this.basicSearchHandler) {
                this.basicSearchHandler.replace();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onBasicReplaceAllButtonClick = (_event) => {
            if (this.basicSearchHandler) {
                this.basicSearchHandler.replaceAll();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onCompiledReplaceButtonClick = (_event) => {
            if (this.compiledSearchHandler) {
                this.compiledSearchHandler.replace();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onCompiledReplaceAllButtonClick = (_event) => {
            if (this.compiledSearchHandler) {
                this.compiledSearchHandler.replaceAll();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onBasicSearchNextButtonClick = (_event) => {
            if (this.basicSearchHandler) {
                this.basicSearchHandler.searchNext();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onBasicSearchPrevButtonClick = (_event) => {
            if (this.basicSearchHandler) {
                this.basicSearchHandler.searchPrev();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onCompiledSearchNextButtonClick = (_event) => {
            if (this.compiledSearchHandler) {
                this.compiledSearchHandler.searchNext();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onCompiledSearchPrevButtonClick = (_event) => {
            if (this.compiledSearchHandler) {
                this.compiledSearchHandler.searchPrev();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onBasicSearchInputChange = (_event) => {
            // Update search as user types (CodeMirror search addon will handle this)
        };
        this.onBasicSearchInputKeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                // Check if Shift is pressed for previous search
                if (event.shiftKey) {
                    this.onBasicSearchPrevButtonClick(event);
                    this.setDelayedFocus(this.htmlElements.basicSearchPrevButton);
                }
                else {
                    this.onBasicSearchNextButtonClick(event);
                    this.setDelayedFocus(this.htmlElements.basicSearchNextButton);
                }
            }
            else if (event.key === "f" && (event.metaKey === true || event.ctrlKey === true)) {
                event.preventDefault();
                this.onBasicSearchNextButtonClick(event);
                this.setDelayedFocus(this.htmlElements.basicSearchNextButton);
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onCompiledSearchInputChange = (_event) => {
            // Update search as user types
        };
        this.onCompiledSearchInputKeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                // Check if Shift is pressed for previous search
                if (event.shiftKey) {
                    this.onCompiledSearchPrevButtonClick(event);
                }
                else {
                    this.onCompiledSearchNextButtonClick(event);
                }
            }
            else if (event.key === "f" && (event.metaKey === true || event.ctrlKey === true)) {
                event.preventDefault();
                this.onCompiledSearchNextButtonClick(event);
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onFullscreenButtonClick = async (_event) => {
            const outputText = this.htmlElements.outputText;
            const fullscreenchangedHandler = (event) => {
                const target = event.target;
                if (!document.fullscreenElement) {
                    target.removeEventListener("fullscreenchange", fullscreenchangedHandler);
                }
            };
            outputText.addEventListener("fullscreenchange", fullscreenchangedHandler); // { once: true}?
            await outputText.requestFullscreen.call(outputText); // can we ALLOW_KEYBOARD_INPUT?
        };
        this.onFrameInputChange = (event) => {
            const frameInput = event.target;
            const value = Number(frameInput.value);
            this.getVmMain().frameTime(value);
            this.htmlElements.frameInputLabel.innerText = `${frameInput.value} ms`;
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onLabelAddButtonClick = (_event) => {
            const input = this.getBasicCm().getValue();
            const output = input ? UI.addLabels(input) : "";
            if (output && output !== input) {
                this.getBasicCm().setValue(output);
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onLabelRemoveButtonClick = (_event) => {
            const input = this.getBasicCm().getValue();
            const core = this.getCore();
            const semantics = core.getSemantics();
            const usedLabels = semantics.getUsedLabels();
            const allUsedLabels = {};
            for (const type of Object.keys(usedLabels)) {
                for (const label of Object.keys(usedLabels[type])) {
                    allUsedLabels[label] = true;
                }
            }
            const output = UI.removeUnusedLabels(input, allUsedLabels);
            if (output && output !== input) {
                this.getBasicCm().setValue(output);
            }
        };
        this.onBasicTextChange = async () => {
            this.htmlElements.labelRemoveButton.disabled = true;
            if (this.htmlElements.autoCompileInput.checked) {
                const compileButton = this.htmlElements.compileButton;
                if (!compileButton.disabled) {
                    compileButton.dispatchEvent(new Event("click"));
                }
            }
        };
        this.onExampleSelectChange = async (event) => {
            const core = this.getCore();
            this.addOutputText("", true); // clear output
            const exampleSelect = event.target;
            const exampleName = exampleSelect.value;
            const example = core.getExample(exampleName); //.script || "";
            if (example) {
                this.updateConfigParameter("example", exampleName);
                const script = await this.getExampleScript(example);
                this.getBasicCm().setValue(script);
            }
            else {
                console.warn("onExampleSelectChange: example not found:", exampleName);
            }
        };
        this.onDatabaseSelectChange = async (event) => {
            const core = this.getCore();
            const databaseSelect = event.target;
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
            const exampleSelect = this.htmlElements.exampleSelect;
            exampleSelect.dispatchEvent(new Event("change"));
        };
        this.onHelpButtonClick = () => {
            window.open("https://github.com/benchmarko/LocoBasic/#readme");
        };
        this.onExportSvgButtonClick = () => {
            const outputText = this.htmlElements.outputText;
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
        };
        this.onStandaloneButtonClick = async () => {
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
        };
        this.fnOnKeyPressHandler = (event) => this.onOutputTextKeydown(event);
        this.fnOnClickHandler = (event) => this.onOutputTextClick(event);
        this.fnOnUserKeyClickHandler = (event) => this.onUserKeyClick(event);
        this.htmlElements = initHtmlElements();
    }
    isCodeMirrorSetValue(args) {
        var _a;
        // CodeMirror passes change metadata in args[1][0].origin
        // "setValue" indicates programmatic change (not user input)
        const changeMetadata = (_a = args === null || args === void 0 ? void 0 : args[1]) === null || _a === void 0 ? void 0 : _a[0];
        return (changeMetadata === null || changeMetadata === void 0 ? void 0 : changeMetadata.origin) === "setValue";
    }
    debounce(func, getDelay) {
        let timeoutId;
        return (...args) => {
            // Use immediate delay (0ms) for programmatic changes, normal delay for user input
            const delay = this.isCodeMirrorSetValue(args) ? 0 : getDelay();
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    }
    static asyncDelay(fn, timeout) {
        window.setTimeout(fn, timeout);
    }
    getCore() {
        return this.core;
    }
    getVmMain() {
        return this.vmMain;
    }
    getBasicCm() {
        return this.basicCm;
    }
    getCompiledCm() {
        return this.compiledCm;
    }
    cancelSpeech() {
        if (this.speechSynthesisUtterance && this.speechSynthesisUtterance.text) {
            window.speechSynthesis.cancel();
        }
    }
    cancelGeolocation() {
        if (this.geolocationPromiseRejecter) {
            this.geolocationPromiseRejecter("ERROR: Geolocation request canceled.");
            this.geolocationPromiseRejecter = undefined;
        }
    }
    togglePopoverHidden(popover) {
        popover.hidden = !popover.hidden;
        if (!popover.hidden) {
            if (this.openedPopover && this.openedPopover !== popover) {
                this.openedPopover.hidden = true;
            }
            this.openedPopover = popover;
        }
        else {
            this.openedPopover = undefined;
        }
    }
    async fnLoadScriptOrStyle(script) {
        return new Promise((resolve, reject) => {
            const onScriptLoad = function (event) {
                const type = event.type; // "load" or "error"
                const node = event.currentTarget;
                const key = node.getAttribute("data-key");
                node.removeEventListener("load", onScriptLoad, false);
                node.removeEventListener("error", onScriptLoad, false);
                if (type === "load") {
                    resolve(key);
                }
                else {
                    reject(key);
                }
            };
            script.addEventListener("load", onScriptLoad, false);
            script.addEventListener("error", onScriptLoad, false);
            document.getElementsByTagName("head")[0].appendChild(script);
        });
    }
    async loadScript(url, key) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = url;
        script.setAttribute("data-key", key);
        return this.fnLoadScriptOrStyle(script);
    }
    getCurrentDataKey() {
        return document.currentScript && document.currentScript.getAttribute("data-key") || "";
    }
    scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }
    onUserKeyClick(event) {
        const target = event.target;
        const dataKey = target.getAttribute("data-key");
        if (dataKey !== null) {
            this.putKeysInBuffer(String.fromCharCode(Number(dataKey)));
        }
    }
    async waitForVoices(callback) {
        return new Promise((resolve) => {
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
    async waitForUserInteraction(element) {
        element.hidden = !element.hidden;
        return new Promise((resolve) => {
            element.addEventListener("click", () => {
                element.hidden = true;
                resolve();
            }, { once: true });
        });
    }
    showConsoleInput(prompt) {
        return new Promise((resolve) => {
            const outputText = this.htmlElements.outputText;
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
            this.scrollToBottom(outputText);
            input.focus();
            const handleSubmit = () => {
                const value = input.value;
                // Replace input with submitted value
                input.replaceWith(document.createTextNode(value + "\n"));
                this.scrollToBottom(outputText);
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
    logVoiceDebugInfo(selectedVoice) {
        const debug = this.getCore().getConfigMap().debug;
        if (debug > 1) {
            const voicesString = window.speechSynthesis.getVoices().map((v, i) => `${i}: ${v.lang}: ${v.name}`).join("\n ");
            const msg = `getSpeechSynthesisUtterance: voice=${selectedVoice === null || selectedVoice === void 0 ? void 0 : selectedVoice.lang}: ${selectedVoice === null || selectedVoice === void 0 ? void 0 : selectedVoice.name}, voices:\n ${voicesString}`;
            console.log(msg);
            if (debug >= 16) {
                this.addOutputText(msg + "\n");
            }
        }
    }
    async getSpeechSynthesisUtterance() {
        if (this.speechSynthesisUtterance) {
            return this.speechSynthesisUtterance;
        }
        if (!window.speechSynthesis) {
            throw new Error("Speech Synthesis API is not supported in this browser.");
        }
        this.speechSynthesisUtterance = new SpeechSynthesisUtterance();
        const utterance = this.speechSynthesisUtterance;
        utterance.lang = document.documentElement.lang || "en";
        const selectVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            return voices.find((voice) => voice.lang === "en-GB" && voice.name === "Daniel");
        };
        const onVoicesChanged = () => {
            const selectedVoice = selectVoice();
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            this.logVoiceDebugInfo(selectedVoice);
        };
        await this.waitForVoices(onVoicesChanged);
        if (!this.initialUserAction) {
            await this.waitForUserInteraction(this.htmlElements.startSpeechButton);
        }
        return utterance;
    }
    updateConfigParameter(name, value) {
        const core = this.getCore();
        const configAsRecord = core.getConfigMap();
        const defaultConfigAsRecord = core.getDefaultConfigMap();
        configAsRecord[name] = value;
        const url = new URL(window.location.href);
        if (configAsRecord[name] !== defaultConfigAsRecord[name]) {
            url.searchParams.set(name, String(value));
        }
        else {
            url.searchParams.delete(name);
        }
        history.pushState({}, "", url.href);
    }
    hasCompiledError() {
        const compiledScript = this.getCompiledCm().getValue();
        const hasError = compiledScript.startsWith("ERROR:");
        this.addOutputText(hasError ? escapeText(compiledScript) : "", true);
        return hasError;
    }
    beforeExecute() {
        this.htmlElements.convertPopover.hidden = true;
        this.htmlElements.convertButton.disabled = true;
        this.htmlElements.databaseSelect.disabled = true;
        this.htmlElements.enterButton.disabled = false;
        this.htmlElements.exampleSelect.disabled = true;
        this.htmlElements.executeButton.disabled = true;
        this.htmlElements.pauseButton.disabled = false;
        this.htmlElements.resumeButton.disabled = true;
        this.htmlElements.stopButton.disabled = false;
        const outputText = this.htmlElements.outputText;
        outputText.addEventListener("keydown", this.fnOnKeyPressHandler, false);
        outputText.addEventListener("click", this.fnOnClickHandler, false);
        const userKeys = this.htmlElements.userKeys;
        userKeys.addEventListener("click", this.fnOnUserKeyClickHandler, false);
    }
    afterExecute() {
        const outputText = this.htmlElements.outputText;
        outputText.removeEventListener("keydown", this.fnOnKeyPressHandler, false);
        outputText.removeEventListener("click", this.fnOnClickHandler, false);
        this.onSetUiKeys([0]); // remove user keys
        this.htmlElements.convertButton.disabled = false;
        this.htmlElements.databaseSelect.disabled = false;
        this.htmlElements.enterButton.disabled = true;
        this.htmlElements.exampleSelect.disabled = false;
        this.htmlElements.executeButton.disabled = false;
        this.htmlElements.pauseButton.disabled = true;
        this.htmlElements.resumeButton.disabled = true;
        this.htmlElements.stopButton.disabled = true;
    }
    clickStartSpeechButton() {
        const startSpeechButton = this.htmlElements.startSpeechButton;
        if (!startSpeechButton.hidden) { // if the startSpeech button is visible, activate it to allow speech
            startSpeechButton.dispatchEvent(new Event("click"));
        }
    }
    setDelayedFocus(element) {
        if (this.isMobile) {
            const delay = 100;
            UI.asyncDelay(() => {
                element.focus();
            }, delay);
        }
    }
    static addLabels(input) {
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
    static removeUnusedLabels(input, usedLabels) {
        const lineParts = input.split("\n");
        for (let i = 0; i < lineParts.length; i += 1) {
            const lineNum = parseInt(lineParts[i], 10);
            if (!isNaN(lineNum) && !usedLabels[lineNum]) {
                lineParts[i] = lineParts[i].replace(/^\d+\s/, "");
            }
        }
        return lineParts.join("\n");
    }
    async getExampleScript(example) {
        if (example.script !== undefined) {
            return example.script;
        }
        const core = this.getCore();
        const database = core.getDatabase();
        const scriptName = database.source + "/" + example.key + ".js";
        try {
            await this.loadScript(scriptName, example.key);
        }
        catch (error) {
            console.error("Load Example", scriptName, error);
        }
        return example.script || "";
    }
    setExampleSelectOptions(exampleMap, exampleKey) {
        const maxTitleLength = 160;
        const maxTextLength = 60; // (32 visible?)
        const exampleSelect = this.htmlElements.exampleSelect;
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
    async getExampleMap(databaseItem) {
        if (databaseItem.exampleMap) {
            return databaseItem.exampleMap;
        }
        databaseItem.exampleMap = {};
        const scriptName = databaseItem.source + "/0index.js";
        try {
            await this.loadScript(scriptName, "0index");
        }
        catch (error) {
            console.error("Load Example Map ", scriptName, error);
        }
        return databaseItem.exampleMap;
    }
    setDatabaseSelectOptions(databaseMap, database) {
        const databaseSelect = this.htmlElements.databaseSelect;
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
    static fnDownloadBlob(blob, filename) {
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
    getExampleName() {
        const input = this.getBasicCm().getValue();
        const firstLine = input.slice(0, input.indexOf("\n"));
        const matches = firstLine.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
        const name = matches ? matches[1] : this.getCore().getConfigMap().example || "locobasic";
        return name;
    }
    putKeysInBuffer(keys) {
        if (this.getCore().getConfigMap().debug) {
            console.log("putKeysInBuffer:", keys);
        }
        this.getVmMain().putKeys(keys);
    }
    onOutputTextKeydown(event) {
        const key = event.key;
        let putKey = "";
        if (key.length === 1) {
            if (event.ctrlKey === false) {
                putKey = key;
            }
        }
        else if (key === "Escape") {
            this.cancelSpeech();
            this.getVmMain().stop(); // request stop
        }
        else if (key === "Enter") {
            putKey = "\x0d";
        }
        else if (key === "Dead") {
            //const keyAndCode = `${key}-${event.code}`;
            const code = event.code;
            if (code === "KeyN") {
                putKey = "~";
            }
            else if (event.code === "IntlBackslash") {
                putKey = "^";
            }
        }
        if (putKey) {
            this.putKeysInBuffer(putKey);
            event.preventDefault();
        }
    }
    getClickedKey(e) {
        let textNode = null;
        let offset;
        if (document.caretPositionFromPoint) {
            const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
            if (!caretPosition) {
                return;
            }
            textNode = caretPosition.offsetNode;
            offset = caretPosition.offset;
        }
        else if (document.caretRangeFromPoint) {
            // Use WebKit-proprietary fallback method
            const range = document.caretRangeFromPoint(e.clientX, e.clientY);
            if (!range) {
                return;
            }
            textNode = range.startContainer;
            offset = range.startOffset;
        }
        else {
            return;
        }
        if ((textNode === null || textNode === void 0 ? void 0 : textNode.nodeType) === 3) { // Check if the node is a text node
            const textContent = textNode.textContent;
            return textContent ? textContent.charAt(offset) : "";
        }
    }
    onOutputTextClick(event) {
        const key = this.getClickedKey(event);
        if (key) {
            this.putKeysInBuffer(key);
            event.preventDefault(); // Prevent default action if needed
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
    initializeEditor(editorElement, mode, changeHandler, debounceDelay) {
        const editor = window.CodeMirror(editorElement, {
            lineNumbers: true,
            mode,
        });
        editor.on("changes", this.debounce(changeHandler, () => debounceDelay)); // changeHandler.bind(this)
        return editor;
    }
    syncInputState(input, configValue) {
        if (input.checked !== configValue) {
            input.checked = configValue;
            input.dispatchEvent(new Event("change"));
        }
    }
    async getLocoVmWorker() {
        if (!window.locoVmWorker) {
            await this.loadScript(this.locoVmWorkerName, "");
        }
        return window.locoVmWorker;
    }
    async createWebWorker() {
        let worker;
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
        }
        else {
            // Use file-based worker for http/https
            const workerUrl = new URL(this.locoVmWorkerName, window.location.href);
            worker = new Worker(workerUrl);
        }
        return worker;
    }
    createMessageHandlerCallbacks() {
        const callbacks = {
            onFlush: (message, needCls, hasGraphics) => {
                this.addOutputText(message, needCls, hasGraphics);
            },
            onInput: async (prompt) => {
                const input = await this.showConsoleInput(prompt);
                return input;
            },
            onGeolocation: () => this.onGeolocation(),
            onSpeak: (message, pitch) => this.onSpeak(message, pitch),
            onKeyDef: (codes) => {
                this.onSetUiKeys(codes);
            }
        };
        return callbacks;
    }
    // simple mobile device detection
    static isMobile() {
        const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        return regex.test(navigator.userAgent);
    }
    onWindowLoadContinue(core, locoVmWorkerName) {
        this.isMobile = UI.isMobile();
        this.core = core;
        const config = core.getConfigMap();
        const args = this.parseUri(config);
        core.parseArgs(args, config);
        this.locoVmWorkerName = locoVmWorkerName;
        // Map of element IDs to event handlers
        const buttonHandlers = {
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
            compiledReplaceButton: this.onCompiledReplaceButtonClick,
            compiledReplaceAllButton: this.onCompiledReplaceAllButtonClick,
            compiledSearchButton: this.onCompiledSearchButtonClick,
            compiledSearchNextButton: this.onCompiledSearchNextButtonClick,
            compiledSearchPrevButton: this.onCompiledSearchPrevButtonClick,
            labelAddButton: this.onLabelAddButtonClick,
            labelRemoveButton: this.onLabelRemoveButtonClick,
            helpButton: this.onHelpButtonClick,
            exportSvgButton: this.onExportSvgButtonClick,
            fullscreenButton: this.onFullscreenButtonClick,
            standaloneButton: this.onStandaloneButtonClick
        };
        const inputAndSelectHandlers = {
            autoCompileInput: this.onAutoCompileInputChange,
            autoExecuteInput: this.onAutoExecuteInputChange,
            showOutputInput: this.onShowOutputInputChange,
            showBasicInput: this.onShowBasicInputChange,
            showCompiledInput: this.onShowCompiledInputChange,
            databaseSelect: this.onDatabaseSelectChange,
            exampleSelect: this.onExampleSelectChange,
            basicSearchInput: this.onBasicSearchInputChange,
            compiledSearchInput: this.onCompiledSearchInputChange,
            frameInput: this.onFrameInputChange,
        };
        // Attach event listeners for buttons
        Object.entries(buttonHandlers).forEach(([id, handler]) => {
            const element = this.htmlElements[id]; //window.document.getElementById(id) as HTMLButtonElement;
            element.addEventListener("click", handler, false);
        });
        // Attach event listeners for inputs or selects
        Object.entries(inputAndSelectHandlers).forEach(([id, handler]) => {
            const element = this.htmlElements[id]; //window.document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
            element.addEventListener("change", handler, false); // handler.bind(this)
        });
        // Attach keydown listener for basicSearchInput to handle Enter key
        const basicSearchInput = this.htmlElements.basicSearchInput;
        //if (basicSearchInput) {
        basicSearchInput.addEventListener("keydown", this.onBasicSearchInputKeydown, false);
        //}
        // Attach keydown listener for compiledSearchInput to handle Enter key
        const compiledSearchInput = this.htmlElements.compiledSearchInput;
        compiledSearchInput.addEventListener("keydown", this.onCompiledSearchInputKeydown, false);
        // Initialize CodeMirror editors
        const WinCodeMirror = window.CodeMirror;
        if (WinCodeMirror) {
            const getModeFn = LocoBasicMode.getMode;
            WinCodeMirror.defineMode("lbasic", getModeFn);
            this.basicCm = this.initializeEditor(this.htmlElements.basicEditor, "lbasic", this.onBasicTextChange, config.debounceCompile);
            this.compiledCm = this.initializeEditor(this.htmlElements.compiledEditor, "javascript", this.onCompiledTextChange, config.debounceExecute);
            // Initialize SearchHandler instances for both editors
            if (this.basicCm) {
                this.basicSearchHandler = new SearchHandler(this.basicCm, this.htmlElements.basicSearchInput, this.htmlElements.basicReplaceInput, this.isMobile);
            }
            if (this.compiledCm) {
                this.compiledSearchHandler = new SearchHandler(this.compiledCm, this.htmlElements.compiledSearchInput, this.htmlElements.compiledReplaceInput, this.isMobile);
            }
            WinCodeMirror.commands.find = () => {
                if (this.htmlElements.basicSearchPopover.hidden) {
                    this.htmlElements.basicSearchButton.dispatchEvent(new Event("click"));
                }
                else {
                    this.htmlElements.basicSearchNextButton.dispatchEvent(new Event("click"));
                }
            };
            // find, findNext, findPrev, clearSearch, replace, replaceAll
        }
        // Handle browser navigation (popstate)
        window.addEventListener("popstate", (event) => {
            if (event.state) {
                Object.assign(config, core.getDefaultConfigMap()); // load defaults
                const args = this.parseUri(config);
                core.parseArgs(args, config);
                this.htmlElements.databaseSelect.dispatchEvent(new Event("change"));
            }
        });
        // Sync UI state with config
        this.syncInputState(this.htmlElements.showOutputInput, config.showOutput);
        this.syncInputState(this.htmlElements.showBasicInput, config.showBasic);
        this.syncInputState(this.htmlElements.showCompiledInput, config.showCompiled);
        this.syncInputState(this.htmlElements.autoCompileInput, config.autoCompile);
        this.syncInputState(this.htmlElements.autoExecuteInput, config.autoExecute);
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
            this.htmlElements.databaseSelect.dispatchEvent(new Event("change"));
        }, 10);
    }
}
//# sourceMappingURL=UI.js.map