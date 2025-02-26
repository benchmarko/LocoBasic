import { INodeParts } from "./Interfaces";
import { BasicVmCore } from "./BasicVmCore";

function getAnsiColorsForPens() {
    return [
        "\x1b[34m", // Navy
        "\x1b[93m", // Bright Yellow
        "\x1b[96m", // Bright Cyan
        "\x1b[91m", // Bright Red
        "\x1b[97m", // Bright White
        "\x1b[30m", // Black
        "\x1b[94m", // Bright Blue
        "\x1b[95m", // Bright Magenta
        "\x1b[36m", // Cyan
        "\x1b[33m", // Yellow
        "\x1b[94m", // Pastel Blue (Bright Blue)
        "\x1b[95m", // Pink (Bright Magenta)
        "\x1b[92m", // Bright Green
        "\x1b[92m", // Pastel Green (Bright Green)
        "\x1b[34m", // Navy (repeated)
        "\x1b[95m", // Pink (repeated)
        "\x1b[34m"  // Navy (repeated)
    ];
}

function getAnsiColorsForPapers() {
    return [
        "\x1b[44m", // Navy
        "\x1b[103m", // Bright Yellow
        "\x1b[106m", // Bright Cyan
        "\x1b[101m", // Bright Red
        "\x1b[107m", // Bright White
        "\x1b[40m", // Black
        "\x1b[104m", // Bright Blue
        "\x1b[105m", // Bright Magenta
        "\x1b[46m", // Cyan
        "\x1b[43m", // Yellow
        "\x1b[104m", // Pastel Blue (Bright Blue)
        "\x1b[105m", // Pink (Bright Magenta)
        "\x1b[102m", // Bright Green
        "\x1b[102m", // Pastel Green (Bright Green)
        "\x1b[44m", // Navy (repeated)
        "\x1b[105m", // Pink (repeated)
        "\x1b[44m"  // Navy (repeated)
    ];
}

export class BasicVmNode extends BasicVmCore {
    private readonly penColors: string[] = getAnsiColorsForPens();
    private readonly paperColors: string[] = getAnsiColorsForPapers();
    private readonly nodeParts: INodeParts;

    constructor(nodeParts: INodeParts) {
        super();
        this.nodeParts = nodeParts;
    }

    public fnOnCls(): void {
        console.clear();
    }

    public fnOnPrint(msg: string): void {
        console.log(msg.replace(/\n$/, ""));
    }

    public async fnOnInput(msg: string): Promise<string> {
        console.log(msg);
        return Promise.resolve("");
    }

    public fnGetPenColor(num: number): string {
        if (num < 0 || num >= this.penColors.length) {
            throw new Error("Invalid pen color index");
        }
        return this.penColors[num];
    }

    public fnGetPaperColor(num: number): string {
        if (num < 0 || num >= this.paperColors.length) {
            throw new Error("Invalid paper color index");
        }
        return this.paperColors[num];
    }

    public inkey$(): Promise<string> {
        const key = this.nodeParts.getKeyFromBuffer();
        return Promise.resolve(key);
    }

    public getEscape(): boolean {
        return this.nodeParts.getEscape();
    }
}
