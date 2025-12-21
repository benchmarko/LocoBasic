import { describe, it, expect } from 'vitest';
import { workerFn } from "../src/vm/VmWorker";
import type { MessageFromWorker, MessageToWorker } from '../src/Interfaces';
import { CommaOpChar, TabOpChar } from "../src/Constants";

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
        vm._vpos = 2;
        vm.cls();
        expect(vm._output).toBe('');
        expect(vm._paperValue).toBe(-1);
        expect(vm._penValue).toBe(-1);
        expect(vm.pos()).toBe(1);
        expect(vm.vpos()).toBe(1);
    });

    it("print and printText append and escape output (& and <)", () => {
        const vm = workerFn(getMockParentPort());
        vm.print("<b>", 42, -1);
        expect(vm.pos()).toBe(11);
        expect(vm._output).toBe('&lt;b> 42 -1 ');
    });

    it("getFlushedText returns and clears output", () => {
        const vm = workerFn(getMockParentPort());
        vm.print("abc");
        const flushed = vm.getFlushedText();
        expect(flushed).toBe("abc");
        expect(vm._output).toBe('');
    });

    it("dim and dim1 create correct arrays", () => {
        const vm = workerFn(getMockParentPort());
        const arr1 = vm.dim1(2, 7);
        expect(arr1).toEqual([7, 7, 7]);
        const numArr = vm.dim([1, 2], 3) as number[][];
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
        vm.printTab("a", CommaOpChar, "abc5"); // zone to 5
        expect(vm.getFlushedText()).toBe("a    abc5"); // abc5 at pos 6

        vm.cls();
        vm.printTab("a", TabOpChar + "10", "t10", TabOpChar + "20", "t20"); // tab to 10, then tab to 20
        expect(vm.getFlushedText()).toBe("a        t10       t20"); // t10 at pos 10, t20 at pos 20

        vm.cls();
        vm.printTab("a", TabOpChar + "5", "t5", TabOpChar + "3", "t3"); // tab to 5, then tab to 3 (new line)
        expect(vm.getFlushedText()).toBe("a   t5\n  t3");

        vm.cls();
        vm.printTab("a", TabOpChar + "0", "t0", TabOpChar + "-5", "t-5"); // invalid tab sizes (ignored)
        expect(vm.getFlushedText()).toBe("at0t-5");

        vm.zone(13);
    });

    it("ink assigns colors for pens and background", () => {
        const vm = workerFn(getMockParentPort());
        vm.ink(2, 5);
        expect(vm._graColorsForPens[2]).toBe(5);
        vm.ink(0, 3);
        expect(vm._graBackgroundColor).toBeDefined();
    });

    /*
    it("tag enables graphics text output", () => {
        const vm = workerFn(getMockParentPort());
        vm.tag();
        vm.print("abc");
        expect(vm._graGraphicsBuffer.join("")).toContain("abc"); // <text x="0" y="415" style="white-space: pre">abc</text>
        vm.tagoff();
    });
    */

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
        vm._data = [1, 2, 3];
        vm._restoreMap["A"] = 1;
        vm.restore("A");
        expect(vm._dataPtr).toBe(1);
        expect(vm.read()).toBe(2);
    });

    it("rsx calls", async () => {
        const mockParentPort = getMockParentPort();
        const vm = workerFn(mockParentPort);

        const date = vm.rsxDate("")[0];
        expect(date).toMatch(/^\d{2} \d{2} \d{2} \d{2}$/); // dayOfWeek day month year

        const time = vm.rsxTime("")[0];
        expect(time).toMatch(/^\d{2} \d{2} \d{2}$/); // hh mm ss

        const geolocationPromise = vm.rsxGeolocation("");
        expect(geolocationPromise).toStrictEqual(new Promise(() => undefined));
        expect(mockParentPort._testMessage).toEqual({
            type: 'geolocation'
        });

        vm.rsxSay("test1");
        expect(mockParentPort._testMessage).toEqual({
            type: 'speak',
            message: "test1",
            pitch: 1
        });

        vm.rsxPitch(20);
        expect(vm._rsxPitch).toBe(2);

        vm.rsxSay("test2");
        expect(mockParentPort._testMessage).toEqual({
            type: 'speak',
            message: "test2",
            pitch: 2
        });

        vm.rsxPitch(10);
        expect(vm._rsxPitch).toBe(1);

        //expect(vm.rsxRect(1,2,3,4,5));
        //await expect(vm.rsxCall("unknown")).rejects.toThrow();
    });

    it("frame", async () => {
        const vm = workerFn(getMockParentPort());
        vm.print("abc");
        await vm.frame();
        expect(vm._needCls).toBe(false);
    });

    it("inkey$ handles input logic", async () => {
        const vm = workerFn(getMockParentPort());
        //vm._isTerminal = false;

        vm.onMessageHandler({
            type: "putKeys",
            keys: "A"
        });
        const ch = vm.inkey$();
        await expect(ch).resolves.toBe("A");
    });

    it("input handles input logic", async () => {
        const mockParentPort = getMockParentPort();
        const vm = workerFn(mockParentPort);
        vm._isTerminal = false;
        const arr1 = vm.input("Prompt?", "s");

        // simulate input
        mockParentPort._messageHandler({ type: 'input', input: "hello" });

        await expect(arr1).resolves.toStrictEqual(["hello"]);
        expect(mockParentPort._testMessage).toEqual({
            "type": "input",
            "prompt": "Prompt?"
        });
    });

    it("input handles input logic (multiple parts)", async () => {
        const mockParentPort = getMockParentPort();
        const vm = workerFn(mockParentPort);
        vm._isTerminal = false;
        const arr1 = vm.input("Prompt?", "ssn");

        // Simulate input response
        mockParentPort._messageHandler({ type: 'input', input: "hello, world!,42" });

        await expect(arr1).resolves.toStrictEqual(["hello", " world!", 42]);
    });

    it("line input handles input logic", async () => {
        const mockParentPort = getMockParentPort();
        const vm = workerFn(mockParentPort);
        vm._isTerminal = false;
        const p = vm.lineInput("Prompt?");

        // Simulate input response
        mockParentPort._messageHandler({ type: 'input', input: "hello, world!" });

        await expect(p).resolves.toBe("hello, world!");
    });

    it("printTag handles graphics mode", () => {
        const vm = workerFn(getMockParentPort());
        vm.printTag("hello");
        expect(vm._graGraphicsBuffer.join("")).toContain("hello");
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

    it("pos", () => {
        const vm = workerFn(getMockParentPort());
        expect(vm.pos()).toBe(1);

        vm.print("hello");
        expect(vm.pos()).toBe(6);

        vm.print(" ".repeat(80));
        expect(vm.pos()).toBe(86); // no line wrap

        vm.print("\n");
        expect(vm.pos()).toBe(1);
    });
});