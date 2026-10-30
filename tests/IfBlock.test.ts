import { describe, it, expect } from "vitest";
import { Core } from "../src/Core";
import type { ConfigType } from "../src/Interfaces";

function createCore() {
	const config: ConfigType = {
		action: "compile,run",
		autoCompile: true,
		autoExecute: true,
		databaseDirs: "examples",
		database: "examples",
		debounceCompile: 800,
		debounceExecute: 400,
		debug: 0,
		syntax: "loco20",
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

describe("If Block (multi-line IF..THEN..END IF)", () => {
	it("should parse simple IF..THEN..END IF", () => {
		const input = `10 IF X > 5 THEN
20 PRINT "X is greater than 5"
30 END IF`;

		const result = createCore().compileScript(input).compiledScript;
		expect(result).toContain("if (");
		expect(result).toContain("print");
	});

	it("should parse END IF without line numbers", () => {
		const input = `IF X > 5 THEN
PRINT "X is greater than 5"
END IF`;

		const result = createCore().compileScript(input).compiledScript;
		expect(result).toContain("if (");
		expect(result).toContain("print");
	});

	it("should parse IF..THEN..ELSE..END IF", () => {
		const input = `10 IF X > 5 THEN
20 PRINT "X is greater than 5"
30 ELSE
40 PRINT "X is not greater than 5"
50 END IF`;

		const result = createCore().compileScript(input).compiledScript;
		expect(result).toContain("if (");
		expect(result).toContain("} else {");
	});

	it("should still support single-line IF..THEN..ELSE", () => {
		const input = `10 LET Y = 0 : IF X > 5 THEN PRINT "YES" ELSE PRINT "NO"`;

		const result = createCore().compileScript(input).compiledScript;
		expect(result).toContain("if (");
	});

	it("should handle nested statements in multi-line IF", () => {
		const input = `10 IF X > 5 THEN
20 LET Y = X * 2
30 PRINT Y
40 END IF`;

		const result = createCore().compileScript(input).compiledScript;
		expect(result).toContain("if (");
		expect(result).toContain("y = ");
		expect(result).toContain("print");
	});
});
