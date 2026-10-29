import { describe, expect, it } from "vitest";
import { Core } from "../src/Core";
import type { ConfigType } from "../src/Interfaces";

function createCore(syntax: ConfigType["syntax"]) {
    return new Core({
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
    });
}

describe("Core syntax target", () => {
    const source = `10 IF X > 5 THEN
20 PRINT "X is greater than 5"
30 ENDIF`;

    it("keeps LocoBasic as the default syntax target", () => {
        const result = createCore("loco20").compileScript(source);

        expect(result.compiledScript).toContain("if (");
        expect(result.messages).toEqual([]);
    });

    it("reports multi-line IF as invalid Locomotive BASIC syntax", () => {
        const result = createCore("loco11").compileScript(source);
        const message = result.messages.join("\n");

        expect(result.compiledScript).toContain("if (");
        expect(message).toContain("Not valid Loco BASIC 1.1 syntax: multi-line IF");
        expect(message).toContain("Line 1, col");
    });

    it("does not report syntax shared with Locomotive BASIC", () => {
        const result = createCore("loco11").compileScript(`PRINT LOWER$("ABC");MAX(1,2);MIN(3,4)
FRAME`);

        expect(result.compiledScript).not.toContain("ERROR:");
        expect(result.messages).toEqual([]);
    });
});
