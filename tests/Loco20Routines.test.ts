import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { readFileSync } from "node:fs";
import { Core } from "../src/Core";
import type { ConfigType } from "../src/Interfaces";
import { workerFn } from "../src/vm/VmWorker";

function createCore(syntax: ConfigType["syntax"] = "loco20") {
    const config: ConfigType = {
        action: "compile,run",
        autoCompile: true,
        autoExecute: true,
        databaseDirs: "examples",
        database: "examples",
        debounceCompile: 800,
        debounceExecute: 400,
        debug: 0,
        syntax,
        example: "",
        exampleFilter: "",
        fileName: "",
        input: "",
        standaloneTerminal: false,
        showBasic: true,
        showCompiled: false,
        showOutput: true,
        outputConsole: false
    };
    return new Core(config);
}

describe("Loco 2.0 routines", () => {
    it("returns a function value by assigning to its own name", async () => {
        const result = createCore().compileScript(`FUNCTION pow2(x)
    pow2=x*x
    END FUNCTION
    answer=pow2(3)`);
        expect(result.compiledScript).not.toContain("ERROR:");
        const execution = runInNewContext(`(async () => {${result.compiledScript}; return answer;})()`, { _o: {} }) as Promise<number>;

        expect(result.compiledScript).toContain("async function pow2(x)");
        expect(result.compiledScript).toContain("await pow2(3)");
        expect(result.compiledScript).not.toContain("ERROR:");
        expect(await execution).toBe(9);
    });

    it("uses local variables by default and SHARED for globals", async () => {
        const result = createCore().compileScript(`total=0
    SUB addToTotal(amount)
    SHARED total
    scratch=amount
    total=total+scratch
    END SUB
    CALL addToTotal(4)`);
        expect(result.compiledScript).not.toContain("ERROR:");
        const output: number[] = [];
        const execution = runInNewContext(`(async () => {${result.compiledScript}; return total;})()`, {
            _o: {},
            total: 0
        }) as Promise<number>;

        output.push(await execution);

        expect(result.compiledScript).toContain("let scratch = 0;");
        const subBodyStart = result.compiledScript.indexOf("async function sub_addtototal");
        const subBodyEnd = result.compiledScript.indexOf("\n}", subBodyStart);
        const subBody = result.compiledScript.slice(subBodyStart, subBodyEnd);
        expect(subBody).not.toContain("let total = 0;");
        expect(output).toEqual([4]);
    });

    it("shares an array with bracket syntax", async () => {
        const result = createCore().compileScript(`DIM vec(3)
SUB setvec()
    SHARED vec[]
    vec(0)=1
    vec(1)=2
    vec(2)=3
END SUB
CALL setvec()`);

        expect(result.compiledScript).not.toContain("ERROR:");
        expect(result.messages).toEqual([]);
        const vm = workerFn({ on: () => { }, postMessage: () => { } });
        const execution = runInNewContext(`(async () => {${result.compiledScript}; return vec.slice(0,3);})()`, { _o: vm }) as Promise<number[]>;
        expect(await execution).toEqual([1, 2, 3]);
    });

    it("does not emit globals for names local to multiple routines", async () => {
        const result = createCore().compileScript(`FUNCTION first(x)
    scratch=x+1
    first=scratch
END FUNCTION
FUNCTION second(x)
    scratch=x*2
    second=scratch
END FUNCTION
answer=first(3)+second(5)`);

        expect(result.compiledScript).not.toContain("ERROR:");
        const globalDeclarations = result.compiledScript.slice(0, result.compiledScript.indexOf("async function"));
        expect(globalDeclarations).not.toMatch(/\b(?:scratch|x)\s*=/);
        expect(result.compiledScript.match(/let scratch = 0/g)).toHaveLength(2);
        const execution = runInNewContext(`(async () => {${result.compiledScript}; return answer;})()`, { _o: {} }) as Promise<number>;
        expect(await execution).toBe(14);
    });

    it("shares scalars and numeric and string arrays in one declaration", async () => {
        const result = createCore().compileScript(`DIM vec(1), names$(1)
total=0
SUB fillvec()
    SHARED total, vec[], names$[]
    vec(0)=7
    names$(0)="seven"
    total=vec(0)
END SUB
CALL fillvec()`);

        expect(result.compiledScript).not.toContain("ERROR:");
        expect(result.messages).toEqual([]);
        const vm = workerFn({ on: () => { }, postMessage: () => { } });
        const execution = runInNewContext(`(async () => {${result.compiledScript}; return [total,vec[0],names$[0]];})()`, { _o: vm }) as Promise<(number | string)[]>;
        expect(await execution).toEqual([7, 7, "seven"]);
    });

    it("keeps routine locals independent from same-named globals", async () => {
        const result = createCore().compileScript(`scratch=99
FUNCTION calculate(x)
    scratch=x+1
    calculate=scratch
END FUNCTION
SUB change()
    scratch=20
END SUB
answer=calculate(3)
CALL change()`);

        expect(result.compiledScript).not.toContain("ERROR:");
        const execution = runInNewContext(`(async () => {${result.compiledScript}; return [answer,scratch];})()`, { _o: {} }) as Promise<number[]>;
        expect(await execution).toEqual([4, 99]);
    });

    it("keeps numeric GOSUB locals declared when routines use the same name", async () => {
        const result = createCore().compileScript(`GOSUB 100
END
100 scratch=20
RETURN
SUB calculate()
    scratch=4
END SUB`);

        expect(result.compiledScript).not.toContain("ERROR:");
        const globalDeclarations = result.compiledScript.slice(0, result.compiledScript.indexOf("function _100"));
        expect(globalDeclarations).not.toMatch(/\bscratch\s*=/);
        expect(result.compiledScript.match(/let scratch = 0/g)).toHaveLength(2);
        const vm = workerFn({ on: () => { }, postMessage: () => { } });
        const execution = runInNewContext(`(async () => {${result.compiledScript}})()`, { _o: vm }) as Promise<void>;
        await expect(execution).resolves.toBeUndefined();
    });

    it.each([
        [5, 1], [0, 0], [-5, -1]
    ])("executes nested multi-line IF branches in routines for %s", async (input, expected) => {
        const result = createCore().compileScript(`FUNCTION classify(x)
    IF x>=0 THEN
        IF x>0 THEN
            classify=1
        ELSE
            classify=0
        END IF
    ELSE
        classify=-1
    END IF
END FUNCTION
answer=0
SUB record(x)
    SHARED answer
    IF x<0 THEN
        answer=classify(x)
    ELSE
        IF x=0 THEN
            answer=classify(0)
        ELSE
            answer=classify(x)
        END IF
    END IF
END SUB
CALL record(${input})`);

        expect(result.compiledScript).not.toContain("ERROR:");
        const execution = runInNewContext(`(async () => {${result.compiledScript}; return answer;})()`, { _o: {} }) as Promise<number>;
        expect(await execution).toBe(expected);
    });

    it("compiles the testloco example without warnings", () => {
        let source = "";
        runInNewContext(readFileSync("public/examples/testloco.js", "utf8"), {
            cpcBasic: { addItem: (_key: string, script: string) => { source = script; } }
        });
        expect(source).not.toBe("");
        const result = createCore().compileScript(source.replace(/^\n/, "").replace(/\n$/, ""));
        expect(result.compiledScript).not.toContain("ERROR:");
        expect(result.messages).toEqual([]);
    });

    it("reports BASIC 2 routine syntax in loco11 mode", () => {
        const result = createCore("loco11").compileScript(`FUNCTION pow2(x)
pow2=x*x
END FUNCTION
SUB show(x)
SHARED total
total=pow2(x)
END SUB
CALL show(3)`);
        const messages = result.messages.join("\n");

        expect(messages).toContain("Not valid Loco BASIC 1.1 syntax: FUNCTION");
        expect(messages).toContain("Not valid Loco BASIC 1.1 syntax: SUB");
        expect(messages).toContain("Not valid Loco BASIC 1.1 syntax: SHARED declaration");
        expect(messages).toContain("Not valid Loco BASIC 1.1 syntax: CALL procedure");
    });
});
