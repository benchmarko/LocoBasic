import type { MessageFromWorker, MessageToWorker } from "../Interfaces";

interface NodeWorkerThreads {
    parentPort: {
        postMessage: (message: MessageFromWorker) => void
        on: (event: string, listener: (data: MessageToWorker) => void) => void;
    }
}

declare function require(name: string): NodeWorkerThreads;

export const workerFn = (parentPort?: NodeWorkerThreads["parentPort"]) => {

    const postMessage = (message: MessageFromWorker) => {
        (parentPort || self).postMessage(message);
    }

    const CommaOpChar = "\u2192"; // Unicode arrow right
    const TabOpChar = "\u21d2"; // Unicode double arrow right

    const cpcColors = [ // browser
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
    ];

    // Color codes for terminal (foreground). `\x1b[${code + add}m`, e.g. Navy: pen: "\x1b[34m" or paper: "\x1b[44m"
    const ansiColorCodes = [
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
    ];

    const defaultColorsForPens: number[] = [
        1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16, 1
    ];

    const deleteAllItems = (items: Record<string, unknown>): void => {
        Object.keys(items).forEach(key => delete items[key]);
    };

    const strokeWidthForMode: number[] = [4, 2, 1, 1];

    const getTagInSvg = (content: string, strokeWidth: string, backgroundColor: string) => {
        const backgroundColorStr = backgroundColor !== "" ? ` style="background-color:${backgroundColor}"` : '';
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" shape-rendering="optimizeSpeed" stroke="currentColor" stroke-width="${strokeWidth}"${backgroundColorStr}>
${content}
</svg>
`;
    };

    const vmRsx = {
        _pitch: 1,

        resetRsx: () => {
            vmRsx._pitch = 1;
        },

        rsxDate: async (args: (number | string)[]) => {
            const date = new Date();
            const dayOfWeek = (date.getDay() + 1) % 7;
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear() % 100;
            const dateStr = `${String(dayOfWeek).padStart(2, '0')} ${String(day).padStart(2, '0')} ${String(month).padStart(2, '0')} ${String(year).padStart(2, '0')}`;
            args[0] = dateStr;
            return Promise.resolve(args);
        },
        rsxPitch: (args: (number | string)[]) => {
            vmRsx._pitch = (args[0] as number) / 10;
        },

        rsxSay: (args: (number | string)[]) => {
            const message = args[0] as string;
            postMessage({ type: 'speak', message, pitch: vmRsx._pitch });
        },

        rsxTime: async (args: (number | string)[]) => {
            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const timeStr = `${String(hours).padStart(2, '0')} ${String(minutes).padStart(2, '0')} ${String(seconds).padStart(2, '0')}`;
            args[0] = timeStr;
            return Promise.resolve(args);
        }
    };

    const vmGra = {
        _backgroundColor: "",
        _colorsForPens: [...defaultColorsForPens],
        _currGraphicsPen: -1,
        _currMode: 1,
        _originX: 0,
        _originY: 0,
        _graphicsBuffer: [] as string[],
        _graphicsPathBuffer: [] as string[],
        _graphicsX: 0,
        _graphicsY: 0,
        _outputGraphicsIndex: -1,

        resetGra: () => {
            vmGra._colorsForPens.splice(0, vmGra._colorsForPens.length, ...defaultColorsForPens);
            vmGra._backgroundColor = "";
            vmGra.cls();
        },

        addGraphicsElement(element: string): void {
            vmGra.setOutputGraphicsIndex();
            vmGra.flushGraphicsPath(); // maybe a path is open
            vmGra._graphicsBuffer.push(element);
        },

        cls: (): void => {
            vmGra._graphicsBuffer.length = 0;
            vmGra._graphicsPathBuffer.length = 0;
            vmGra._currGraphicsPen = -1;
            vmGra._graphicsX = 0;
            vmGra._graphicsY = 0;
            vmGra._outputGraphicsIndex = -1;
        },

        // type: M | m | P | p | L | l
        drawMovePlot: (type: string, x: number, y: number, pen?: number): void => {
            vmGra.setOutputGraphicsIndex();
            if (pen !== undefined) {
                vmGra.graphicsPen(pen);
            }
            x = Math.round(x);
            y = Math.round(y);

            if (!vmGra._graphicsPathBuffer.length && type !== "M" && type !== "P") { // path must start with an absolute move
                vmGra._graphicsPathBuffer.push(`M${vmGra._graphicsX + vmGra._originX} ${399 - vmGra._graphicsY - vmGra._originY}`);
            }

            const isAbsolute = type === type.toUpperCase();
            if (isAbsolute) {
                vmGra._graphicsX = x;
                vmGra._graphicsY = y;
                x = vmGra._graphicsX + vmGra._originX;
                y = 399 - vmGra._graphicsY - vmGra._originY;
            } else {
                vmGra._graphicsX += x;
                vmGra._graphicsY += y;
                y = -y;
            }

            const svgPathCmd = (type === "P" || type === "p")
                ? `${isAbsolute ? "M" : "m"}${x} ${y}h1v1h-1v-1`
                : `${type}${x} ${y}`;

            vmGra._graphicsPathBuffer.push(svgPathCmd);
        },

        flushGraphicsPath(): void {
            if (vmGra._graphicsPathBuffer.length) {
                const strokeStr = this._currGraphicsPen >= 0 ? `stroke="${vmGra.getRgbColorStringForPen(vmGra._currGraphicsPen)}" ` : "";
                vmGra._graphicsBuffer.push(`<path ${strokeStr}d="${vmGra._graphicsPathBuffer.join("")}" />`);
                vmGra._graphicsPathBuffer.length = 0;
            }
        },

        getFlushedGraphics(): string {
            vmGra.flushGraphicsPath();
            if (vmGra._graphicsBuffer.length) {
                const graphicsBufferStr = vmGra._graphicsBuffer.join("\n");
                const strokeWith = strokeWidthForMode[vmGra._currMode] + "px";
                vmGra._graphicsBuffer.length = 0;
                return getTagInSvg(graphicsBufferStr, strokeWith, vmGra._backgroundColor);
            }
            return "";
        },

        getRgbColorStringForPen: (pen: number): string => {
            return cpcColors[vmGra._colorsForPens[pen]];
        },

        graphicsPen: (num: number): void => {
            if (num !== vmGra._currGraphicsPen) {
                vmGra.flushGraphicsPath();
                vmGra._currGraphicsPen = num;
            }
        },

        ink: (num: number, col: number): void => {
            vmGra._colorsForPens[num] = col;
            // we modify inks, so set default pens and papers
            if (vmGra._currGraphicsPen < 0) {
                vmGra.graphicsPen(1);
            }
            if (num === 0) {
                vmGra._backgroundColor = vmGra.getRgbColorStringForPen(0);
            }
        },

        mode: (num: number): void => {
            vmGra._currMode = num;
            vmGra.origin(0, 0);
        },

        origin: (x: number, y: number): void => {
            vmGra._originX = x;
            vmGra._originY = y;
        },

        printGraphicsText: (text: string): void => {
            const yOffset = 16;
            const colorStyleStr = vmGra._currGraphicsPen >= 0 ? `; color: ${vmGra.getRgbColorStringForPen(vmGra._currGraphicsPen)}` : "";
            vmGra.addGraphicsElement(`<text x="${vmGra._graphicsX + vmGra._originX}" y="${399 - vmGra._graphicsY - vmGra._originY + yOffset}" style="white-space: pre${colorStyleStr}">${text}</text>`);
            vmGra._graphicsX += text.length * 8; // assuming 8px width per character
        },


        getStrokeAndFillStr(fill: number): string {
            const currGraphicsPen = vmGra._currGraphicsPen;
            const strokeStr = currGraphicsPen >= 0 ? ` stroke="${vmGra.getRgbColorStringForPen(currGraphicsPen)}"` : "";
            const fillStr = fill >= 0 ? ` fill="${vmGra.getRgbColorStringForPen(fill)}"` : "";
            return `${strokeStr}${fillStr}`;
        },

        rsxArc: (args: (number | string)[]) => {
            const [x, y, rx, ry, rotx, long, sweep, endx, endy, fill] = args.map((p) => Math.round(p as number));
            const strokeAndFillStr = vmGra.getStrokeAndFillStr(fill);
            const svgPathCmd = `M${x} ${399 - y} A${rx} ${ry} ${rotx} ${long} ${sweep} ${endx} ${399 - endy}`;
            vmGra.addGraphicsElement(`<path d="${svgPathCmd}"${strokeAndFillStr} />`);
        },

        rsxCircle: (args: (number | string)[]) => {
            const [cx, cy, r, fill] = args.map((p) => Math.round(p as number));
            const strokeAndFillStr = vmGra.getStrokeAndFillStr(fill);
            vmGra.addGraphicsElement(`<circle cx="${cx}" cy="${399 - cy}" r="${r}"${strokeAndFillStr} />`);
        },

        rsxEllipse: (args: (number | string)[]) => {
            const [cx, cy, rx, ry, fill] = args.map((p) => Math.round(p as number));
            const strokeAndFillStr = vmGra.getStrokeAndFillStr(fill);
            vmGra.addGraphicsElement(`<ellipse cx="${cx}" cy="${399 - cy}" rx="${rx}" ry="${ry}"${strokeAndFillStr} />`);
        },

        rsxRect: (args: (number | string)[]) => {
            const [x1, y1, x2, y2, fill] = args.map((p) => Math.round(p as number));
            const x = Math.min(x1, x2);
            const y = Math.max(y1, y2);
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);
            const strokeAndFillStr = vmGra.getStrokeAndFillStr(fill);
            vmGra.addGraphicsElement(`<rect x="${x}" y="${399 - y}" width="${width}" height="${height}"${strokeAndFillStr} />`);
        },

        setOutputGraphicsIndex: (): void => {
            if (vmGra._outputGraphicsIndex < 0) {
                vmGra._outputGraphicsIndex = vm._output.length;
            }
        },

        xpos: (): number => {
            return vmGra._graphicsX;
        },

        ypos: (): number => {
            return vmGra._graphicsY;
        }
    };

    type RecursiveArray<T> = T | RecursiveArray<T>[];

    type RestoreMapType = Record<string, number>;

    // This object will be passed to the worker's code as `_o`
    const vm = {
        _gra: vmGra,
        _rsx: vmRsx,
        _inputResolvedFn: null as ((value: string) => void) | null,
        _waitResolvedFn: null as (() => void) | null,
        _isTerminal: false, // output for terminal

        _data: [] as (string | number)[],
        _dataPtr: 0,
        _keyCharBufferString: "",
        _needCls: false,
        _output: "",
        _paperSpanPos: -1,
        _paperValue: -1,
        _penSpanPos: -1,
        _penValue: -1,
        _pos: 0,
        _restoreMap: {} as RestoreMapType,
        _startTime: 0,
        _stopRequested: false,
        _tag: false,
        _timerMap: {} as Record<number, (number | NodeJS.Timeout)>,
        _vpos: 0,
        _zone: 13,

        resetAll: () => {
            vm._rsx.resetRsx();
            vm._gra.resetGra();
            vm.cls();
            vm._data.length = 0;
            vm._dataPtr = 0;
            vm._keyCharBufferString = "";
            deleteAllItems(vm._restoreMap);
            vm._startTime = Date.now();
            vm._stopRequested = false;
            vm.remainAll();
        },

        abs: (num: number) => Math.abs(num),

        after: (timeout: number, timer: number, fn: () => void) => {
            vm.remain(timer);
            vm._timerMap[timer] = setTimeout(() => fn(), timeout * 20);
        },

        asc: (str: string) => str.charCodeAt(0),

        atn: Math.atan,

        bin$: (num: number, pad: number = 0): string => {
            return num.toString(2).toUpperCase().padStart(pad, "0");
        },

        chr$: (num: number) => String.fromCharCode(num),

        cint: (num: number) => Math.round(num),

        clearInput: () => vm._keyCharBufferString = "",

        cls: () => {
            vm._output = "";
            vm._paperSpanPos = -1;
            vm._paperValue = -1;
            vm._penSpanPos = -1;
            vm._penValue = -1;
            vm._pos = 0;
            vm._tag = false;
            vm._vpos = 0;
            vm._zone = 13;

            vm._gra.cls();
            vm._needCls = true;
        },

        cos: Math.cos,

        creal: (num: number) => num, // nothing

        dec$: (num: number, format: string) => {
            const decimals = (format.split(".")[1] || "").length;
            const str = num.toFixed(decimals);
            const pad = " ".repeat(Math.max(0, format.length - str.length));
            return pad + str;
        },

        dim: (dims: number[], value: string | number = 0) => {
            const createRecursiveArray = (depth: number): RecursiveArray<string | number> => {
                const length = dims[depth] + 1;
                const array: RecursiveArray<string | number> = new Array(length);
                depth += 1;
                if (depth < dims.length) {
                    for (let i = 0; i < length; i += 1) {
                        array[i] = createRecursiveArray(depth);
                    }
                } else {
                    array.fill(value);
                }
                return array;
            };
            return createRecursiveArray(0);
        },

        dim1: (dim: number, value: string | number = 0) => {
            return new Array(dim + 1).fill(value);
        },

        draw: function draw(x: number, y: number, pen?: number) {
            vm._gra.drawMovePlot("L", x, y, pen);
        },
        drawr: function drawr(x: number, y: number, pen?: number) {
            vm._gra.drawMovePlot("l", x, y, pen);
        },
        end: function end() {
            vm.frame();
            return ""; //"end";
        },

        escapeText(str: string, isGraphics?: boolean): string {
            if (vm._isTerminal && !isGraphics) { // for node.js we do not need to escape non-graphics text
                return str;
            }
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        },

        every: function every(timeout: number, timer: number, fn: () => void) {
            vm.remain(timer);
            vm._timerMap[timer] = setInterval(() => fn(), timeout * 20);
        },

        exp: (num: number) => Math.exp(num),

        fix: (num: number) => Math.trunc(num),

        frame: async () => {
            if (vm._stopRequested) {
                throw new Error("INFO: Program stopped");
            }
            const message = vm.getFlushedTextandGraphics();
            if (message) {
                postMessage({ type: 'frame', message, needCls: vm._needCls });
                vm._needCls = false;
            }
            return new Promise<void>(resolve => setTimeout(() => resolve(), Date.now() % 50));
        },

        getFlushedText: (): string => {
            const output = vm._output;
            vm._output = "";
            return output;
        },

        handleTrailingNewline(str: string) {
            return vm._isTerminal ? str.replace(/\n$/, "") : str;
        },

        getFlushedTextandGraphics: () => {
            const textOutput = vm.handleTrailingNewline(vm.getFlushedText());
            const graphicsOutput = vm.handleTrailingNewline(vm._gra.getFlushedGraphics());
            const outputGraphicsIndex = vm._gra._outputGraphicsIndex;
            const hasGraphics = outputGraphicsIndex >= 0;
            const output = hasGraphics ? textOutput.substring(0, outputGraphicsIndex) + graphicsOutput + textOutput.substring(outputGraphicsIndex) : textOutput;
            return output;
        },

        graphicsPen: (num: number) => vm._gra.graphicsPen(num),

        hex$: function hex$(num: number, pad?: number) {
            return num.toString(16).toUpperCase().padStart(pad || 0, "0");
        },
        ink: function ink(num: number, col: number) {
            vm._gra.ink(num, col);
        },
        inkey$: async function () {
            await vm.frame();
            if (vm._keyCharBufferString.length) {
                const key = vm._keyCharBufferString.charAt(0);
                vm._keyCharBufferString = vm._keyCharBufferString.substring(1);
                return key;
            }
            return "";
        },

        input: async (prompt: string, isNum: boolean): Promise<string | number> => { // TODO: isNum
            const inputPromise = new Promise<string>((resolve) => {
                // Store early: The resolve function to be called later
                vm._inputResolvedFn = resolve;
            });
            await vm.frame();
            // Forward input request to main thread
            postMessage({ type: 'input', prompt });

            const input = await inputPromise;
            if (input === null) {
                throw new Error("INFO: Input canceled");
            } else if (isNum && isNaN(Number(input))) {
                throw new Error("Invalid number input");
            }
            return isNum ? Number(input) : input;
        },

        instr: function instr(str: string, find: string, len: number) {
            return str.indexOf(find, len !== undefined ? len - 1 : len) + 1;
        },

        int: (num: number) => Math.floor(num),

        keyDef(num: number, repeat: number, ...codes: number[]): void {
            if (num === 78 && repeat === 1) {
                postMessage({ type: 'keyDef', codes });
            }
        },
        left$: function left$(str: string, num: number) {
            return str.slice(0, num);
        },

        len: (str: string) => str.length,

        log: (num: number) => Math.log(num),

        log10: (num: number) => Math.log10(num),

        lower$: (str: string) => str.toLowerCase(),

        max: Math.max,

        mid$: function mid$(str: string, pos: number, len?: number) {
            return str.substr(pos - 1, len);
        },
        mid$Assign: function mid$Assign(s: string, start: number, newString: string, len?: number) {
            start -= 1;
            len = Math.min(len ?? newString.length, newString.length, s.length - start);
            return s.substring(0, start) + newString.substring(0, len) + s.substring(start + len);
        },

        min: Math.min,

        mode: function mode(num: number) {
            vm._gra.mode(num);
            vm.cls();
        },
        move: function move(x: number, y: number, pen?: number) {
            vm._gra.drawMovePlot("M", x, y, pen);
        },
        mover: function mover(x: number, y: number, pen?: number) {
            vm._gra.drawMovePlot("m", x, y, pen);
        },
        origin: function origin(x: number, y: number) {
            vm._gra.origin(x, y);
        },

        // Use a virtual stack to handle paper and pen spans

        paper: (n: number): void => {
            if (n !== vm._paperValue) {
                vm._paperValue = n;
                if (vm._isTerminal) {
                    const backgroundAdd = 10;
                    const ansicolorCode = ansiColorCodes[vm._gra._colorsForPens[n]] + backgroundAdd;
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
                vm._output += `<span style="background-color: ${cpcColors[vm._gra._colorsForPens[n]]}">`;

                // If pen was open before, reopen it inside
                if (vm._penValue >= 0 && vm._penSpanPos === -1) {
                    vm._penSpanPos = vm._paperSpanPos + 1;
                    vm._output += `<span style="color: ${cpcColors[vm._gra._colorsForPens[vm._penValue]]}">`;
                }
            }
        },

        pen(n: number): void {
            if (n !== vm._penValue) {
                vm._penValue = n;
                if (vm._isTerminal) {
                    const ansicolorCode = ansiColorCodes[vm._gra._colorsForPens[n]];
                    vm._output += `\x1b[${ansicolorCode}m`;
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
                vm._output += `<span style="color: ${cpcColors[vm._gra._colorsForPens[n]]}">`;

                // If paper was open before, reopen it inside
                if (vm._paperValue >= 0 && vm._paperSpanPos === -1) {
                    vm._paperSpanPos = vm._penSpanPos + 1;
                    vm._output += `<span style="background-color: ${cpcColors[vm._gra._colorsForPens[vm._paperValue]]}">`;
                }
            }
        },

        pi: Math.PI,

        plot: function plot(x: number, y: number, pen?: number) {
            vm._gra.drawMovePlot("P", x, y, pen);
        },
        plotr: function plotr(x: number, y: number, pen?: number) {
            vm._gra.drawMovePlot("p", x, y, pen);
        },
        pos: function pos() {
            return vm._pos + 1;
        },

        print: (...args: (string | number)[]) => {
            const formatNumber = (arg: number) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
            const text = args.map((arg) => (typeof arg === "number") ? formatNumber(arg) : arg).join("");
            if (vm._tag) {
                return vm._gra.printGraphicsText(vm.escapeText(text, true));
            }
            vm.printText(text);
        },

        // printTab: print with commaOp or tabOp
        // For graphics output the text position does not change, so we can output all at once.
        printTab: function printTab(...args: (string | number)[]) {
            const formatNumber = (arg: number) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
            const strArgs = args.map((arg) => (typeof arg === "number") ? formatNumber(arg) : arg);
            const formatCommaOrTab = (str: string) => {
                if (str === CommaOpChar) {
                    return " ".repeat(vm._zone - (vm._pos % vm._zone));
                } else if (str.charAt(0) === TabOpChar) {
                    const tabSize = Number(str.substring(1));
                    return " ".repeat(tabSize - 1 - vm._pos);
                }
                return str;
            };
            if (vm._tag) {
                return vm._gra.printGraphicsText(vm.escapeText(strArgs.map(arg => formatCommaOrTab(arg)).join(""), true));
            }
            for (const str of strArgs) {
                vm.printText(formatCommaOrTab(str));
            }
        },
        printText: function printText(text: string) {
            vm._output += vm.escapeText(text);
            const lines = text.split("\n");
            if (lines.length > 1) {
                vm._vpos += lines.length - 1;
                vm._pos = lines[lines.length - 1].length;
            } else {
                vm._pos += text.length;
            }
        },
        read: function read() {
            if (vm._dataPtr < vm._data.length) {
                return vm._data[vm._dataPtr++];
            } else {
                throw new Error("4"); // 4: DATA exhausted
            }
        },
        // remain: the return value is not really the remaining time
        remain: function remain(timer: number) {
            const value = vm._timerMap[timer];
            if (value !== undefined) {
                clearTimeout(value);
                delete vm._timerMap[timer];
            }
            return value;
        },
        remainAll: function () {
            for (const timer in vm._timerMap) {
                if (vm._timerMap[timer] !== undefined) {
                    const value = vm._timerMap[timer];
                    clearTimeout(value);
                    delete vm._timerMap[timer];
                }
            }
        },
        restore: function restore(label: string) {
            vm._dataPtr = vm._restoreMap[label];
        },
        right$: function right$(str: string, num: number) {
            return str.substring(str.length - num);
        },

        rnd: Math.random,

        round1: Math.round,

        round: function round(num: number, dec: number) {
            return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        },

        rsxCall: async function (cmd: string, ...args: (string | number)[]) {
            switch (cmd) {
                case "arc":
                    return vm._gra.rsxArc(args); // 9x number, number?
                case "circle":
                    return vm._gra.rsxCircle(args); // 3x number, number?
                case "date":
                    return vm._rsx.rsxDate(args); // string
                case "ellipse":
                    return vm._gra.rsxEllipse(args);
                case "pitch":
                    return vm._rsx.rsxPitch(args); // string
                case "rect":
                    return vm._gra.rsxRect(args); // 4x number, number?
                case "say": {
                    vm._rsx.rsxSay(args);// string
                    return new Promise<void>((resolve) => {
                        vm._waitResolvedFn = resolve;
                    });
                }
                case "time":
                    return vm._rsx.rsxTime(args); // string
                default:
                    throw new Error(`Unknown RSX command: |${cmd.toUpperCase()}`);
            }
        },

        sgn: Math.sign,

        sin: Math.sin,

        space$: (num: number) => " ".repeat(num),

        spc: (num: number) => " ".repeat(num), // same as space$

        sqr: Math.sqrt,

        stop: function stop() {
            vm.frame();
            return ""; //"stop";
        },
        str$: function str$(num: number) {
            return num >= 0 ? ` ${num}` : String(num);
        },

        string$Num: (len: number, num: number) => {
            return String.fromCharCode(num).repeat(len);
        },

        string$Str: (len: number, str: string) => {
            return str.repeat(len);
        },

        tag: () => vm._tag = true,

        tagoff: () => vm._tag = false,

        tan: Math.tan,

        time: function time() {
            return ((Date.now() - vm._startTime) * 3 / 10) | 0;
        },

        toDeg: (num: number) => num * 180 / Math.PI,

        toRad: (num: number) => num * Math.PI / 180,

        using: (format: string, ...args: number[]) => {
            return args.map((arg) => vm.dec$(arg, format)).join('');
        },

        unt: (num: number) => num,

        upper$: (str: string) => str.toUpperCase(),

        val1: (str: string) => Number(str),

        val: function val(str: string) {
            return Number(str.replace("&x", "0b").replace("&", "0x"));
        },
        vpos: function vpos() {
            return vm._vpos + 1;
        },
        write: function write(...args: (string | number)[]) {
            const text = args.map((arg) => (typeof arg === "string") ? `"${arg}"` : `${arg}`).join(",") + "\n";
            if (vm._tag) {
                return vm._gra.printGraphicsText(vm.escapeText(text, true));
            }
            vm.printText(text);
        },
        xpos: () => vm._gra.xpos(),

        ypos: () => vm._gra.ypos(),

        zone: function zone(num: number) {
            vm._zone = num;
        },
    };

    // Get the error event with line number from an synchronous, uncatched error.
    // It does not work for async functions with "unhandledrejection" event.
    const errorEventHandler = (errorEvent: ErrorEvent) => {
        errorEvent.preventDefault();
        const { lineno, colno, message } = errorEvent;
        const plainErrorEventObj = { lineno, colno, message };
        const result = JSON.stringify(plainErrorEventObj);
        vm.remainAll();
        postMessage({ type: 'result', result });
    };

    // this function must not be async to generate synchronous error
    const onMessageHandler = (data: MessageToWorker) => {
        switch (data.type) {
            case 'config':
                vm._isTerminal = data.isTerminal;
                break;
            case 'continue':
                if (vm._waitResolvedFn) {
                    vm._waitResolvedFn();
                    vm._waitResolvedFn = null;
                }
                break;

            case 'input':
                // resolve waiting input
                if (vm._inputResolvedFn) {
                    vm._inputResolvedFn(data.prompt);
                    vm._inputResolvedFn = null;
                }
                break;

            case 'putKeys':
                vm._keyCharBufferString += data.keys;
                break;

            case 'run': {
                vm.resetAll();

                if (!parentPort) { // not for node.js
                    self.addEventListener("error", errorEventHandler, { once: true });
                }
                const fnScript = new Function("_o", `"use strict"; return (async () => { ${data.code} })();`); // compile
                if (!parentPort) {
                    self.removeEventListener("error", errorEventHandler);
                }

                fnScript(vm).then((result: string | undefined) => {
                    vm.remainAll();
                    const message = vm.getFlushedTextandGraphics();
                    if (message) {
                        postMessage({ type: 'frame', message, needCls: vm._needCls });
                    }
                    result = result ?? "";
                    postMessage({ type: 'result', result });
                }).catch((err: unknown) => {
                    vm.remainAll();
                    console.warn(err instanceof Error ? err.stack : String(err));
                    const result = String(err);
                    const message = vm.getFlushedTextandGraphics();
                    if (message) {
                        postMessage({ type: 'frame', message, needCls: vm._needCls });
                    }
                    postMessage({ type: 'result', result });
                });
                break;
            }

            case 'stop':
                vm._stopRequested = true;
                break;

            default:
                // Unknown message type
                break;
        }
    };

    if (parentPort) {
        parentPort.on('message', onMessageHandler);
    } else {
        self.onmessage = (event) => {
            const data = event.data as MessageToWorker;
            onMessageHandler(data);
        };
    }
    return vm; // for testing
};

if (typeof require !== "undefined") { // node.js?
    (function callWithParentPort() {
        const { parentPort } = require('worker_threads') as NodeWorkerThreads;
        if (parentPort) { // is null in test environment
            workerFn(parentPort);
        }
    })();
}
