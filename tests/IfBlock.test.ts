import { describe, it, expect } from "vitest";
import { Parser } from "../src/Parser";
import { Semantics } from "../src/Semantics";
import { arithmetic } from "../src/arithmetic";

describe("If Block (multi-line IF..THEN..ENDIF)", () => {
	it("should parse simple IF..THEN..ENDIF", () => {
		const input = `10 IF X > 5 THEN
20 PRINT "X is greater than 5"
30 ENDIF`;

		const semantics = new Semantics();
		const parser = new Parser(arithmetic.basicGrammar, semantics.getSemanticsActionDict());
		const result = parser.parseAndEval(input);
		expect(result).toContain("if (");
		expect(result).toContain("print");
	});

	it("should parse IF..THEN..ELSE..ENDIF", () => {
		const input = `10 IF X > 5 THEN
20 PRINT "X is greater than 5"
30 ELSE
40 PRINT "X is not greater than 5"
50 ENDIF`;

		const semantics = new Semantics();
		const parser = new Parser(arithmetic.basicGrammar, semantics.getSemanticsActionDict());
		const result = parser.parseAndEval(input);
		expect(result).toContain("if (");
		expect(result).toContain("} else {");
	});

	it("should still support single-line IF..THEN..ELSE", () => {
		const input = `10 LET Y = 0 : IF X > 5 THEN PRINT "YES" ELSE PRINT "NO"`;

		const semantics = new Semantics();
		const parser = new Parser(arithmetic.basicGrammar, semantics.getSemanticsActionDict());
		const result = parser.parseAndEval(input);
		expect(result).toContain("if (");
	});

	it("should handle nested statements in multi-line IF", () => {
		const input = `10 IF X > 5 THEN
20 LET Y = X * 2
30 PRINT Y
40 ENDIF`;

		const semantics = new Semantics();
		const parser = new Parser(arithmetic.basicGrammar, semantics.getSemanticsActionDict());
		const result = parser.parseAndEval(input);
		expect(result).toContain("if (");
		expect(result).toContain("y = ");
		expect(result).toContain("print");
	});
});
