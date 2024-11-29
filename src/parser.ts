// parser.ts
// A simple parser for arithmetic expressions using Ohm
//
// Usage:
// node dist/locobasic.js input="?3 + 5 * (2 - 8)"
//
// [ npx ts-node parser.ts "3 + 5 * (2 - 8)" ]

import { Grammar, grammar, Node, Semantics } from "ohm-js";
import { arithmetic } from "./arithmetic";


// https://ohmjs.org/editor/
// https://ohmjs.org/docs/releases/ohm-js-16.0#default-semantic-actions


export type ConfigEntryType = string | number | boolean;

export type ConfigType = Record<string, ConfigEntryType>;

const startConfig: ConfigType = {
	debug: 0,
	fileName: "",
	input: ""
};



const vm = {
	_output: "",
	print: (...args: string[]) => vm._output += args.join(''),
	
	getOutput: () => vm._output,
	setOutput: (str: string) => vm._output = str
}



class Parser {
	private readonly ohmGrammar: Grammar;
	private readonly ohmSemantics: Semantics;

	constructor(grammarString: string, semanticsMap: Record<string, any>) {
		this.ohmGrammar = grammar(grammarString);
		this.ohmSemantics = this.ohmGrammar
			.createSemantics()
			.addOperation<number>("eval", semanticsMap);
	}

	// Function to parse and evaluate an expression
	parseAndEval(input: string) {
		try {
			const matchResult = this.ohmGrammar.match(input);
			if (matchResult.succeeded()) {
				return this.ohmSemantics(matchResult).eval();
			} else {
			//throw new Error("Parsing failed: " + matchResult.message);
			  	return 'ERROR: Parsing failed: ' + matchResult.message; // or .shortMessage
			}
		} catch (error) {
			return 'ERROR: Parsing evaluator failed: ' + (error instanceof Error ? error.message : "unknown");
		}
	}
}

const variables: Record<string, number> = {};

function getVariable(name: string) {
	variables[name] = (variables[name] || 0) + 1;
	return name;
}

function deleteAllVariables() {
	for (const name in variables) { // eslint-disable-line guard-for-in
		delete variables[name];
	}
}


function evalChildren(children: Node[]) {
	return children.map(c => c.eval());
}

// Semantics to evaluate an arithmetic expression
const semantics = {
	Program(lines: Node) {
		const lineList = evalChildren(lines.children);

		const variabeList = Object.keys(variables);
		const varStr = variabeList.length ? "var " + variabeList.join(", ") + ";\n" : "";

		return varStr + lineList.join('\n');
	},

	Line(stmts: Node, comment: Node, _eol: Node) {
		const commentStr = comment.sourceString ? `; //${comment.sourceString.substring(1)}` : "";
		return stmts.eval() + commentStr;
	},

	Statements(stmt: Node, _stmtSep: Node, stmts: Node) {
		//return stmt.eval() + ";" + (stmts.children ? evalChildren(stmts.children).join('; ') + "; " : "");
		return [stmt.eval(), ...evalChildren(stmts.children)].join('; ');
	},

	Assign(ident: Node, _op: Node, e: Node): string {
		const name = ident.sourceString;
		const name2 = getVariable(name);
		const value = e.eval();
		return `${name2} = ${value}`;
	},

	PrintArgs(arg: Node, _printSep: Node, args: Node) {
		return [arg.eval(), ...evalChildren(args.children)].join(', ');
	},
	Print(_printLit: Node, params: Node, semi: Node) {
		const newline = semi.sourceString ? "" : ` + "\\n"`;
		//return `console.log(${params.eval()}${newline})`;
		return `o.print(${params.eval()}${newline})`;
	},

    Comparison(_iflit: Node, condExp: Node, _thenLit: Node, thenStat: Node, elseLit: Node, elseStat: Node) {
        const cond = condExp.eval();
        const thSt = thenStat.eval();

		let result = `if (${cond}) { ${thSt} }`;
		if (elseLit.sourceString) {
			const elseSt = evalChildren(elseStat.children).join('; ');
			result += ` else { ${elseSt} }`;
		}

		return result;
	},

	ForLoop(_forLit: Node, variable: Node, _eqSign: Node, start: Node, _dirLit: Node, end: Node, _stepLit: Node, step: Node) {
        const varExp = variable.eval();
        const startExp = start.eval();
        const endExp = end.eval();
        const stepExp = step.child(0)?.eval() || "1";
		// TODO: if there are variables, it only works at runtime!!

		const stepAsNum = Number(stepExp);
		
		let cmpSt = "";
		if (isNaN(stepAsNum)) {
			cmpSt = `${stepExp} >= 0 ? ${varExp} <= ${endExp} : ${varExp} >= ${endExp}`
		} else {
			cmpSt = stepExp >= 0 ? `${varExp} <= ${endExp}` : `${varExp} >= ${endExp}`;
		}

		const result = `for (${varExp} = ${startExp}; ${cmpSt}; ${varExp} += ${stepExp}) {`;

		return result;
	},

	Next(_nextLit: Node, _variable: Node) {
        //const varExp = variable.eval();
		//console.debug("next: " + varExp);
		return '}';
	},

	Exp(e: Node): number {
		return e.eval();
	},

	XorExp_xor(a: Node, _op: Node, b: Node) {
		return `${a.eval()} ^ ${b.eval()}`;
	},

	OrExp_or(a: Node, _op: Node, b: Node) {
		return `${a.eval()} | ${b.eval()}`;
	},

	AndExp_and(a: Node, _op: Node, b: Node) {
		return `${a.eval()} & ${b.eval()}`;
	},

	NotExp_not(_op: Node, e: Node) {
		return `~(${e.eval()})`;
	},

	CmpExp_eq(a: Node, _op: Node, b: Node) {
		return `${a.eval()} === ${b.eval()} ? -1 : 0`;
	},
	CmpExp_ne(a: Node, _op: Node, b: Node) {
		return `${a.eval()} !== ${b.eval()} ? -1 : 0`;
	},
	CmpExp_lt(a: Node, _op: Node, b: Node) {
		return `${a.eval()} < ${b.eval()} ? -1 : 0`;
	},
	CmpExp_le(a: Node, _op: Node, b: Node) {
		return `${a.eval()} <= ${b.eval()} ? -1 : 0`;
	},
	CmpExp_gt(a: Node, _op: Node, b: Node) {
		return `${a.eval()} > ${b.eval()} ? -1 : 0`;
	},
	CmpExp_ge(a: Node, _op: Node, b: Node) {
		return `${a.eval()} >= ${b.eval()} ? -1 : 0`;
	},

	AddExp_plus(a: Node, _op: Node, b: Node) {
		return `${a.eval()} + ${b.eval()}`;
	},
	AddExp_minus(a: Node, _op: Node, b: Node) {
		return `${a.eval()} - ${b.eval()}`;
	},

	ModExp_mod(a: Node, _op: Node, b: Node) {
		return `${a.eval()} % ${b.eval()}`;
	},

	DivExp_div(a: Node, _op: Node, b: Node) {
		return `(${a.eval()} / ${b.eval()}) | 0`;
	},

	MulExp_times(a: Node, _op: Node, b: Node) {
		return `${a.eval()} * ${b.eval()}`;
	},
	MulExp_divide(a: Node, _op: Node, b: Node) {
		return `${a.eval()} / ${b.eval()}`;
	},

	ExpExp_power(a: Node, _: Node, b: Node) {
		return `Math.pow(${a.eval()}, ${b.eval()})`;
	},

	PriExp_paren(_open: Node, e: Node, _close: Node) {
		return `(${e.eval()})`;
	},
	PriExp_pos(_op: Node, e: Node) {
		return e.eval();
	},
	PriExp_neg(_op: Node, e: Node) {
		return `-${e.eval()}`;
	},

	decimalValue(value: Node) {
        return value.sourceString;
    },

	hexValue(_prefix: Node, value: Node) {
		return `0x${value.sourceString}`;
    },

    binaryValue(_prefix: Node, value: Node) {
        return `0b${value.sourceString}`;
    },

	string(_quote1: Node, e: Node, _quote2: Node) {
		return `"${e.sourceString}"`;
	},

	ident(first: Node, remain: Node) {
		const name = (first.sourceString + remain.sourceString);

		return getVariable(name); // do we need prefix? `v.${id}`;
	},
	variable(e: Node) {
        const name = e.sourceString;
		return getVariable(name);
	},
	emptyLine(comment: Node, _eol: Node) {
		return `//${comment.sourceString.substring(1)}`;
	}
};


const arithmeticParser = new Parser(arithmetic.grammar, semantics);



function compileScript(script: string) {
	//let compiledScript: string;
	deleteAllVariables();
	/*
	try {
		compiledScript = arithmeticParser.parseAndEval(script);
	} catch (error) {
		compiledScript = "ERROR: " + ((error instanceof Error) ? error.message : "unknown"); 
	}
	*/
	const compiledScript = arithmeticParser.parseAndEval(script);
	return compiledScript;
}

function executeScript(compiledScript: string) {
	vm.setOutput("");

	if (compiledScript.startsWith("ERROR")) {
		return "ERROR";
	}

	let output: string;
	try {
		const fnScript = new Function("o", compiledScript); // eslint-disable-line no-new-func
		const result = fnScript(vm) || "";
		output = vm.getOutput() + result;

	} catch (error) {
		output = "ERROR: " + ((error instanceof Error) ? error.message : "unknown"); 
	}
	return output;
}


function onCompiledAreaChange(event: Event) {
	const compiledArea = event.target as HTMLTextAreaElement;
	const outputArea = document.getElementById("outputArea") as HTMLTextAreaElement;

	const compiledScript = compiledArea.value;

	const output = executeScript(compiledScript);

	outputArea.value = output;
}

function onScriptAreaChange(event: Event) {
	const scriptArea = event.target as HTMLTextAreaElement;
	const compiledArea = document.getElementById("compiledArea") as HTMLTextAreaElement;
	//const outputElement = document.getElementById("outputArea") as HTMLTextAreaElement;

	const input = scriptArea.value;

	const compiledScript = compileScript(input);
	compiledArea.value = compiledScript;

	const newEvent = new Event('change');
	compiledArea.dispatchEvent(newEvent);
	/*
	const output = executeScript(compiledScript);
	outputElement.value = output;
	*/
}

/*
function fnEval(code: string) {
	return eval(code); // eslint-disable-line no-eval
}
*/

interface NodeFs {
	//readFile: (name: string, encoding: string, fn: (res: any) => void) => any
	promises: any;
}

let fs: NodeFs;
let modulePath: string;

declare function require(name:string): any;

async function nodeReadFile(name: string): Promise<string> {
	if (!fs) {
		//fnEval('fs = require("fs");'); // to trick TypeScript
		//const fnRequire = new Function("name", `global[name] = require(name);`)
		//fnRequire("fs");
		fs = require("fs");
	}

	if (!module) {
		//fnEval('module = require("module");'); // to trick TypeScript
		//const fnRequire = new Function(name, `global.${name} = require("${name}");`)
		//fnRequire("module");
		module = require("module");

		modulePath = (module as any).path || "";

		if (!modulePath) {
			console.warn("nodeReadFile: Cannot determine module path");
		}
	}
	return fs.promises.readFile(name, "utf8");
}

function fnParseArgs(args: string[], config: ConfigType) {
	for (let i = 0; i < args.length; i += 1) {
		const [name, ...valueParts] = args[i].split("="),
			nameType = typeof config[name];

		let value: ConfigEntryType = valueParts.join("=");
		if (value !== undefined) {
			if (nameType === "boolean") {
				value = (value === "true");
			} else if (nameType === "number") {
				value = Number(value);
			}
			config[name] = value;
		}
	}
	return config;
}

function fnDecodeUri(s: string) {
	let decoded = "";

	try {
		decoded = decodeURIComponent(s.replace(/\+/g, " "));
	} catch	(err) {
		if (err instanceof Error) {
			err.message += ": " + s;
		}
		console.error(err);
	}
	return decoded;
}

// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function fnParseUri(urlQuery: string, config: ConfigType) {
	const rSearch = /([^&=]+)=?([^&]*)/g,
		args: string[] = [];

	let match: RegExpExecArray | null;

	while ((match = rSearch.exec(urlQuery)) !== null) {
		const name = fnDecodeUri(match[1]),
			value = fnDecodeUri(match[2]);

		if (value !== null && config[name]) {
			args.push(name + "=" + value);
		}
	}
	return fnParseArgs(args, config);
}


function start(input: string) {
	if (input !== "") {
		const compiledScript = compileScript(input);
	
		console.log("INFO: Compiled:\n", compiledScript + "\n");

		const output = executeScript(compiledScript);

		console.log(output);
	} else {
		console.log("No input");
	}
}

function main(config: ConfigType) {
	let input = (config.input as string) || "";

	if (config.fileName) {
		const timer = setTimeout(() => {}, 5000);
		(async () => {
			input += await nodeReadFile(config.fileName as string);
			clearTimeout(timer);
			start(input);
		})();
	} else {
		start(input);
	}
}

if (typeof window !== "undefined") {
	window.onload = () => {
		const scriptArea = window.document.getElementById("scriptArea");
		if (scriptArea) {
			scriptArea.addEventListener('change', onScriptAreaChange);
		}

		const compiledArea = window.document.getElementById("compiledArea");
		if (compiledArea) {
			compiledArea.addEventListener('change', onCompiledAreaChange);
		}
		main(fnParseUri(window.location.search.substring(1), startConfig));
	};
} else {
	main(fnParseArgs(global.process.argv.slice(2), startConfig));
}

/*
5 ' examples:
10 ' associativity
15 ? "7 =" 12 xor 5+6 "=" 12 xor (5+6), (12 xor 5)+6
20 ? "3 =" 7 mod 5+1 "=" (7 mod 5)+1, 7 mod (5+1)
30 ? "0 =" 10>5>4 "=" (10>5)>4, 10>(5>4)
40 ? not 1234555
50 ? 12 \ 5
*/
