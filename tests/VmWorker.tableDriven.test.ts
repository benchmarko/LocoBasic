import { describe, expect, it } from "vitest";
import { workerFn } from "../src/vm/VmWorker";
import type { MessageFromWorker, MessageToWorker } from "../src/Interfaces";

function getMockParentPort() {
    const parentPort = {
        _testMessage: {} as MessageFromWorker,
        _messages: [] as MessageFromWorker[],
        _messageHandler: {} as (data: MessageToWorker) => void,
        postMessage: (message: MessageFromWorker) => {
            parentPort._testMessage = message;
            parentPort._messages.push(message);
        },
        on: (_event: string, messageHandler: (data: MessageToWorker) => void) => {
            parentPort._messageHandler = messageHandler;
        }
    };
    return parentPort;
}

describe("VmWorker table-driven helpers", () => {
    it("math helpers", () => {
        const vm = workerFn(getMockParentPort());
        const cases = [
            { fn: "abs", args: [-7], expected: 7 },
            { fn: "sgn", args: [-4], expected: -1 },
            { fn: "sgn", args: [0], expected: 0 },
            { fn: "sgn", args: [3], expected: 1 },
            { fn: "int", args: [-1.2], expected: -2 },
            { fn: "fix", args: [-1.8], expected: -1 },
            { fn: "cint", args: [1.6], expected: 2 },
            { fn: "round", args: [3.14159, 2], expected: 3.14 },
            { fn: "toRad", args: [180], expected: Math.PI },
            { fn: "toDeg", args: [Math.PI], expected: 180 }
        ] as const;

        for (const c of cases) {
            const result = vm[c.fn](...c.args) as number;
            expect(result).toBeCloseTo(c.expected, 10);
        }
    });

    it("string conversion helpers", () => {
        const vm = workerFn(getMockParentPort());
        const cases = [
            { fn: "asc", args: ["A"], expected: 65 },
            { fn: "chr$", args: [65], expected: "A" },
            { fn: "left$", args: ["abcdef", 3], expected: "abc" },
            { fn: "right$", args: ["abcdef", 2], expected: "ef" },
            { fn: "mid$", args: ["abcdef", 2, 3], expected: "bcd" },
            { fn: "upper$", args: ["AbC"], expected: "ABC" },
            { fn: "lower$", args: ["AbC"], expected: "abc" },
            { fn: "space$", args: [3], expected: "   " },
            { fn: "spc", args: [2], expected: "  " },
            { fn: "string$Num", args: [3, 65], expected: "AAA" },
            { fn: "string$Str", args: [2, "xy"], expected: "xyxy" }
        ] as const;

        for (const c of cases) {
            const result = vm[c.fn](...c.args);
            expect(result).toBe(c.expected);
        }
    });

    it("number formatting helpers", () => {
        const vm = workerFn(getMockParentPort());
        const cases = [
            { fn: "bin$", args: [5, 4], expected: "0101" },
            { fn: "hex$", args: [255, 4], expected: "00FF" },
            { fn: "str$", args: [5], expected: " 5" },
            { fn: "str$", args: [-3], expected: "-3" },
            { fn: "dec$", args: [12.34, "000.00"], expected: " 12.34" },
            { fn: "val", args: ["42"], expected: 42 },
            { fn: "val", args: ["&x101"], expected: 5 },
            { fn: "val", args: ["&2A"], expected: 42 },
            { fn: "val1", args: ["12.5"], expected: 12.5 }
        ] as const;

        for (const c of cases) {
            const result = vm[c.fn](...c.args);
            expect(result).toBe(c.expected);
        }
    });

    it("read throws when data is exhausted", () => {
        const vm = workerFn(getMockParentPort());
        vm._data = [1];
        expect(vm.read()).toBe(1);
        expect(() => vm.read()).toThrow("4");
    });
});