// BasicVmNode.ts

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

    constructor() {
        super();
    }

    public fnOnCls() {
        console.clear();
    }

    public fnOnPrint(msg: string) {
        console.log(msg.replace(/\n$/, ""));
    }

    public fnOnPrompt(msg: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
        console.log(msg);
        return "";
    }

    public fnGetPenColor(num: number) {
        return this.penColors[num];
    }

    public fnGetPaperColor(num: number) {
        return this.paperColors[num];
    }
}
