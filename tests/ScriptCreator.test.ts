import { describe, expect, it, vi } from "vitest";
import { ScriptCreator } from "../src/ScriptCreator";
import type { NodeWorkerFnType } from "../src/Interfaces";

const createVmFunction = <T>(content: string) => new Function("vm", content) as unknown as (() => T);

describe("ScriptCreator", () => {
    it("createStandaloneScript includes transitive deps and required hooks", () => {
        const scriptCreator = new ScriptCreator(0);
        const workerFn: NodeWorkerFnType = {
            workerFn: () => ({
                helper: createVmFunction<unknown>("return vm.flush();"),
                used: createVmFunction<unknown>("return vm.helper();"),
                unused: () => "drop me",
                flush: () => undefined,
                onMessageHandler: () => undefined
            })
        };

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
        const workerFn: NodeWorkerFnType = {
            workerFn: () => ({
                existing: () => undefined,
                flush: () => undefined,
                onMessageHandler: () => undefined
            })
        };

        try {
            scriptCreator.createStandaloneScript(workerFn, "return 0;", ["missing"]);

            expect(warnSpy).toHaveBeenCalledWith("Warning: Function 'missing' does not exist in vm object");
        } finally {
            warnSpy.mockRestore();
        }
    });

    it("createStandaloneScript serializes required values/functions and prunes unused ones", () => {
        const scriptCreator = new ScriptCreator(0);
        const workerFn: NodeWorkerFnType = {
            workerFn: () => ({
                count: 3,
                text: "abc",
                run: createVmFunction<number>("return vm.count;"),
                flush: () => undefined,
                onMessageHandler: () => undefined
            })
        };

        /*
        const test1 = workerFn.workerFn({
            on: () => undefined,
            postMessage: () => undefined,
        });
        expect(test1.count).toBe(3);
        */

        const script = scriptCreator.createStandaloneScript(workerFn, "return 1;", ["run"]);

        expect(script).toContain("count: 3");
        expect(script).toContain("run: function anonymous");
        expect(script).not.toContain('text: "abc"');
    });

    it("createStandaloneScript excludes cls private underscore dependencies (special)", () => {
        const scriptCreator = new ScriptCreator(0);
        const workerFn: NodeWorkerFnType = {
            workerFn: () => ({
                _hidden: 1,
                helper: () => "ok",
                cls: createVmFunction<string>("vm._hidden; return vm.helper();"),
                flush: () => undefined,
                onMessageHandler: () => undefined
            })
        };

        const script = scriptCreator.createStandaloneScript(workerFn, "return 0;", ["cls"]);

        expect(script).toContain("helper:");
        expect(script).toContain("cls:");
        expect(script).toContain("flush:");
        expect(script).toContain("onMessageHandler:");
        expect(script).not.toContain("_hidden:");
    });
});
