(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.locoVmWorker = {}));
})(this, (function (exports) { 'use strict';

    const workerFn = (parentPort) => {
        const isNodeParentPort = 'on' in parentPort;
        // The vm object will be passed to the worker's code as `_o`
        const vm = {
            _commaOpChar: "\u2192", // Unicode arrow right (Constants.CommaOpChar)
            _tabOpChar: "\u21d2", // Unicode double arrow right (Constants.TabOpChar)
            // Color codes for terminal (foreground). `\x1b[${code + add}m`, e.g. Navy: pen: "\x1b[34m" or paper: "\x1b[44m"
            _ansiColorCodes: [
                30, //  0 Black
                34, //  1 Blue
                94, //  2 Bright Blue
                31, //  3 Red
                35, //  4 Magenta (Purple?)
                35, //  5 Mauve ???
                91, //  6 Bright Red
                35, //  7 Purple
                95, //  8 Bright Magenta ?
                32, //  9 Green
                36, // 10 Cyan
                94, // 11 Sky Blue ?
                33, // 12 Yellow
                37, // 13 White
                94, // 14 Pastel Blue ?
                91, // 15 Orange ?
                95, // 16 Pink (Bright Magenta?)
                95, // 17 Pastel Magenta?
                92, // 18 Bright Green
                92, // 19 Sea Green
                96, // 20 Bright Cyan
                96, // 21 Lime ?
                92, // 22 Pastel Green (Bright Green)
                96, // 23 Pastel Cyan ?
                93, // 24 Bright Yellow
                93, // 25 Pastel Yellow
                37, // 26 Bright White
                37, // 27 White (same as 13)
                95, // 28 Bright Magenta (same as 8)
                93, // 29 Pastel Yellow (same as 25)
                34, // 30 Blue (same as 1)
                92 //  31 Sea Green (same as 19)
            ],
            _cpcColors: [
                "#000000", //  0 Black
                "#000080", //  1 Blue
                "#0000FF", //  2 Bright Blue
                "#800000", //  3 Red
                "#800080", //  4 Magenta
                "#8000FF", //  5 Mauve
                "#FF0000", //  6 Bright Red
                "#FF0080", //  7 Purple
                "#FF00FF", //  8 Bright Magenta
                "#008000", //  9 Green
                "#008080", // 10 Cyan
                "#0080FF", // 11 Sky Blue
                "#808000", // 12 Yellow
                "#808080", // 13 White
                "#8080FF", // 14 Pastel Blue
                "#FF8000", // 15 Orange
                "#FF8080", // 16 Pink
                "#FF80FF", // 17 Pastel Magenta
                "#00FF00", // 18 Bright Green
                "#00FF80", // 19 Sea Green
                "#00FFFF", // 20 Bright Cyan
                "#80FF00", // 21 Lime
                "#80FF80", // 22 Pastel Green
                "#80FFFF", // 23 Pastel Cyan
                "#FFFF00", // 24 Bright Yellow
                "#FFFF80", // 25 Pastel Yellow
                "#FFFFFF", // 26 Bright White
                "#808080", // 27 White (same as 13)
                "#FF00FF", // 28 Bright Magenta (same as 8)
                "#FFFF80", // 29 Pastel Yellow (same as 25)
                "#000080", // 30 Blue (same as 1)
                "#00FF80" //  31 Sea Green (same as 19)
            ],
            _cpcDefaultColorsForPens: [
                1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16, 1
            ],
            _cpcStrokeWidthForMode: [4, 2, 1, 1],
            _frameTime: 50,
            _data: [],
            _dataPtr: 0,
            _graBackgroundColor: "",
            _graColorsForPens: [], // make sure to initialize with resetColorsForPens before usage
            _graCurrGraphicsPen: -1,
            _graCurrMode: 1,
            _graGraphicsBuffer: [],
            _graGraphicsPathBuffer: [],
            _graGraphicsX: 0,
            _graGraphicsY: 0,
            _graOutputGraphicsIndex: -1,
            _graOriginX: 0,
            _graOriginY: 0,
            _isTerminal: false, // output for terminal
            _keyBuffer: [], // buffered pressed keys
            _lastInkeyTime: 0,
            _needCls: false,
            _output: "",
            _paperSpanPos: -1,
            _paperValue: -1,
            _penSpanPos: -1,
            _penValue: -1,
            _pos: 0,
            _restoreMap: {},
            _rsxPitch: 1,
            _startTime: Date.now(),
            _stopRequested: false,
            _pausePromise: undefined,
            _pauseResolvedFn: undefined,
            _timerMap: {},
            _vpos: 0,
            _zone: 13,
            _inputResolvedFn: null,
            _waitResolvedFn: null,
            convert2ControlCodes: (str) => {
                let out = "";
                for (let i = 0; i < str.length; i += 1) {
                    const code = str.charCodeAt(i);
                    out += String.fromCharCode(code >= 0x0100 && code <= 0x011F ? code - 0x0100 : code);
                }
                return out;
            },
            deleteAllItems: (items) => {
                Object.keys(items).forEach(key => delete items[key]); // eslint-disable-line @typescript-eslint/no-dynamic-delete
            },
            formatCommaOrTab: (str) => {
                if (str === vm._commaOpChar) {
                    return " ".repeat(vm._zone - (vm._pos % vm._zone));
                }
                else if (str.charAt(0) === vm._tabOpChar) {
                    const tabSize = Number(str.substring(1));
                    if (isNaN(tabSize) || tabSize <= 0) {
                        return "";
                    }
                    const len = tabSize - 1 - vm._pos;
                    return len >= 0 ? " ".repeat(len) : "\n" + " ".repeat(tabSize - 1);
                }
                return str;
            },
            formatNumber1: (arg) => (arg >= 0 ? ` ${arg} ` : `${arg} `),
            formatNumberArgs: (args) => args.map((arg) => (typeof arg === "number") ? vm.formatNumber1(arg) : arg),
            onMessageHandler: (data) => {
                switch (data.type) {
                    case 'config':
                        vm._isTerminal = data.isTerminal;
                        if (!vm._graColorsForPens.length) {
                            vm.resetColorsForPens(); // make sure it is initialized
                        }
                        break;
                    case 'continue':
                        vm.resolveWait(data.result);
                        break;
                    case 'frameTime':
                        vm._frameTime = data.time;
                        break;
                    case 'input':
                        vm.resolveInput(data.input);
                        break;
                    case 'pause':
                        vm._pausePromise = new Promise((resolve) => {
                            vm._pauseResolvedFn = () => resolve();
                        });
                        vm.pauseAllTimers();
                        break;
                    case 'putKeys':
                        vm._keyBuffer.push(data.keys); // currently only one key
                        break;
                    case 'resume':
                        vm.resolvePause();
                        vm.resumeAllTimers();
                        break;
                    case 'stop':
                        vm._stopRequested = true;
                        vm.remainAll();
                        vm.resolvePause();
                        break;
                }
            },
            postMessage: (message) => {
                parentPort.postMessage(message);
            },
            resetAll: () => {
                vm._data.length = 0;
                vm._dataPtr = 0;
                vm._lastInkeyTime = 0;
                vm.resetColorsForPens();
                vm._graBackgroundColor = "";
                vm._keyBuffer.length = 0;
                vm.deleteAllItems(vm._restoreMap);
                vm._rsxPitch = 1;
                vm._startTime = Date.now();
                vm._stopRequested = false;
                vm.resolvePause();
                vm.remainAll();
                vm.cls();
            },
            resetColorsForPens: () => {
                vm._graColorsForPens.length = 0;
                vm._graColorsForPens.push(...vm._cpcDefaultColorsForPens);
            },
            resolveInput: (input) => {
                if (vm._inputResolvedFn) {
                    vm._inputResolvedFn(input);
                    vm._inputResolvedFn = null;
                }
            },
            resolveWait: (result) => {
                if (vm._waitResolvedFn) {
                    vm._waitResolvedFn(result);
                    vm._waitResolvedFn = null;
                }
            },
            resolvePause: () => {
                if (vm._pauseResolvedFn) {
                    vm._pauseResolvedFn("");
                    vm._pauseResolvedFn = undefined;
                    vm._pausePromise = undefined;
                }
            },
            pauseTimer: (timer) => {
                const timerObj = vm._timerMap[timer];
                if (timerObj) {
                    clearTimeout(timerObj.id);
                    timerObj.id = 0;
                }
            },
            pauseAllTimers: () => {
                for (const timer in vm._timerMap) {
                    vm.pauseTimer(Number(timer));
                }
            },
            resumeTimer: (timer) => {
                const timerObj = vm._timerMap[timer];
                if (timerObj) {
                    timerObj.id = timerObj.repeat ? setInterval(() => timerObj.fn(), timerObj.timeout) :
                        setTimeout(() => timerObj.fn(), timerObj.timeout);
                }
            },
            resumeAllTimers: () => {
                for (const timer in vm._timerMap) {
                    vm.resumeTimer(Number(timer));
                }
            },
            createTimer: (timer, fn, timeout, repeat) => {
                vm.remain(timer);
                const timerObj = {
                    fn,
                    timeout,
                    repeat,
                    id: 0
                };
                vm._timerMap[timer] = timerObj;
                vm.resumeTimer(timer);
            },
            abs: (num) => Math.abs(num),
            after: (timeout, timer, fn) => {
                vm.createTimer(timer, () => fn(), timeout * 20, false);
            },
            asc: (str) => str.charCodeAt(0),
            atn: (num) => Math.atan(num),
            bin$: (num, pad = 0) => num.toString(2).toUpperCase().padStart(pad, "0"),
            chr$: (num) => String.fromCharCode(num),
            cint: (num) => Math.round(num),
            clearInput: () => {
                vm._keyBuffer.length = 0;
            },
            cls: () => {
                // no property deps
                vm._graCurrGraphicsPen = -1;
                if ("_graGraphicsBuffer" in vm) {
                    vm._graGraphicsBuffer.length = 0;
                }
                vm._graGraphicsX = 0;
                vm._graGraphicsY = 0;
                vm._graOutputGraphicsIndex = -1;
                vm._output = "";
                vm._paperSpanPos = -1;
                vm._paperValue = -1;
                vm._penSpanPos = -1;
                vm._penValue = -1;
                vm._pos = 0;
                vm._vpos = 0;
                vm._zone = 13;
                vm._needCls = true;
            },
            cos: (num) => Math.cos(num),
            creal: (num) => num,
            dec$: (num, format) => {
                const decimals = (format.split(".")[1] || "").length;
                const str = num.toFixed(decimals);
                const pad = " ".repeat(Math.max(0, format.length - str.length));
                const str2 = pad + str;
                return (str2.length > format.length ? "%" : "") + str2;
            },
            dim: (dims, value = 0) => {
                const createRecursiveArray = (depth) => {
                    const length = dims[depth] + 1;
                    const array = new Array(length);
                    depth += 1;
                    if (depth < dims.length) {
                        for (let i = 0; i < length; i += 1) {
                            array[i] = createRecursiveArray(depth);
                        }
                    }
                    else {
                        array.fill(value);
                    }
                    return array;
                };
                return createRecursiveArray(0);
            },
            dim1: (num, value = 0) => new Array(num + 1).fill(value),
            dim1i16: (num) => new Int16Array(num + 1),
            draw: (x, y, pen) => vm.graDrawMovePlot("L", x, y, pen),
            drawr: (x, y, pen) => vm.graDrawMovePlot("l", x, y, pen),
            end: () => vm.flush(),
            escapeText: (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;"),
            every: (timeout, timer, fn) => {
                vm.createTimer(timer, () => fn(), timeout * 20, true);
            },
            exp: (num) => Math.exp(num),
            fix: (num) => Math.trunc(num),
            flush: () => {
                const textOutput = vm.handleTrailingNewline(vm.getFlushedText());
                const graphicsOutput = vm.handleTrailingNewline(vm.graGetFlushedGraphics());
                const outputGraphicsIndex = vm._graOutputGraphicsIndex;
                const hasGraphics = outputGraphicsIndex >= 0;
                const message = hasGraphics ? textOutput.substring(0, outputGraphicsIndex) + graphicsOutput + textOutput.substring(outputGraphicsIndex) : textOutput;
                if (message) {
                    const hasGraphics = vm._graOutputGraphicsIndex >= 0;
                    vm.postMessage({ type: 'flush', message, hasGraphics, needCls: vm._needCls });
                    vm._needCls = false;
                }
            },
            frame: async () => {
                vm.flush();
                if (vm._pausePromise) {
                    await vm._pausePromise;
                }
                // Check again after pause resolves in case stop was called
                if (vm._stopRequested) {
                    throw new Error("INFO: Program stopped");
                }
                return new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        // Final check before resolving in case stop was requested during timeout
                        if (vm._stopRequested) {
                            reject(new Error("INFO: Program stopped"));
                        }
                        else {
                            resolve();
                        }
                    }, Date.now() % vm._frameTime);
                    // If stop is requested, clear the timeout immediately
                    if (vm._stopRequested) {
                        clearTimeout(timeoutId);
                        reject(new Error("INFO: Program stopped"));
                    }
                });
            },
            getAnsiColorCodeForPen: (pen) => {
                return vm._ansiColorCodes[vm._graColorsForPens[pen]];
            },
            getFlushedText: () => {
                const output = vm._output;
                vm._output = "";
                return output;
            },
            graAddGraphicsElement: (element) => {
                vm.graSetOutputGraphicsIndex();
                vm.graFlushGraphicsPath(); // maybe a path is open
                vm._graGraphicsBuffer.push(element);
            },
            // type: M | m | P | p | L | l
            graDrawMovePlot: (type, x, y, pen) => {
                vm.graSetOutputGraphicsIndex();
                if (pen !== undefined) {
                    vm.graphicsPen(pen);
                }
                x = Math.round(x);
                y = Math.round(y);
                if (!vm._graGraphicsPathBuffer.length && type !== "M" && type !== "P") { // path must start with an absolute move
                    vm._graGraphicsPathBuffer.push(`M${vm._graGraphicsX + vm._graOriginX} ${399 - vm._graGraphicsY - vm._graOriginY}`);
                }
                const isAbsolute = type === type.toUpperCase();
                if (isAbsolute) {
                    vm._graGraphicsX = x;
                    vm._graGraphicsY = y;
                    x = vm._graGraphicsX + vm._graOriginX;
                    y = 399 - vm._graGraphicsY - vm._graOriginY;
                }
                else {
                    vm._graGraphicsX += x;
                    vm._graGraphicsY += y;
                    y = -y;
                }
                const svgPathCmd = (type === "P" || type === "p")
                    ? `${isAbsolute ? "M" : "m"}${x} ${y}h1v1h-1v-1`
                    : `${type}${x} ${y}`;
                vm._graGraphicsPathBuffer.push(svgPathCmd);
            },
            graFlushGraphicsPath: () => {
                if (vm._graGraphicsPathBuffer.length) {
                    const strokeStr = vm._graCurrGraphicsPen >= 0 ? `stroke="${vm.graGetRgbColorStringForPen(vm._graCurrGraphicsPen)}" ` : "";
                    vm._graGraphicsBuffer.push(`<path ${strokeStr}d="${vm._graGraphicsPathBuffer.join("")}" />`);
                    vm._graGraphicsPathBuffer.length = 0;
                }
            },
            graGetFlushedGraphics: () => {
                vm.graFlushGraphicsPath();
                if (vm._graGraphicsBuffer.length) {
                    const graphicsBufferStr = vm._graGraphicsBuffer.join("\n");
                    vm._graGraphicsBuffer.length = 0;
                    const backgroundColorStr = vm._graBackgroundColor !== "" ? ` style="background-color:${vm._graBackgroundColor}"` : '';
                    const strokeWidth = vm._cpcStrokeWidthForMode[vm._graCurrMode] + "px";
                    return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" shape-rendering="optimizeSpeed" stroke="currentColor" stroke-width="${strokeWidth}"${backgroundColorStr}>\n${graphicsBufferStr}\n</svg>\n`;
                }
                return "";
            },
            graGetRgbColorStringForPen: (pen) => {
                return vm._cpcColors[vm._graColorsForPens[pen]];
            },
            graGetStrokeAndFillStr: (fill) => {
                const currGraphicsPen = vm._graCurrGraphicsPen;
                const strokeStr = currGraphicsPen >= 0 ? ` stroke="${vm.graGetRgbColorStringForPen(currGraphicsPen)}"` : "";
                const fillStr = fill >= 0 ? ` fill="${vm.graGetRgbColorStringForPen(fill)}"` : "";
                return `${strokeStr}${fillStr}`;
            },
            graPrintGraphicsText: (text) => {
                text = vm.escapeText(text);
                const yOffset = 16;
                const colorStyleStr = vm._graCurrGraphicsPen >= 0 ? `; color: ${vm.graGetRgbColorStringForPen(vm._graCurrGraphicsPen)}` : "";
                vm.graAddGraphicsElement(`<text x="${vm._graGraphicsX + vm._graOriginX}" y="${399 - vm._graGraphicsY - vm._graOriginY + yOffset}" style="white-space: pre${colorStyleStr}">${text}</text>`);
                vm._graGraphicsX += text.length * 8; // assuming 8px width per character
            },
            graSetOutputGraphicsIndex: () => {
                if (vm._graOutputGraphicsIndex < 0) {
                    vm._graOutputGraphicsIndex = vm._output.length;
                }
            },
            handleTrailingNewline: (str) => {
                return vm._isTerminal ? str.replace(/\n$/, "") : str;
            },
            graphicsPen: (num) => {
                if (num !== vm._graCurrGraphicsPen) {
                    vm.graFlushGraphicsPath();
                    vm._graCurrGraphicsPen = num;
                }
            },
            handleControlCodes: (str) => {
                return str.replace(/\t/g, " "); // replace tab by single space
            },
            hex$: (num, pad) => num.toString(16).toUpperCase().padStart(pad || 0, "0"),
            ink: (num, col) => {
                vm._graColorsForPens[num] = col;
                // we modify inks, so set default pens and papers
                if (vm._graCurrGraphicsPen < 0) {
                    vm.graphicsPen(1);
                }
                if (num === 0) {
                    vm._graBackgroundColor = vm.graGetRgbColorStringForPen(0);
                }
            },
            inkey$: async () => {
                if (vm._keyBuffer.length) {
                    return vm._keyBuffer.shift();
                }
                const oldInkeyTime = vm._lastInkeyTime;
                vm._lastInkeyTime = Date.now();
                const frameTimeMs = 1000 / 50; // 50 Hz => 20 ms (do we need to use frametime here?)
                if ((vm._lastInkeyTime - oldInkeyTime) < frameTimeMs) {
                    await vm.frame();
                }
                return "";
            },
            input: async (prompt, types) => {
                const input = await vm.lineInput(prompt);
                const parts = input.split(',');
                if (parts.length < types.length) { // not enough parts
                    parts.push(...new Array(types.length - parts.length).fill(""));
                }
                return parts.map((part, index) => {
                    return types.charAt(index) === 'n' ? Number(part) : part;
                });
            },
            instr: (str, find, len) => {
                return vm.convert2ControlCodes(str).indexOf(vm.convert2ControlCodes(find), len !== undefined ? len - 1 : len) + 1;
            },
            int: (num) => Math.floor(num),
            keyDef: (num, repeat, ...codes) => {
                if (num === 78 && repeat === 1) {
                    vm.postMessage({ type: 'keyDef', codes });
                }
            },
            left$: (str, num) => str.slice(0, num),
            len: (str) => str.length,
            lineInput: async (prompt) => {
                const inputPromise = new Promise((resolve) => {
                    vm._inputResolvedFn = resolve;
                });
                await vm.frame();
                vm.postMessage({ type: 'input', prompt });
                const input = await inputPromise;
                if (input === null) {
                    throw new Error("INFO: Input canceled");
                }
                return input;
            },
            log: (num) => Math.log(num),
            log10: (num) => Math.log10(num),
            lower$: (str) => str.toLowerCase(),
            max: (...nums) => Math.max.apply(null, nums),
            mid$: (str, pos, len) => str.substr(pos - 1, len),
            mid$Assign: (s, start, newString, len) => {
                start -= 1;
                len = Math.min(len !== null && len !== void 0 ? len : newString.length, newString.length, s.length - start);
                return s.substring(0, start) + newString.substring(0, len) + s.substring(start + len);
            },
            min: (...nums) => Math.min.apply(null, nums),
            mode: (num) => {
                vm._graCurrMode = num;
                vm.origin(0, 0);
                vm.cls();
            },
            move: (x, y, pen) => vm.graDrawMovePlot("M", x, y, pen),
            mover: (x, y, pen) => vm.graDrawMovePlot("m", x, y, pen),
            origin: (x, y) => {
                vm._graOriginX = x;
                vm._graOriginY = y;
            },
            paper: (n) => {
                // Use a virtual stack to handle paper and pen spans
                if (n !== vm._paperValue) {
                    vm._paperValue = n;
                    if (vm._isTerminal) {
                        const backgroundAdd = 10;
                        const ansicolorCode = vm.getAnsiColorCodeForPen(n) + backgroundAdd;
                        vm._output += `\x1b[${ansicolorCode}m`;
                        return;
                    }
                    // paper for browser: close open paper first
                    if (vm._paperSpanPos >= 0) {
                        if (vm._penSpanPos > vm._paperSpanPos) { // if pen inside paper is open, close it
                            vm._output += "</span>";
                            vm._penSpanPos = -1;
                        }
                        vm._output += "</span>";
                        vm._paperSpanPos = -1;
                    }
                    // Open new paper span
                    vm._paperSpanPos = vm._penSpanPos + 1;
                    vm._output += `<span style="background-color: ${vm.graGetRgbColorStringForPen(n)}">`;
                    // If pen was open before, reopen it inside
                    if (vm._penValue >= 0 && vm._penSpanPos === -1) {
                        vm._penSpanPos = vm._paperSpanPos + 1;
                        vm._output += `<span style="color: ${vm.graGetRgbColorStringForPen(vm._penValue)}">`;
                    }
                }
            },
            pen: (n) => {
                if (n !== vm._penValue) {
                    vm._penValue = n;
                    if (vm._isTerminal) {
                        vm._output += `\x1b[${vm.getAnsiColorCodeForPen(n)}m`;
                        return;
                    }
                    // close open pen first
                    if (vm._penSpanPos >= 0) {
                        if (vm._paperSpanPos > vm._penSpanPos) { // if paper inside pen is open, close it
                            vm._output += "</span>";
                            vm._paperSpanPos = -1;
                        }
                        vm._output += "</span>";
                        vm._penSpanPos = -1;
                    }
                    // Open new pen span
                    vm._penSpanPos = vm._paperSpanPos + 1;
                    vm._output += `<span style="color: ${vm.graGetRgbColorStringForPen(n)}">`;
                    // If paper was open before, reopen it inside
                    if (vm._paperValue >= 0 && vm._paperSpanPos === -1) {
                        vm._paperSpanPos = vm._penSpanPos + 1;
                        vm._output += `<span style="background-color: ${vm.graGetRgbColorStringForPen(vm._paperValue)}">`;
                    }
                }
            },
            pi: Math.PI, // a constant!
            plot: (x, y, pen) => vm.graDrawMovePlot("P", x, y, pen),
            plotr: (x, y, pen) => vm.graDrawMovePlot("p", x, y, pen),
            pos: () => vm._pos + 1,
            print: (...args) => {
                vm.printText(vm.formatNumberArgs(args).join(""));
            },
            printTag: (...args) => {
                return vm.graPrintGraphicsText(vm.formatNumberArgs(args).join(""));
            },
            printTab: (...args) => {
                const strArgs = vm.formatNumberArgs(args);
                for (const str of strArgs) {
                    vm.printText(vm.formatCommaOrTab(str));
                }
            },
            printTabTag: (...args) => {
                const strArgs = vm.formatNumberArgs(args);
                return vm.graPrintGraphicsText(strArgs.map(arg => vm.formatCommaOrTab(arg)).join(""));
                // For graphics output the text position does not change, so we can output all at once
            },
            printText: (text) => {
                text = vm.handleControlCodes(text);
                vm._output += vm._isTerminal ? text : vm.escapeText(text); // for node.js we do not need to escape (non-graphics) text
                const lines = text.split("\n");
                if (lines.length > 1) {
                    vm._vpos += lines.length - 1;
                    vm._pos = lines[lines.length - 1].length;
                }
                else {
                    vm._pos += text.length;
                }
            },
            read: () => {
                if (vm._dataPtr < vm._data.length) {
                    return vm._data[vm._dataPtr++];
                }
                else {
                    throw new Error("4"); // 4: DATA exhausted
                }
            },
            remain: (timer) => {
                const timerObj = vm._timerMap[timer];
                if (timerObj !== undefined) {
                    clearTimeout(timerObj.id);
                    delete vm._timerMap[timer]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
                }
                return 0; // not really the remaining time
            },
            remainAll: () => {
                for (const timer in vm._timerMap) {
                    vm.remain(Number(timer));
                }
            },
            restore: (label) => {
                vm._dataPtr = vm._restoreMap[label];
            },
            right$: (str, num) => str.substring(str.length - num),
            rnd: () => Math.random(),
            round1: (num) => Math.round(num),
            round: (num, dec) => Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec),
            rsxArc: (...args) => {
                const [x, y, rx, ry, rotx, long, sweep, endx, endy, fill] = args.map((p) => Math.round(p));
                const strokeAndFillStr = vm.graGetStrokeAndFillStr(fill);
                const svgPathCmd = `M${x} ${399 - y} A${rx} ${ry} ${rotx} ${long} ${sweep} ${endx} ${399 - endy}`;
                vm.graAddGraphicsElement(`<path d="${svgPathCmd}"${strokeAndFillStr} />`);
            },
            rsxCircle: (...args) => {
                const [cx, cy, r, fill] = args.map((p) => Math.round(p));
                const strokeAndFillStr = vm.graGetStrokeAndFillStr(fill);
                vm.graAddGraphicsElement(`<circle cx="${cx}" cy="${399 - cy}" r="${r}"${strokeAndFillStr} />`);
            },
            rsxDate: (...args) => {
                const date = new Date();
                const dayOfWeek = (date.getDay() + 1) % 7;
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear() % 100;
                const dateStr = `${String(dayOfWeek).padStart(2, '0')} ${String(day).padStart(2, '0')} ${String(month).padStart(2, '0')} ${String(year).padStart(2, '0')}`;
                args[0] = dateStr;
                return args;
            },
            rsxEllipse: (...args) => {
                const [cx, cy, rx, ry, fill] = args.map((p) => Math.round(p));
                const strokeAndFillStr = vm.graGetStrokeAndFillStr(fill);
                vm.graAddGraphicsElement(`<ellipse cx="${cx}" cy="${399 - cy}" rx="${rx}" ry="${ry}"${strokeAndFillStr} />`);
            },
            rsxGeolocation: (...args) => {
                const promise = new Promise((resolve) => {
                    vm._waitResolvedFn = resolve;
                }).then((str) => {
                    if (str.startsWith("{")) {
                        const json = JSON.parse(str);
                        args[0] = json.latitude;
                        args[1] = json.longitude;
                        return args;
                    }
                    return args;
                });
                vm.postMessage({ type: 'geolocation' });
                return promise;
            },
            rsxPitch: (...args) => {
                vm._rsxPitch = args[0] / 10;
            },
            rsxPolygon: (...args) => {
                const fill = args.length % 2 ? args.pop() : -1;
                const points = args.map((p) => Math.round(p)).map((p, index) => index % 2 ? 399 - p : p);
                const strokeAndFillStr = vm.graGetStrokeAndFillStr(fill);
                vm.graAddGraphicsElement(`<polygon points="${points}"${strokeAndFillStr} />`);
            },
            rsxRect: (...args) => {
                const [x1, y1, x2, y2, fill] = args.map((p) => Math.round(p));
                const x = Math.min(x1, x2);
                const y = Math.max(y1, y2);
                const width = Math.abs(x2 - x1);
                const height = Math.abs(y2 - y1);
                const strokeAndFillStr = vm.graGetStrokeAndFillStr(fill);
                vm.graAddGraphicsElement(`<rect x="${x}" y="${399 - y}" width="${width}" height="${height}"${strokeAndFillStr} />`);
            },
            rsxSay: (...args) => {
                const promise = new Promise((resolve) => {
                    vm._waitResolvedFn = resolve;
                });
                const message = args[0];
                vm.postMessage({ type: 'speak', message, pitch: vm._rsxPitch });
                return promise;
            },
            rsxTime: (...args) => {
                const date = new Date();
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();
                const timeStr = `${String(hours).padStart(2, '0')} ${String(minutes).padStart(2, '0')} ${String(seconds).padStart(2, '0')}`;
                args[0] = timeStr;
                return args;
            },
            sgn: (num) => Math.sign(num),
            sin: (num) => Math.sin(num),
            space$: (num) => " ".repeat(num),
            spc: (num) => " ".repeat(num),
            sqr: (num) => Math.sqrt(num),
            stop: () => vm.flush(),
            str$: (num) => num >= 0 ? ` ${num}` : String(num),
            string$Num: (len, num) => String.fromCharCode(num).repeat(len),
            string$Str: (len, str) => str.repeat(len),
            tan: (num) => Math.tan(num),
            time: () => ((Date.now() - vm._startTime) * 3 / 10) | 0,
            toDeg: (num) => num * 180 / Math.PI,
            toRad: (num) => num * Math.PI / 180,
            using: (format, ...args) => {
                return args.map((arg) => vm.dec$(arg, format)).join('');
            },
            unt: (num) => num,
            upper$: (str) => str.toUpperCase(),
            val1: (str) => Number(str),
            val: (str) => Number(str.replace("&x", "0b").replace("&", "0x")),
            vpos: () => vm._vpos + 1,
            write: (...args) => {
                const text = args.map((arg) => (typeof arg === "string") ? `"${arg}"` : `${arg}`).join(",") + "\n";
                vm.printText(text);
            },
            writeTag: (...args) => {
                const text = args.map((arg) => (typeof arg === "string") ? `"${arg}"` : `${arg}`).join(",") + "\n";
                return vm.graPrintGraphicsText(text);
            },
            xpos: () => vm._graGraphicsX,
            ypos: () => vm._graGraphicsY,
            zone: (num) => {
                vm._zone = num;
            },
        };
        // Get the error event with line number from an synchronous, uncatched error.
        // It does not work for async functions with "unhandledrejection" event.
        const errorEventHandler = (event) => {
            const errorEvent = event;
            errorEvent.preventDefault();
            const { lineno, colno, message } = errorEvent;
            const plainErrorEventObj = { lineno, colno, message };
            const result = JSON.stringify(plainErrorEventObj);
            vm.remainAll();
            vm.postMessage({ type: 'result', result });
        };
        const onRun = (code) => {
            vm.resetAll();
            if (!isNodeParentPort) { // not for node.js
                parentPort.addEventListener("error", errorEventHandler, { once: true });
            }
            const fnScript = new Function("_o", `"use strict"; return (async () => { ${code} })();`); // compile
            if (!isNodeParentPort) {
                parentPort.removeEventListener("error", errorEventHandler);
            }
            const handleError = (err) => {
                vm.remainAll();
                const result = String(err);
                if (result.startsWith("Error: INFO:")) {
                    console.log(result.replace("Error: ", ""));
                }
                else {
                    console.warn(err instanceof Error ? err.stack : result);
                }
                vm.flush();
                vm.postMessage({ type: 'result', result });
            };
            const promise = fnScript(vm).then((result) => {
                vm.remainAll();
                vm.flush();
                result = result !== null && result !== void 0 ? result : "";
                vm.postMessage({ type: 'result', result });
            }).catch(handleError);
            // Handle unhandled rejections in case of race conditions
            if (isNodeParentPort) {
                promise.catch((err) => {
                    console.error("Unhandled promise rejection in VmWorker:", err);
                });
            }
        };
        // this function must not be async to generate synchronous error
        const onMessageHandler = (data) => {
            if (data.type === 'run') {
                onRun(data.code);
            }
            else {
                vm.onMessageHandler(data);
            }
        };
        if (isNodeParentPort) {
            parentPort.on('message', onMessageHandler);
        }
        else {
            parentPort.addEventListener('message', (event) => {
                const data = event.data;
                onMessageHandler(data);
            });
        }
        return vm;
    };
    if (typeof require !== "undefined") { // node.js worker environment
        (function callWithParentPort() {
            const { parentPort } = require('worker_threads');
            if (parentPort) { // is null in test environment
                workerFn(parentPort);
            }
        })();
    }
    else if (typeof self !== "undefined" && typeof Window === "undefined") { // web worker environment
        workerFn(self);
    }

    exports.workerFn = workerFn;

}));
//# sourceMappingURL=locoVmWorker.js.map
