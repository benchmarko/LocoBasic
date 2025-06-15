import { describe, it, expect } from 'vitest';
import { workerFn } from "../src/vm/VmWorker";

const isNode = true;

describe("VmWorker.vm API", () => {
    it("should expose expected methods and properties", () => {
        const vm = workerFn(isNode);
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
        const vm = workerFn(isNode);
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
        const vm = workerFn(isNode);
        vm._isTerminal = true;
        vm.cls();
        vm.paper(1);
        expect(vm._output).toContain('\x1b[');
        vm.pen(2);
        expect(vm._output).toContain('\x1b[');
    });

    it("should print and flush text", () => {
        const vm = workerFn(isNode);
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
        const vm = workerFn(true);
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
        const vm = workerFn(true);
        vm.cls();
        vm.print("<b>", 42, -1);
        expect(vm._output).toContain("&lt;b>");
        expect(vm._output).toContain(" 42 ");
        expect(vm._output).toContain("-1 ");
    });

    it("getFlushedText returns and clears output", () => {
        const vm = workerFn(true);
        vm.cls();
        vm.print("abc");
        const flushed = vm.getFlushedText();
        expect(flushed).toContain("abc");
        expect(vm._output).toBe('');
    });

    it("dim and dim1 create correct arrays", () => {
        const vm = workerFn(true);
        const arr1 = vm.dim1(2, 7);
        expect(arr1).toEqual([7,7,7]);
        const arr2 = vm.dim([1,2], 3);
        expect(Array.isArray(arr2)).toBe(true);
        expect(arr2[0][0]).toBe(3);
        expect(arr2[1][2]).toBe(3);
    });

    it("left$, mid$, mid$Assign, right$ string functions", () => {
        const vm = workerFn(true);
        expect(vm.left$("abcdef", 3)).toBe("abc");
        expect(vm.mid$("abcdef", 2, 3)).toBe("bcd");
        expect(vm.mid$Assign("abcdef", 2, "XYZ", 2)).toBe("aXYdef");
        expect(vm.right$("abcdef", 2)).toBe("ef");
    });

    it("bin$, hex$, dec$, str$ formatting", () => {
        const vm = workerFn(true);
        expect(vm.bin$(5, 4)).toBe("0101");
        expect(vm.hex$(255, 4)).toBe("00FF");
        expect(vm.dec$(12.34, "000.00")).toBe(" 12.34");
        expect(vm.str$(5)).toBe(" 5");
        expect(vm.str$(-3)).toBe("-3");
    });

    it("zone and printTab handle comma/tab logic", () => {
        const vm = workerFn(true);
        vm.cls();
        vm.zone(5);
        vm.printTab("\u2192", "\u21d210", "abc");
        expect(vm._output).toContain("abc");
        expect(vm._output).toMatch(/ +abc/);
    });

    it("ink assigns colors for pens and background", () => {
        const vm = workerFn(true);
        vm.ink(2, 5);
        expect(vm._gra._colorsForPens[2]).toBe(5);
        vm.ink(0, 3);
        expect(vm._gra._backgroundColor).toBeDefined();
    });

    it("tag enables graphics text output", () => {
        const vm = workerFn(true);
        vm.tag(true);
        vm.print("abc");
        expect(vm._gra._graphicsBuffer.join("")).toContain("abc");
    });

    it("escapeText escapes HTML", () => {
        const vm = workerFn(true);
        expect(vm.escapeText("<&>")).toBe("&lt;&amp;>");
    });

    it("val parses numbers from string", () => {
        const vm = workerFn(true);
        expect(vm.val("42")).toBe(42);
        expect(vm.val("&x101")).toBe(5);
        expect(vm.val("&2A")).toBe(42);
    });

    it("round rounds numbers", () => {
        const vm = workerFn(true);
        expect(vm.round(3.14159, 2)).toBe(3.14);
    });

    it("restore and read manage data pointer", () => {
        const vm = workerFn(true);
        vm._data = [1,2,3];
        vm._restoreMap["A"] = 1;
        vm.restore("A");
        expect(vm._dataPtr).toBe(1);
        expect(vm.read()).toBe(2);
    });

    it("rsxCall handles known and unknown commands", async () => {
        const vm = workerFn(true);
        await expect(vm.rsxCall("date", "")).resolves.toBeDefined();
        await expect(vm.rsxCall("time", "")).resolves.toBeDefined();
        await expect(vm.rsxCall("rect", 1,2,3,4,5)).resolves.toBeUndefined();
        await expect(vm.rsxCall("unknown")).rejects.toThrow();
    });

    it("frame and stop update output and state", async () => {
        const vm = workerFn(true);
        vm.print("abc");
        await vm.frame();
        expect(typeof vm._needCls).toBe("boolean");
        vm.stop();
        expect(vm._stopRequested).toBe(true);
    });

    it("input and inkey$ handle input logic", async () => {
        const vm = workerFn(true);
        let posted: any = null;
        vm._isTerminal = false;
        // Mock postMessage to resolve input
        (vm as any).postMessage = (msg: any) => { posted = msg; };
        const p = vm.input("Prompt?", false);
        // Simulate input response
        vm._inputResolvedFn && vm._inputResolvedFn("hello");
        await expect(p).resolves.toBe("hello");
        vm._keyBuffer = "A";
        await expect(vm.inkey$()).resolves.toBe("A");
    });

    it("print handles _tag graphics mode", () => {
        const vm = workerFn(true);
        vm.tag(true);
        vm.print("hello");
        expect(vm._gra._graphicsBuffer.join("")).toContain("hello");
    });

    it("paper and pen handle browser and terminal output", () => {
        const vm = workerFn(true);
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