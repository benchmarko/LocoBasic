import { IVmRsxApi } from "./Interfaces";

type RsxMapType = Record<string, {
    argTypes: string[];
    fn: (args: (number | string)[]) => Promise<(number | string)[]> | void;
}>;

export class BasicVmRsxHandler {
    private core: IVmRsxApi; // Use the actual type if available (e.g., BasicVmCore)
    private pitch: number = 1;
    private fnOnSpeak: (text: string, pitch: number) => Promise<void> = () => Promise.resolve();

    constructor(core: IVmRsxApi) {
        this.core = core;
    }

    public reset() {
        this.pitch = 1;
    }

    public setOnSpeak(fn: (text: string, pitch: number) => Promise<void>) {
        this.fnOnSpeak = fn;
    }

    private getStrokeAndFillStr(fill: number): string {
        const currGraphicsPen = this.core.getGraphicsPen();
        const strokeStr = currGraphicsPen >= 0 ? ` stroke="${this.core.getRgbColorStringForPen(currGraphicsPen)}"` : "";
        const fillStr = fill >= 0 ? ` fill="${this.core.getRgbColorStringForPen(fill)}"` : "";
        return `${strokeStr}${fillStr}`;
    }

    private rsxArc = (args: (number | string)[]) => {
        const [x, y, rx, ry, rotx, long, sweep, endx, endy, fill] = args.map((p) => Math.round(p as number));
        const strokeAndFillStr = this.getStrokeAndFillStr(fill);
        const svgPathCmd = `M${x} ${399 - y} A${rx} ${ry} ${rotx} ${long} ${sweep} ${endx} ${399 - endy}`;
        this.core.addGraphicsElement(`<path d="${svgPathCmd}"${strokeAndFillStr} />`);
    }

    private rsxCircle = (args: (number | string)[]) => {
        const [cx, cy, r, fill] = args.map((p) => Math.round(p as number));
        const strokeAndFillStr = this.getStrokeAndFillStr(fill);
        this.core.addGraphicsElement(`<circle cx="${cx}" cy="${399 - cy}" r="${r}"${strokeAndFillStr} />`);
    }

    private rsxDate = async (args: (number | string)[]) => {
        const date = new Date();
        const dayOfWeek = (date.getDay() + 1) % 7;
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear() % 100;
        const dateStr = `${String(dayOfWeek).padStart(2, '0')} ${String(day).padStart(2, '0')} ${String(month).padStart(2, '0')} ${String(year).padStart(2, '0')}`;
        args[0] = dateStr;
        return Promise.resolve(args);
    }

    private rsxEllipse = (args: (number | string)[]) => {
        const [cx, cy, rx, ry, fill] = args.map((p) => Math.round(p as number));
        const strokeAndFillStr = this.getStrokeAndFillStr(fill);
        this.core.addGraphicsElement(`<ellipse cx="${cx}" cy="${399 - cy}" rx="${rx}" ry="${ry}"${strokeAndFillStr} />`);
    }

    private rsxRect = (args: (number | string)[]) => {
        const [x1, y1, x2, y2, fill] = args.map((p) => Math.round(p as number));
        const x = Math.min(x1, x2);
        const y = Math.max(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        const strokeAndFillStr = this.getStrokeAndFillStr(fill);
        this.core.addGraphicsElement(`<rect x="${x}" y="${399 - y}" width="${width}" height="${height}"${strokeAndFillStr} />`);
    }

    private rsxPitch = (args: (number | string)[]) => {
        this.pitch = (args[0] as number) / 10;
    }

    private rsxSay = async (args: (number | string)[]) => {
        const text = args[0] as string;
        return this.fnOnSpeak(text, this.pitch).then(() => args);
    }

    private rsxTime = async (args: (number | string)[]) => {
        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const timeStr = `${String(hours).padStart(2, '0')} ${String(minutes).padStart(2, '0')} ${String(seconds).padStart(2, '0')}`;
        args[0] = timeStr;
        return Promise.resolve(args);
    }

    private rsxMap: RsxMapType = {
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

    public async rsx(cmd: string, args: (number | string)[]): Promise<(number | string)[]> {
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
        } else {
            return args;
        }
    }
}
