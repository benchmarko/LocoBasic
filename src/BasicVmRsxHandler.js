export class BasicVmRsxHandler {
    constructor(core) {
        this.pitch = 1;
        this.fnOnSpeak = () => Promise.resolve();
        this.rsxArc = (args) => {
            const [x, y, rx, ry, rotx, long, sweep, endx, endy, fill] = args.map((p) => Math.round(p));
            const strokeAndFillStr = this.getStrokeAndFillStr(fill);
            const svgPathCmd = `M${x} ${399 - y} A${rx} ${ry} ${rotx} ${long} ${sweep} ${endx} ${399 - endy}`;
            this.core.addGraphicsElement(`<path d="${svgPathCmd}"${strokeAndFillStr} />`);
        };
        this.rsxCircle = (args) => {
            const [cx, cy, r, fill] = args.map((p) => Math.round(p));
            const strokeAndFillStr = this.getStrokeAndFillStr(fill);
            this.core.addGraphicsElement(`<circle cx="${cx}" cy="${399 - cy}" r="${r}"${strokeAndFillStr} />`);
        };
        this.rsxDate = async (args) => {
            const date = new Date();
            const dayOfWeek = (date.getDay() + 1) % 7;
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear() % 100;
            const dateStr = `${String(dayOfWeek).padStart(2, '0')} ${String(day).padStart(2, '0')} ${String(month).padStart(2, '0')} ${String(year).padStart(2, '0')}`;
            args[0] = dateStr;
            return Promise.resolve(args);
        };
        this.rsxEllipse = (args) => {
            const [cx, cy, rx, ry, fill] = args.map((p) => Math.round(p));
            const strokeAndFillStr = this.getStrokeAndFillStr(fill);
            this.core.addGraphicsElement(`<ellipse cx="${cx}" cy="${399 - cy}" rx="${rx}" ry="${ry}"${strokeAndFillStr} />`);
        };
        this.rsxRect = (args) => {
            const [x1, y1, x2, y2, fill] = args.map((p) => Math.round(p));
            const x = Math.min(x1, x2);
            const y = Math.max(y1, y2);
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);
            const strokeAndFillStr = this.getStrokeAndFillStr(fill);
            this.core.addGraphicsElement(`<rect x="${x}" y="${399 - y}" width="${width}" height="${height}"${strokeAndFillStr} />`);
        };
        this.rsxPitch = (args) => {
            this.pitch = args[0] / 10;
        };
        this.rsxSay = async (args) => {
            const text = args[0];
            return this.fnOnSpeak(text, this.pitch).then(() => args);
        };
        this.rsxTime = async (args) => {
            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const timeStr = `${String(hours).padStart(2, '0')} ${String(minutes).padStart(2, '0')} ${String(seconds).padStart(2, '0')}`;
            args[0] = timeStr;
            return Promise.resolve(args);
        };
        this.rsxMap = {
            arc: {
                argTypes: ["number", "number", "number", "number", "number", "number", "number", "number", "number", "number?"],
                fn: this.rsxArc
            },
            circle: {
                argTypes: ["number", "number", "number", "number?"],
                fn: this.rsxCircle
            },
            date: {
                argTypes: ["string"],
                fn: this.rsxDate
            },
            ellipse: {
                argTypes: ["number", "number", "number", "number", "number?"],
                fn: this.rsxEllipse
            },
            pitch: {
                argTypes: ["number"],
                fn: this.rsxPitch
            },
            rect: {
                argTypes: ["number", "number", "number", "number", "number?"],
                fn: this.rsxRect
            },
            say: {
                argTypes: ["string"],
                fn: this.rsxSay
            },
            time: {
                argTypes: ["string"],
                fn: this.rsxTime
            }
        };
        this.core = core;
    }
    reset() {
        this.pitch = 1;
    }
    setOnSpeak(fn) {
        this.fnOnSpeak = fn;
    }
    getStrokeAndFillStr(fill) {
        const currGraphicsPen = this.core.getGraphicsPen();
        const strokeStr = currGraphicsPen >= 0 ? ` stroke="${this.core.getRgbColorStringForPen(currGraphicsPen)}"` : "";
        const fillStr = fill >= 0 ? ` fill="${this.core.getRgbColorStringForPen(fill)}"` : "";
        return `${strokeStr}${fillStr}`;
    }
    async rsx(cmd, args) {
        if (!this.rsxMap[cmd]) {
            throw new Error(`Unknown RSX command: |${cmd.toUpperCase()}`);
        }
        const rsxInfo = this.rsxMap[cmd];
        const expectedArgs = rsxInfo.argTypes.length;
        const optionalArgs = rsxInfo.argTypes.filter((type) => type.endsWith("?")).length;
        if (args.length < expectedArgs - optionalArgs) {
            throw new Error(`|${cmd.toUpperCase()}: Wrong number of arguments: ${args.length} < ${expectedArgs - optionalArgs}`);
        }
        if (args.length > expectedArgs) {
            throw new Error(`|${cmd.toUpperCase()}: Wrong number of arguments: ${args.length} > ${expectedArgs}`);
        }
        for (let i = 0; i < args.length; i += 1) {
            const expectedType = rsxInfo.argTypes[i].replace("?", "");
            const arg = args[i];
            if (typeof arg !== expectedType) {
                throw new Error(`|${cmd.toUpperCase()}: Wrong argument type (pos ${i}): ${typeof arg}`);
            }
        }
        const result = rsxInfo.fn(args);
        if (result instanceof Promise) {
            return result;
        }
        else {
            return args;
        }
    }
}
//# sourceMappingURL=BasicVmRsxHandler.js.map