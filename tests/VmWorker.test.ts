import { describe, it, expect } from 'vitest';
import { workerFn } from "../src/vm/VmWorker";
import { MessageFromWorker, MessageToWorker } from '../src/Interfaces';

function getMockParentPort() {
    const parentPort = {
        _testMessage: {} as MessageFromWorker,
        _messageHandler: {} as (data: MessageToWorker) => void,
        postMessage: (message: MessageFromWorker) => {
            parentPort._testMessage = message
        },
        on: (_event: string, messageHandler: (data: MessageToWorker) => void) => {
            parentPort._messageHandler = messageHandler;
        }
    };
    return parentPort;
}

describe("VmWorker.vm API", () => {
    it("should expose expected methods and properties", () => {
        const vm = workerFn(getMockParentPort());
        expect(vm).toBeTypeOf('object');
        expect(typeof vm.cls).toBe('function');
        expect(typeof vm.paper).toBe('function');
        expect(typeof vm.pen).toBe('function');
        expect(typeof vm.print).toBe('function');
        expect(typeof vm.input).toBe('function');
        expect(typeof vm.frame).toBe('function');
        expect(typeof vm.getFlushedText).toBe('function');
        expect(typeof vm._gra).toBe('object');
        expect(typeof vm._rsx).toBe('object');
    });

    it("should handle paper and pen span logic (browser mode)", () => {
        const vm = workerFn(getMockParentPort());
        vm._isTerminal = false;
        vm.cls();
        vm.paper(1);
        expect(vm._output).toContain('background-color');
        vm.pen(2);
        expect(vm._output).toContain('color');
        // Changing pen again should close and reopen pen span
        const prevOutput = vm._output;
        vm.pen(3);
        expect(vm._output.length).toBeGreaterThan(prevOutput.length);
    });

    it("should handle paper and pen span logic (terminal mode)", () => {
        const vm = workerFn(getMockParentPort());
        vm._isTerminal = true;
        vm.cls();
        vm.paper(1);
        expect(vm._output).toContain('\x1b[');
        vm.pen(2);
        expect(vm._output).toContain('\x1b[');
    });

    it("should print and flush text", () => {
        const vm = workerFn(getMockParentPort());
        vm.cls();
        vm.print('Hello');
        expect(vm._output).toContain('Hello');
        const flushed = vm.getFlushedText();
        expect(flushed).toContain('Hello');
        expect(vm._output).toBe('');
    });
});
// vitest

describe("VmWorker.vm core methods", () => {
    it("cls resets output and state", () => {
        const vm = workerFn(getMockParentPort());
        vm._output = "abc";
        vm._paperValue = 1;
        vm._penValue = 2;
        vm._pos = 5;
        vm.cls();
        expect(vm._output).toBe('');
        expect(vm._paperValue).toBe(-1);
        expect(vm._penValue).toBe(-1);
        expect(vm._pos).toBe(0);
    });

    it("print and printText append and escape output (& and <)", () => {
        const vm = workerFn(getMockParentPort());
        vm.cls();
        vm.print("<b>", 42, -1);
        expect(vm._output).toContain("&lt;b>");
        expect(vm._output).toContain(" 42 ");
        expect(vm._output).toContain("-1 ");
    });

    it("getFlushedText returns and clears output", () => {
        const vm = workerFn(getMockParentPort());
        vm.cls();
        vm.print("abc");
        const flushed = vm.getFlushedText();
        expect(flushed).toContain("abc");
        expect(vm._output).toBe('');
    });

    it("dim and dim1 create correct arrays", () => {
        const vm = workerFn(getMockParentPort());
        const arr1 = vm.dim1(2, 7);
        expect(arr1).toEqual([7,7,7]);
        const numArr = vm.dim([1,2], 3) as number[][];
        expect(Array.isArray(numArr)).toBe(true);
        expect(numArr[0][0]).toBe(3);
        expect(numArr[1][2]).toBe(3);
    });

    it("left$, mid$, mid$Assign, right$ string functions", () => {
        const vm = workerFn(getMockParentPort());
        expect(vm.left$("abcdef", 3)).toBe("abc");
        expect(vm.mid$("abcdef", 2, 3)).toBe("bcd");
        expect(vm.mid$Assign("abcdef", 2, "XYZ", 2)).toBe("aXYdef");
        expect(vm.right$("abcdef", 2)).toBe("ef");
    });

    it("bin$, hex$, dec$, str$ formatting", () => {
        const vm = workerFn(getMockParentPort());
        expect(vm.bin$(5, 4)).toBe("0101");
        expect(vm.hex$(255, 4)).toBe("00FF");
        expect(vm.dec$(12.34, "000.00")).toBe(" 12.34");
        expect(vm.str$(5)).toBe(" 5");
        expect(vm.str$(-3)).toBe("-3");
    });

    it("zone and printTab handle comma/tab logic", () => {
        const vm = workerFn(getMockParentPort());
        vm.cls();
        vm.zone(5);
        vm.printTab("\u2192", "\u21d210", "abc");
        expect(vm._output).toContain("abc");
        expect(vm._output).toMatch(/ +abc/);
    });

    it("ink assigns colors for pens and background", () => {
        const vm = workerFn(getMockParentPort());
        vm.ink(2, 5);
        expect(vm._gra._colorsForPens[2]).toBe(5);
        vm.ink(0, 3);
        expect(vm._gra._backgroundColor).toBeDefined();
    });

    it("tag enables graphics text output", () => {
        const vm = workerFn(getMockParentPort());
        vm.tag();
        vm.print("abc");
        expect(vm._gra._graphicsBuffer.join("")).toContain("abc");
        vm.tagoff();
    });

    it("escapeText escapes HTML", () => {
        const vm = workerFn(getMockParentPort());
        expect(vm.escapeText("<&>")).toBe("&lt;&amp;>");
    });

    it("val parses numbers from string", () => {
        const vm = workerFn(getMockParentPort());
        expect(vm.val("42")).toBe(42);
        expect(vm.val("&x101")).toBe(5);
        expect(vm.val("&2A")).toBe(42);
    });

    it("round rounds numbers", () => {
        const vm = workerFn(getMockParentPort());
        expect(vm.round(3.14159, 2)).toBe(3.14);
    });

    it("restore and read manage data pointer", () => {
        const vm = workerFn(getMockParentPort());
        vm._data = [1,2,3];
        vm._restoreMap["A"] = 1;
        vm.restore("A");
        expect(vm._dataPtr).toBe(1);
        expect(vm.read()).toBe(2);
    });

    it("rsx calls handles known and unknown commands", async () => {
        const vm = workerFn(getMockParentPort());
        expect(vm.rsxDate("")).toBeDefined(); // simple tests
        expect(vm.rsxTime("")).toBeDefined();
        //expect(vm.rsxRect(1,2,3,4,5));
        //await expect(vm.rsxCall("unknown")).rejects.toThrow();
    });

    it("frame", async () => {
        const vm = workerFn(getMockParentPort());
        vm.print("abc");
        await vm.frame();
        expect(typeof vm._needCls).toBe("boolean");
    });

    it("input and inkey$ handle input logic", async () => {
        const mockParentPort = getMockParentPort();
        const vm = workerFn(mockParentPort);
        //let posted: MessageFromWorker | null = null;
        vm._isTerminal = false;
        // Mock postMessage to resolve input
        //(vm as any).postMessage = (msg: MessageFromWorker) => { posted = msg; };

        //vi.useFakeTimers();
        const p = vm.input("Prompt?", false);
        //vi.advanceTimersByTime(50);
        // Simulate input response
        mockParentPort._messageHandler({ type: 'input', prompt: "hello" });

        await expect(p).resolves.toBe("hello");
        expect(mockParentPort._testMessage).toEqual({
            "type": "input",
            "prompt": "Prompt?"
        });

        // andinkey$
        vm._keyCharBufferString = "A";
        await expect(vm.inkey$()).resolves.toBe("A");
    });

    it("print handles _tag graphics mode", () => {
        const vm = workerFn(getMockParentPort());
        vm.tag();
        vm.print("hello");
        expect(vm._gra._graphicsBuffer.join("")).toContain("hello");
        vm.tagoff();
    });

    it("paper and pen handle browser and terminal output", () => {
        const vm = workerFn(getMockParentPort());
        // Browser mode
        vm._isTerminal = false;
        vm.cls();
        vm.paper(2);
        expect(vm._output).toContain("background-color");
        vm.pen(3);
        expect(vm._output).toContain("color");
        // Terminal mode
        vm._isTerminal = true;
        vm.cls();
        vm.paper(1);
        expect(vm._output).toContain('\x1b[');
        vm.pen(2);
        expect(vm._output).toContain('\x1b[');
    });
});