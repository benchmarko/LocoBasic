import { describe, expect, it, vi } from "vitest";
import { ScriptCreator } from "../src/ScriptCreator";
import type { NodeWorkerFnType } from "../src/Interfaces";

const createVmFunction = <T>(content: string, param = "vm") => new Function(param, content) as unknown as (() => T);

// Partial VM doubles: only the members a test needs, plus the hooks ScriptCreator always requires.
const createWorkerFn = (members: Record<string, unknown>) => ({
    workerFn: () => ({
        pi: Math.PI,
        flush: () => undefined,
        onMessageHandler: () => undefined,
        ...members
    })
}) as unknown as NodeWorkerFnType;

describe("ScriptCreator", () => {
    it("createStandaloneScript includes transitive deps and required hooks", () => {
        const scriptCreator = new ScriptCreator(0);
        const workerFn = createWorkerFn({
            helper: createVmFunction<unknown>("return vm.flush();"),
            used: createVmFunction<unknown>("return vm.helper();"),
            unused: () => "drop me"
        });

        const script = scriptCreator.createStandaloneScript(workerFn, "return 42;", ["used"]);

        expect(script).toContain("return 42;");
        expect(script).toContain("used:");
        expect(script).toContain("helper:");
        expect(script).toContain("flush:");
        expect(script).toContain("onMessageHandler:");
        expect(script).not.toContain("unused:");
        expect(script).toContain("globalThis.LocoBasicVm = vm;");
        expect(script).toContain("parentPort.on('message', (data) => vm.onMessageHandler(data));");
        expect(script).toMatch(/\bon\s*\(_event,/);
    });

    it("createStandaloneScript warns for missing used instructions in debug mode", () => {
        const scriptCreator = new ScriptCreator(1);
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const workerFn = createWorkerFn({ existing: () => undefined });

        try {
            scriptCreator.createStandaloneScript(workerFn, "return 0;", ["missing"]);

            expect(warnSpy).toHaveBeenCalledWith("Warning: Function 'missing' does not exist in vm object");
        } finally {
            warnSpy.mockRestore();
        }
    });

    it("createStandaloneScript serializes required values/functions and prunes unused ones", () => {
        const scriptCreator = new ScriptCreator(0);
        const workerFn = createWorkerFn({
            count: 3,
            text: "abc",
            run: createVmFunction<number>("return vm.count;")
        });

        const script = scriptCreator.createStandaloneScript(workerFn, "return 1;", ["run"]);

        expect(script).toContain("count: 3");
        expect(script).toContain("run: function anonymous");
        expect(script).not.toContain('text: "abc"');
    });

    it("createStandaloneScript excludes cls private underscore dependencies", () => {
        const scriptCreator = new ScriptCreator(0);
        const workerFn = createWorkerFn({
            _hidden: 1,
            helper: () => "ok",
            cls: createVmFunction<string>("vm._hidden; return vm.helper();")
        });

        const script = scriptCreator.createStandaloneScript(workerFn, "return 0;", ["cls"]);

        expect(script).toContain("helper:");
        expect(script).toContain("cls:");
        expect(script).toContain("flush:");
        expect(script).toContain("onMessageHandler:");
        expect(script).not.toContain("_hidden:");
    });

    it("createStandaloneScript supports custom regex prefix", () => {
        const scriptCreator = new ScriptCreator(0);
        const workerFn = createWorkerFn({
            helper: () => 1,
            start: createVmFunction<number>("return _o.helper();", "_o"),
            other: () => 2
        });

        const script = scriptCreator.createStandaloneScript(workerFn, "return 0;", ["start"], "_o\\.");

        expect(script).toContain("start:");
        expect(script).toContain("helper:");
        expect(script).not.toContain("other:");
    });
});
