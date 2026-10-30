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

function readExampleSource(example: string) {
    let source = "";
    runInNewContext(readFileSync(`public/examples/${example}.js`, "utf8"), {
        cpcBasic: { addItem: (_key: string, script: string) => { source = script; } }
    });
    expect(source).not.toBe("");
    return source.replace(/^\n/, "").replace(/\n$/, "");
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

    it.each(["testloco", "bounce2", "lifegam2", "rectree2"])("compiles the %s example without warnings", (example) => {
        const result = createCore().compileScript(readExampleSource(example));
        expect(result.compiledScript).not.toContain("ERROR:");
        expect(result.messages).toEqual([]);
    });

    it.each([true, false])("preserves bounce drawing and timing with circle RSX enabled: %s", async (hasCircle) => {
        async function runBounce(example: string) {
            let source = readExampleSource(example);
            if (!hasCircle) {
                source = source.replace("lbasic=&8000>0", "lbasic=0").replace("hasCircle=&8000>0", "hasCircle=0");
            }
            const result = createCore().compileScript(source);
            expect(result.compiledScript).not.toContain("ERROR:");
            const commands: (string | number)[][] = [];
            let ticks = 0;
            const vm = workerFn({ on: () => { }, postMessage: () => { } });
            const execution = runInNewContext(`(async () => {${result.compiledScript}})()`, {
                _o: {
                    ...vm,
                    cls: () => { commands.push(["cls"]); },
                    graphicsPen: (pen: number) => { commands.push(["pen", pen]); },
                    rsxCircle: (...args: number[]) => { commands.push(["circle", ...args]); },
                    move: (...args: number[]) => { commands.push(["move", ...args]); },
                    draw: (...args: number[]) => { commands.push(["draw", ...args]); },
                    time: () => ticks,
                    frame: async () => { ticks += 3; }
                }
            }, { timeout: 1000 }) as Promise<void>;
            await execution;
            return { commands, ticks };
        }

        const original = await runBounce("bounce");
        const structured = await runBounce("bounce2");
        expect(structured).toEqual(original);
        expect(structured.commands.filter(command => command[0] === "cls")).toHaveLength(43);
        expect(structured.commands.filter(command => command[0] === (hasCircle ? "circle" : "move"))).toHaveLength(172);
        expect(structured.ticks).toBe(43 * 15);
    });

    it.each([1, 42])("preserves Game of Life generations and timing with random seed %s", async (initialSeed) => {
        async function runLife(example: string) {
            const result = createCore().compileScript(readExampleSource(example));
            expect(result.compiledScript).not.toContain("ERROR:");
            const output: unknown[][] = [];
            let seed = initialSeed;
            let randomCalls = 0;
            let ticks = 0;
            let generations = 0;
            const vm = workerFn({ on: () => { }, postMessage: () => { } });
            const execution = runInNewContext(`(async () => {${result.compiledScript}})()`, {
                _o: Object.assign(vm, {
                    cls: () => { },
                    print: (...args: unknown[]) => {
                        if (args[0] === "L I F E G A M E") {
                            generations += 1;
                        }
                        output.push(args);
                    },
                    rnd: () => {
                        randomCalls += 1;
                        seed = seed * 16807 % 2147483647;
                        return (seed - 1) / 2147483646;
                    },
                    time: () => ticks,
                    frame: async () => { ticks += 200; }
                })
            }, { timeout: 1000 }) as Promise<void>;
            await execution;
            return { output, generations, randomCalls, ticks };
        }

        const original = await runLife("lifegame");
        const structured = await runLife("lifegam2");
        expect(structured).toEqual(original);
        expect(structured.generations).toBe(10);
        expect(structured.randomCalls).toBe(100);
        expect(structured.ticks).toBe(2000);
    });

    it("preserves recursive tree drawing with per-call branch locals", async () => {
        async function runTree(example: string) {
            const result = createCore().compileScript(readExampleSource(example));
            expect(result.compiledScript).not.toContain("ERROR:");
            if (example === "rectree2") {
                const globalDeclarations = result.compiledScript.slice(0, result.compiledScript.indexOf("async function"));
                expect(globalDeclarations).not.toMatch(/\b(?:savedx|savedy|savedheading|depth|length|angle)\s*=/);
                expect(result.compiledScript).toContain("let savedx = 0, savedy = 0, savedheading = 0;");
                expect(result.compiledScript).not.toMatch(/\b(?:xa|ya|wa)\s*=/);
            }
            const commands: (string | number)[][] = [];
            let ticks = 0;
            const vm = workerFn({ on: () => { }, postMessage: () => { } });
            const execution = runInNewContext(`(async () => {${result.compiledScript}})()`, {
                _o: Object.assign(vm, {
                    cls: () => { commands.push(["cls"]); },
                    origin: (...args: number[]) => { commands.push(["origin", ...args]); },
                    move: (...args: number[]) => { commands.push(["move", ...args]); },
                    draw: (...args: number[]) => { commands.push(["draw", ...args]); },
                    time: () => ticks,
                    frame: async () => { ticks += 150; }
                })
            }, { timeout: 1000 }) as Promise<void>;
            await execution;
            return { commands, ticks };
        }

        const original = await runTree("rectree");
        const structured = await runTree("rectree2");
        expect(structured).toEqual(original);
        expect(structured.commands.some(command => command[0] === "draw")).toBe(true);
        expect(structured.ticks).toBeGreaterThan(0);
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
