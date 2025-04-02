import type { ActionDict, Node } from "ohm-js";
import type { IVm, DefinedLabelEntryType, GosubLabelEntryType, ISemanticsHelper } from "./Interfaces";

type RecursiveArray<T> = T | RecursiveArray<T>[];

function getCodeSnippets() {
    const _o = {} as IVm;
    const _data: (string | number)[] = [];
    let _dataPtr = 0;
    const _restoreMap: Record<string, number> = {};
	const _startTime = 0;
	const frame = async () => {}; // dummy

    const codeSnippets = {
		bin$: function bin$(num: number, pad: number = 0): string {
            return num.toString(2).toUpperCase().padStart(pad, "0");
        },
        cls: function cls() {
            _o.cls();
        },
        dec$: function dec$(num: number, format: string) {
            const decimals = (format.split(".")[1] || "").length;
            const str = num.toFixed(decimals);
            const pad = " ".repeat(Math.max(0, format.length - str.length));
            return pad + str;
        },
        dim: function dim(dims: number[], initVal: string | number = 0) {
            const createRecursiveArray = (depth: number): RecursiveArray<string | number> => {
                const length = dims[depth] + 1; // +1 because of 0-based index
                const array = Array.from({ length }, () =>
                    depth + 1 < dims.length ? createRecursiveArray(depth + 1) : initVal
                );
                return array;
            };
            return createRecursiveArray(0);
        },
        draw: function draw(x: number, y: number) {
            _o.drawMovePlot("L", x, y);
        },
        drawr: function drawr(x: number, y: number) {
            _o.drawMovePlot("l", x, y);
        },
        end: function end() {
            _o.flush();
            return "end";
        },
        frame: async function frame() {
            _o.flush();
			if (_o.getEscape()) {
				throw new Error("INFO: Program stopped");
			}
            return new Promise<void>(resolve => setTimeout(() => resolve(), Date.now() % 50));
        },
        graphicsPen: function graphicsPen(num: number) {
            _o.graphicsPen(num);
        },
        hex$: function hex$(num: number, pad?: number) {
            return num.toString(16).toUpperCase().padStart(pad || 0, "0");
        },
		ink: function ink(num: number, col: number) {
			_o.ink(num, col);
		},
		inkey$: async function inkey$() {
            await frame();
			return await _o.inkey$();
        },
        input: async function input(msg: string, isNum: boolean) {
			await frame();
			const input = await _o.input(msg);
			if (input === null) {
				throw new Error("INFO: Input canceled");
			} else if (isNum && isNaN(Number(input))) {
				throw new Error("Invalid number input");
			} else {
				return isNum ? Number(input) : input;
			}
		},
        mid$Assign: function mid$Assign(s: string, start: number, newString: string, len?: number) {
            start -= 1;
            len = Math.min(len ?? newString.length, newString.length, s.length - start);
            return s.substring(0, start) + newString.substring(0, len) + s.substring(start + len);
        },
        mode: function mode(num: number) {
            _o.mode(num);
        },
        move: function move(x: number, y: number) {
            _o.drawMovePlot("M", x, y);
        },
        mover: function mover(x: number, y: number) {
            _o.drawMovePlot("m", x, y);
        },
		origin: function origin(x: number, y: number) {
            _o.origin(x, y);
        },
        paper: function paper(n: number) {
            _o.paper(n);
        },
        pen: function pen(n: number) {
            _o.pen(n);
        },
        plot: function plot(x: number, y: number) {
            _o.drawMovePlot("P", x, y);
        },
        plotr: function plotr(x: number, y: number) {
            _o.drawMovePlot("p", x, y);
        },
        print: function print(...args: (string | number)[]) {
            const _printNumber = (arg: number) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
            const output = args.map((arg) => (typeof arg === "number") ? _printNumber(arg) : arg).join("");
            _o.print(output);
        },
        read: function read() {
            return _data[_dataPtr++];
        },
        restore: function restore(label: string) {
            _dataPtr = _restoreMap[label];
        },
        round: function round(num: number, dec: number) {
            return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        },
		rsx: function rsx(cmd: string, ...args: (string | number)[]) {
            _o.rsx(cmd, args);
        },
        stop: function stop() {
            _o.flush();
            return "stop";
        },
        str$: function str$(num: number) {
            return num >= 0 ? ` ${num}` : String(num);
        },
		tag: function tag(active: boolean) {
            _o.tag(active);
        },
        time: function time() {
            return ((Date.now() - _startTime) * 3 / 10) | 0;
        },
        val: function val(str: string) {
            return Number(str.replace("&x", "0b").replace("&", "0x"));
        },
		xpos: function xpos() {
            return _o.xpos();
        },
		ypos: function ypos() {
            return _o.ypos();
        }
    };
    return codeSnippets;
}

function trimIndent(code: string): string {
    const lines = code.split("\n");
    const lastLine = lines[lines.length - 1];

    const match = lastLine.match(/^(\s+)}$/);
    if (match) {
        const indent = match[1];
        const trimmedLines = lines.map((line) => line.startsWith(indent) ? line.slice(indent.length) : line);
        return trimmedLines.join("\n");
    }
    return code;
}

function evalChildren(children: Node[]): string[] {
    return children.map(child => child.eval());
}

function createComparisonExpression(a: Node, op: string, b: Node): string {
	return `-(${a.eval()} ${op} ${b.eval()})`;
}

function getSemantics(semanticsHelper: ISemanticsHelper): ActionDict<string> {
    const drawMovePlot = (lit: Node, x: Node, _comma1: Node, y: Node, _comma2: Node, e3: Node) => {
        const command = lit.sourceString.toLowerCase();
        semanticsHelper.addInstr(command);
        const pen = e3.child(0)?.eval();
        let penStr = "";
        if (pen !== undefined) {
            semanticsHelper.addInstr("graphicsPen");
            penStr = `graphicsPen(${pen}); `;
        }
        return penStr + `${command}(${x.eval()}, ${y.eval()})`;
    };

    const cosSinTan = (lit: Node, _open: Node, e: Node, _close: Node) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        const func = lit.sourceString.toLowerCase();
        return semanticsHelper.getDeg() ? `Math.${func}((${e.eval()}) * Math.PI / 180)` : `Math.${func}(${e.eval()})`;
    }

    // Semantics to evaluate an arithmetic expression
    const semantics: ActionDict<string> = {
        Program(lines: Node) {
            const lineList = evalChildren(lines.children);

            const variableList = semanticsHelper.getVariables();
            const variableDeclarations = variableList.length ? "let " + variableList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";" : "";

            // find subroutines
            const definedLabels = semanticsHelper.getDefinedLabels();
            const gosubLabels = semanticsHelper.getGosubLabels();
            const restoreMap = semanticsHelper.getRestoreMap();

            const awaitLabels: string[] = [];
            let subroutineStart: DefinedLabelEntryType | undefined;
            for (const label of definedLabels) {
                if (gosubLabels[label.label]) {
                    subroutineStart = label;
                }

                if (subroutineStart && label.last >= 0) {
                    const first = subroutineStart.first;
                    const indent = lineList[first].search(/\S|$/);
                    const indentStr = " ".repeat(indent);

                    let hasAwait = false;
                    for (let i = first; i <= label.last; i += 1) {
                        if (lineList[i].includes("await ")) {
                            hasAwait = true; // quick check
                        }
                        lineList[i] = "  " + lineList[i]; // indent
                    }

                    const asyncStr = hasAwait ? "async " : "";
                    lineList[first] = `${indentStr}${asyncStr}function _${subroutineStart.label}() {${indentStr}\n` + lineList[first];
                    lineList[label.last] += `\n${indentStr}}`;
                    if (hasAwait) {
                        awaitLabels.push(subroutineStart.label);
                    }
                    subroutineStart = undefined;
                }

                if (restoreMap[label.label] === -1) {
                    restoreMap[label.label] = label.dataIndex;
                }
            }

            const dataList = semanticsHelper.getDataList();
            if (dataList.length) {
                for (const key of Object.keys(restoreMap)) {
                    let index = restoreMap[key];
                    if (index < 0) {
                        index = 0;
                        restoreMap[key] = index;
                    }
                }
                lineList.unshift(`const {_data, _restoreMap} = _defineData();\nlet _dataPtr = 0;`);
                lineList.push(`function _defineData() {\n  const _data = [\n${dataList.join(",\n")}\n  ];\n  const _restoreMap = ${JSON.stringify(restoreMap)};\n  return {_data, _restoreMap};\n}`);
            }

            lineList.push("// library");

            const instrMap = semanticsHelper.getInstrMap();
            const codeSnippets = getCodeSnippets();

            let needsAsync = false;
			let needsStartTime = false;
            for (const key of Object.keys(codeSnippets)) {
                if (instrMap[key]) {
					const code = String((codeSnippets[key as keyof typeof codeSnippets]).toString());
                    const adaptedCode = trimIndent(code);
					lineList.push(adaptedCode);
                    if (adaptedCode.startsWith("async ")) {
                        needsAsync = true;
                    }
					if (adaptedCode.includes("_startTime")) {
						needsStartTime = true;
					}
                }
            }

            if (variableDeclarations) {
                lineList.unshift(variableDeclarations);
            }

			if (needsStartTime) {
				lineList.unshift(`const _startTime = Date.now();`);
			}

            if (needsAsync) {
                lineList.unshift(`return async function() {`);
                lineList.push('}();');
            }

            lineList.unshift(`"use strict"`);

            let lineStr = lineList.filter((line) => line.trimEnd() !== "").join('\n');
            if (awaitLabels.length) {
                for (const label of awaitLabels) {
                    const regEx = new RegExp(`_${label}\\(\\);`, "g");
                    lineStr = lineStr.replace(regEx, `await _${label}();`);
                }
            }
            return lineStr;
        },

        Line(label: Node, stmts: Node, comment: Node, _eol: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            const labelString = label.sourceString;

            const currentLineIndex = semanticsHelper.incrementLineIndex() - 1;

            if (labelString) {
                semanticsHelper.addDefinedLabel(labelString, currentLineIndex);
            }

            const lineStr = stmts.eval();

            if (lineStr === "return") {
                const definedLabels = semanticsHelper.getDefinedLabels();
                if (definedLabels.length) {
                    const lastLabelItem = definedLabels[definedLabels.length - 1];
                    lastLabelItem.last = currentLineIndex;
                }
            }

            const commentStr = comment.sourceString ? `; //${comment.sourceString.substring(1)}` : "";
            const semi = lineStr === "" || lineStr.endsWith("{") || lineStr.endsWith("}") || lineStr.startsWith("//") || commentStr ? "" : ";";

            const indentStr = semanticsHelper.getIndentStr();
            semanticsHelper.applyNextIndent();

            return indentStr + lineStr + commentStr + semi;
        },

        Statements(stmt: Node, _stmtSep: Node, stmts: Node) {
            // separate statements, use ";", if the last stmt does not end with "{"
            const statements = [stmt.eval(), ...evalChildren(stmts.children)];
            return statements.reduce((acc, current) => acc.endsWith("{") ? `${acc} ${current}` : `${acc}; ${current}`);
        },

        ArrayAssign(ident: Node, _op: Node, e: Node): string {
            return `${ident.eval()} = ${e.eval()}`;
        },

        Assign(ident: Node, _op: Node, e: Node): string {
            const variableName = ident.sourceString;
            const resolvedVariableName = semanticsHelper.getVariable(variableName);
            const value = e.eval();
            return `${resolvedVariableName} = ${value}`;
        },

        Abs(_absLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            return `Math.abs(${e.eval()})`;
        },

        Asc(_ascLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            return `(${e.eval()}).charCodeAt(0)`;
        },

        Atn(_atnLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            return semanticsHelper.getDeg() ? `(Math.atan(${e.eval()}) * 180 / Math.PI)` : `Math.atan(${e.eval()})`;
        },

        BinS(_binLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            semanticsHelper.addInstr("bin$");
            const pad = n.child(0)?.eval();
            return pad !== undefined ? `bin$(${e.eval()}, ${pad})` : `bin$(${e.eval()})`
        },

        ChrS(_chrLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            return `String.fromCharCode(${e.eval()})`;
        },

        Comment(_commentLit: Node, remain: Node) {
            return `//${remain.sourceString}`;
        },

        Cos: cosSinTan,

        Cint(_cintLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            return `Math.round(${e.eval()})`;
        },

        Cls(_clsLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            semanticsHelper.addInstr("cls");
            return `cls()`;
        },

        Data(_datalit: Node, args: Node) {
            const argList = evalChildren(args.asIteration().children);

            const definedLabels = semanticsHelper.getDefinedLabels();

            if (definedLabels.length) {
                const currentLabel = definedLabels[definedLabels.length - 1];
                if (currentLabel.dataIndex === -1) {
                    const dataIndex = semanticsHelper.getDataIndex();
                    currentLabel.dataIndex = dataIndex;
                }
            }

            const dataList = semanticsHelper.getDataList();
            dataList.push(argList.join(", "));
            semanticsHelper.addDataIndex(argList.length);
            return "";
        },

        DecS(_decLit: Node, _open: Node, num: Node, _comma: Node, format: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            semanticsHelper.addInstr("dec$");
            return `dec$(${num.eval()}, ${format.eval()})`;
        },

        Def(_defLit: Node, _fnLit: Node, assign: Node) {
            return `${assign.eval()}`;
        },

        DefArgs(_open: Node, arrayIdents: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            const argList = evalChildren(arrayIdents.asIteration().children);

            return `(${argList.join(", ")})`;
        },

        DefAssign(ident: Node, args: Node, _equal: Node, e: Node) {
            const fnIdent = semanticsHelper.getVariable(`fn${ident.sourceString}`);

            semanticsHelper.setDefContext(true); // do not create global variables in this context
            const argStr = evalChildren(args.children).join(", ") || "()";
			
            const defBody = e.eval();
            semanticsHelper.setDefContext(false);

            return `${fnIdent} = ${argStr} => ${defBody}`;
        },

        Deg(_degLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
            semanticsHelper.setDeg(true);
            return `/* deg active */`;
        },

		Dim(_dimLit: Node, dimArgs: Node) {
			const argumentList: string[] = evalChildren(dimArgs.asIteration().children);
			semanticsHelper.addInstr("dim");
			return argumentList.join("; ");
		},

		Draw: drawMovePlot,

		Drawr: drawMovePlot,

		End(_endLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("end");
			return `return end()`;
		},

		Erase(_eraseLit: Node, arrayIdents: Node) { // erase not really needed
			const arrayIdentifiers: string[] = evalChildren(arrayIdents.asIteration().children);
			const results: string[] = [];

			for (const ident of arrayIdentifiers) {
				const initValStr = ident.endsWith("$") ? '""' : '0';
				results.push(`${ident} = ${initValStr}`);
			}

			return results.join("; ");
		},

		Error(_errorLit: Node, e: Node) {
			return `throw new Error(${e.eval()})`;
		},

		Exp(_expLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.exp(${e.eval()})`;
		},

		Fix(_fixLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.trunc(${e.eval()})`;
		},

		AnyFnArgs(_open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argumentList = evalChildren(args.asIteration().children);
			return `(${argumentList.join(", ")})`;
		},


		FnIdent(fnIdent: Node, args: Node) {
			const argumentString = args.child(0)?.eval() || "()";
			return `${fnIdent.eval()}${argumentString}`;
		},

		StrFnIdent(fnIdent: Node, args: Node) {
			const argStr = args.child(0)?.eval() || "()";
			return `${fnIdent.eval()}${argStr}`;
		},

		For(_forLit: Node, variable: Node, _eqSign: Node, start: Node, _dirLit: Node, end: Node, _stepLit: Node, step: Node) {
			const variableExpression = variable.eval();
			const startExpression = start.eval();
			const endExpression = end.eval();
			const stepExpression = step.child(0)?.eval() || "1";
		
			const stepAsNumber = Number(stepExpression);
		
			let comparisonStatement = "";
			if (isNaN(stepAsNumber)) {
				comparisonStatement = `${stepExpression} >= 0 ? ${variableExpression} <= ${endExpression} : ${variableExpression} >= ${endExpression}`;
			} else {
				comparisonStatement = stepAsNumber >= 0 ? `${variableExpression} <= ${endExpression}` : `${variableExpression} >= ${endExpression}`;
			}
		
			semanticsHelper.nextIndentAdd(2);
			const result = `for (${variableExpression} = ${startExpression}; ${comparisonStatement}; ${variableExpression} += ${stepExpression}) {`;
		
			return result;
		},

		Frame(_frameLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("frame");
			return `await frame()`;
		},

		Gosub(_gosubLit: Node, e: Node) {
			const labelString = e.sourceString;
			semanticsHelper.addGosubLabel(labelString);
		
			return `_${labelString}()`;
		},

		GraphicsPen(_graphicsLit: Node, _penLit: Node, e: Node) {
			semanticsHelper.addInstr("graphicsPen");
			return `graphicsPen(${e.eval()})`;
		},

		HexS(_hexLit: Node, _open: Node, e: Node, _comma: Node, n: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("hex$");
			const pad = n.child(0)?.eval();
			return pad !== undefined ? `hex$(${e.eval()}, ${pad})` : `hex$(${e.eval()})`
		},

		If(_iflit: Node, condExp: Node, _thenLit: Node, thenStat: Node, elseLit: Node, elseStat: Node) {
			const initialIndent = semanticsHelper.getIndentStr();
			semanticsHelper.addIndent(2);
			const increasedIndent = semanticsHelper.getIndentStr();
		
			const condition = condExp.eval();
			const thenStatement = thenStat.eval();
		
			let result = `if (${condition}) {\n${increasedIndent}${thenStatement}\n${initialIndent}}`; // put in newlines to also allow line comments
			if (elseLit.sourceString) {
				const elseStatement = evalChildren(elseStat.children).join('; ');
				result += ` else {\n${increasedIndent}${elseStatement}\n${initialIndent}}`;
			}
		
			semanticsHelper.addIndent(-2);
			return result;
		},

		Ink(_inkLit: Node, num: Node, _comma: Node, col: Node, _comma2: Node, _col2: Node,) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("ink");
			return `ink(${num.eval()}, ${col.eval()})`;
		},

		InkeyS(_inkeySLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("inkey$");
			semanticsHelper.addInstr("frame");
			return `await inkey$()`;
		},

		Input(_inputLit: Node, message: Node, _semi: Node, e: Node) {
			semanticsHelper.addInstr("input");
			semanticsHelper.addInstr("frame");
		
			const messageString = message.sourceString.replace(/\s*[;,]$/, "");
			const identifier = e.eval();
			const isNumberString = identifier.includes("$") ? "" : ", true";
		
			return `${identifier} = await input(${messageString}${isNumberString})`;
		},

		Instr_noLen(_instrLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `((${e1.eval()}).indexOf(${e2.eval()}) + 1)`;
		},

		Instr_len(_instrLit: Node, _open: Node, len: Node, _comma1: Node, e1: Node, _comma2: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `((${e1.eval()}).indexOf(${e2.eval()}, ${len.eval()} - 1) + 1)`;
		},

		Int(_intLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.floor(${e.eval()})`;
		},

		LeftS(_leftLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e1.eval()}).slice(0, ${e2.eval()})`;
		},

		Len(_lenLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).length`;
		},

		Log(_logLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.log(${e.eval()})`;
		},

		Log10(_log10Lit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.log10(${e.eval()})`;
		},

		LowerS(_lowerLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).toLowerCase()`;
		},

		Max(_maxLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argumentList = evalChildren(args.asIteration().children);
			return `Math.max(${argumentList})`;
		},
		
		MidS(_midLit: Node, _open: Node, e1: Node, _comma1: Node, e2: Node, _comma2: Node, e3: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const length = e3.child(0)?.eval();
			const lengthString = length === undefined ? "" : `, ${length}`;
			return `(${e1.eval()}).substr(${e2.eval()} - 1${lengthString})`;
		},

		MidSAssign(_midLit: Node, _open: Node, ident: Node, _comma1: Node, e2: Node, _comma2: Node, e3: Node, _close: Node, _op: Node, e: Node) {
			semanticsHelper.addInstr("mid$Assign");

			const variableName = ident.sourceString;
			const resolvedVariableName = semanticsHelper.getVariable(variableName);
			const start = e2.eval();
			const newString = e.eval();
			const length = e3.child(0)?.eval(); // also undefined possible

			return `${resolvedVariableName} = mid$Assign(${resolvedVariableName}, ${start}, ${newString}, ${length})`;
		},

		Min(_minLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argumentList = evalChildren(args.asIteration().children);
			return `Math.min(${argumentList})`;
		},

		Mode(_modeLit: Node, e: Node) {
			semanticsHelper.addInstr("mode");
			return `mode(${e.eval()})`;
		},

		Move: drawMovePlot,

		Mover: drawMovePlot,

		Next(_nextLit: Node, variables: Node) {
			const argumentList = evalChildren(variables.asIteration().children);
			if (!argumentList.length) {
				argumentList.push("_any");
			}
			semanticsHelper.addIndent(-2 * argumentList.length);
			return '} '.repeat(argumentList.length).slice(0, -1);
		},

		On(_onLit: Node, e1: Node, _gosubLit: Node, args: Node) {
			const index = e1.eval();
			const argumentList = args.asIteration().children.map(child => child.sourceString);
		
			for (let i = 0; i < argumentList.length; i += 1) {
				semanticsHelper.addGosubLabel(argumentList[i]);
			}
		
			return `([${argumentList.map((label) => `_${label}`).join(",")}]?.[${index} - 1] || (() => undefined))()`; // 1-based index
		},

		Origin(_originLit: Node, x: Node, _comma1: Node, y: Node) {
			semanticsHelper.addInstr("origin");
			return `origin(${x.eval()}, ${y.eval()})`;
		},

		Paper(_paperLit: Node, e: Node) {
			semanticsHelper.addInstr("paper");
			return `paper(${e.eval()})`;
		},

		Pen(_penLit: Node, e: Node) {
			semanticsHelper.addInstr("pen");
			return `pen(${e.eval()})`;
		},

		Pi(_piLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "Math.PI";
		},

		Plot: drawMovePlot,

		Plotr: drawMovePlot,

		PrintArg_strCmp(_cmp: Node, args: Node) {
			const parameterString = args.children[0].eval();
			return parameterString;
		},
		
		PrintArg_usingNum(_printLit: Node, format: Node, _semi: Node, numArgs: Node) {
			semanticsHelper.addInstr("dec$");
			const formatString = format.eval();
			const argumentList = evalChildren(numArgs.asIteration().children);
			const parameterString = argumentList.map((arg) => `dec$(${arg}, ${formatString})`).join(', ');
			return parameterString;
		},
		
		Print(_printLit: Node, args: Node, semi: Node) {
			semanticsHelper.addInstr("print");
			const argumentList = evalChildren(args.asIteration().children);
			const parameterString = argumentList.join(', ') || "";
		
			let newlineString = "";
			if (!semi.sourceString) {
				newlineString = parameterString ? `, "\\n"` : `"\\n"`;
			}
			return `print(${parameterString}${newlineString})`;
		},

		Rad(_radLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.setDeg(false);
			return `/* rad active */`;
		},

		Read(_readlit: Node, args: Node) {
			semanticsHelper.addInstr("read");
			const argumentList = evalChildren(args.asIteration().children);
			const results = argumentList.map(identifier => `${identifier} = read()`);
			return results.join("; ");
		},

		Rem(_remLit: Node, remain: Node) {
			return `// ${remain.sourceString}`;
		},

		Restore(_restoreLit: Node, e: Node) {
			const labelString = e.sourceString || "0";
			semanticsHelper.addRestoreLabel(labelString);
		
			semanticsHelper.addInstr("restore");
			return `restore(${labelString})`;
		},

		Return(_returnLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "return";
		},

		RightS(_rightLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const string: string = e1.eval();
			const length: string = e2.eval();
			return `(${string}).substring((${string}).length - (${length}))`;
		},

		Rnd(_rndLit: Node, _open: Node, _e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// args are ignored
			return `Math.random()`;
		},

		Round(_roundLit: Node, _open: Node, value: Node, _comma: Node, decimals: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const decimalPlaces = decimals.child(0)?.eval();
			if (decimalPlaces) {
				semanticsHelper.addInstr("round");
				return `round(${value.eval()}, ${decimalPlaces})`;
			}
			return `Math.round(${value.eval()})`; // common round without decimals places
			// A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
		},

		Rsx(_rsxLit: Node, cmd: Node, e: Node) {
			semanticsHelper.addInstr("rsx");
			const cmdString = cmd.sourceString.toLowerCase();
			const rsxArgs: string = e.child(0)?.eval() || "";
			return `rsx("${cmdString}"${rsxArgs})`;
		},

		RsxArgs(_comma: Node, args: Node) {
			const argumentList = evalChildren(args.asIteration().children);
			const parameterString = ", " + argumentList.join(', ');
			return parameterString;
		},

		Sgn(_sgnLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.sign(${e.eval()})`;
		},

		Sin: cosSinTan,

		SpaceS(_stringLit: Node, _open: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `" ".repeat(${len.eval()})`;
		},

		Sqr(_sqrLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `Math.sqrt(${e.eval()})`;
		},

		Stop(_stopLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("stop");
			return `return stop()`;
		},

		StrS(_strLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const argument = e.eval();
		
			if (isNaN(Number(argument))) {
				semanticsHelper.addInstr("str$");
				return `str$(${argument})`;
			}
			// simplify if we know at compile time that arg is a positive number
			return argument >= 0 ? `(" " + String(${argument}))` : `String(${argument})`;
		},

		StringS_str(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, chr: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// Note: we do not use charAt(0) to get just one char
			return `(${chr.eval()}).repeat(${len.eval()})`;
		},

		StringS_num(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `String.fromCharCode(${num.eval()}).repeat(${len.eval()})`;
		},

		Tag(_tagLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("tag");
			return `tag(true)`;
		},

		Tagoff(_tagoffLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("tag");
			return `tag(false)`;
		},

		Tan: cosSinTan,

		Time(_timeLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("time");
			return `time()`;
		},

		UpperS(_upperLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()}).toUpperCase()`;
		},

		Val(_upperLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
			const numStr = String(e.eval());

			if (numPattern.test(numStr)) {
				return `Number(${numStr})`; // for non-hex/bin number strings we can use this simple version
			}
			semanticsHelper.addInstr("val");
			return `val(${numStr})`;
		},

		Wend(_wendLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addIndent(-2);
			return '}';
		},

		While(_whileLit: Node, e: Node) {
			const cond = e.eval();
			semanticsHelper.nextIndentAdd(2);
			return `while (${cond}) {`;
		},

		Xpos(_xposLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("xpos");
			return `xpos()`;
		},

		Ypos(_xposLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("ypos");
			return `ypos()`;
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
			return createComparisonExpression(a, "===", b);
		},
		CmpExp_ne(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "!==", b);
		},
		CmpExp_lt(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "<", b);
		},
		CmpExp_le(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "<=", b);
		},
		CmpExp_gt(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, ">", b);
		},
		CmpExp_ge(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, ">=", b);
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
			return `((${a.eval()} / ${b.eval()}) | 0)`;
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

		PriExp_paren(_open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()})`;
		},
		PriExp_pos(_op: Node, e: Node) {
			return `+${e.eval()}`;
		},
		PriExp_neg(_op: Node, e: Node) {
			return `-${e.eval()}`;
		},

		StrCmpExp_eq(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} === ${b.eval()})`;
		},
		StrCmpExp_ne(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} !== ${b.eval()})`;
		},
		StrCmpExp_lt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} < ${b.eval()})`;
		},
		StrCmpExp_le(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} <= ${b.eval()})`;
		},
		StrCmpExp_gt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} > ${b.eval()})`;
		},
		StrCmpExp_ge(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} >= ${b.eval()})`;
		},

		StrAddExp_plus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} + ${b.eval()}`;
		},

		StrPriExp_paren(_open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()})`;
		},

		ArrayArgs(args: Node) {
			//return args.asIteration().children.map(c => String(c.eval())).join("][");
			return evalChildren(args.asIteration().children).join("][");
		},

		ArrayIdent(ident: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${ident.eval()}[${e.eval()}]`;
		},

		StrArrayIdent(ident: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${ident.eval()}[${e.eval()}]`;
		},

		DimArrayArgs(args: Node) {
			//return args.asIteration().children.map(c => String(c.eval())).join(", ");
			return evalChildren(args.asIteration().children).join(", ");
		},

		DimArrayIdent(ident: Node, _open: Node, indices: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const identStr = ident.eval();
			const initValStr = identStr.endsWith("$") ? ', ""' : '';
			semanticsHelper.addInstr("dim");

			return `${identStr} = dim([${indices.eval()}]${initValStr})`;
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

		signedDecimal(sign: Node, value: Node) {
			return `${sign.sourceString}${value.sourceString}`;
		},

		string(_quote1: Node, e: Node, _quote2: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `"${e.sourceString}"`;
		},

		ident(ident: Node) {
			const name = ident.sourceString;
			return semanticsHelper.getVariable(name);
		},

		fnIdent(fn: Node, ident: Node) {
			const name = fn.sourceString + ident.sourceString;
			return semanticsHelper.getVariable(name);
		},

		strIdent(ident: Node, typeSuffix: Node) {
			const name = ident.sourceString + typeSuffix.sourceString;
			return semanticsHelper.getVariable(name);
		},

		strFnIdent(fn: Node, ident: Node, typeSuffix: Node) {
			const name = fn.sourceString + ident.sourceString + typeSuffix.sourceString;
			return semanticsHelper.getVariable(name);
		}
	};
	return semantics;
}


export class Semantics implements ISemanticsHelper {
	private lineIndex = 0;

	private indent = 0;
	private indentAdd = 0;

	private readonly variables: Record<string, number> = {};

	private readonly definedLabels: DefinedLabelEntryType[] = [];
	private readonly gosubLabels: Record<string, GosubLabelEntryType> = {};

	private readonly dataList: (string | number)[] = [];
	private dataIndex = 0;
	private readonly restoreMap: Record<string, number> = {};

	private static readonly reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;

	private readonly instrMap: Record<string, number> = {};

	private isDeg = false;
	private isDefContext = false;

	public getDeg(): boolean {
		return this.isDeg;
	}

	public setDeg(isDeg: boolean): void {
		this.isDeg = isDeg;
	}

	public addIndent(num: number): number {
		if (num < 0) {
			this.applyNextIndent();
		}
		this.indent += num;
		return this.indent;
	}

	public setIndent(indent: number): void {
		this.indent = indent;
	}

	public getIndent(): number {
		return this.indent;
	}

	public getIndentStr(): string {
		if (this.indent < 0) {
			console.error("getIndentStr: lineIndex=", this.lineIndex, ", indent=", this.indent);
			return "";
		}
		return " ".repeat(this.indent);
	}

	public applyNextIndent(): void {
		this.indent += this.indentAdd;
		this.indentAdd = 0;
	}

	public nextIndentAdd(num: number): void {
		this.indentAdd += num;
	}

	public addDataIndex(count: number): number {
		return this.dataIndex += count;
	}

	public getDataIndex(): number {
		return this.dataIndex;
	}

	public addDefinedLabel(label: string, line: number): void {
		this.definedLabels.push({
			label,
			first: line,
			last: -1,
			dataIndex: -1
		});
	}

	public getDefinedLabels(): DefinedLabelEntryType[] {
		return this.definedLabels;
	}

	public addGosubLabel(label: string): void {
		this.gosubLabels[label] = this.gosubLabels[label] || {
			count: 0
		};
		this.gosubLabels[label].count = (this.gosubLabels[label].count || 0) + 1;
	}

	public getGosubLabels(): Record<string, GosubLabelEntryType> {
		return this.gosubLabels;
	}

	public getInstrMap(): Record<string, number> {
		return this.instrMap;
	}

	public addInstr(name: string): number {
		this.instrMap[name] = (this.instrMap[name] || 0) + 1;
		return this.instrMap[name];
	}

	public getVariables(): string[] {
		return Object.keys(this.variables);
	}

	public getVariable(name: string): string {
		name = name.toLowerCase();
		if (Semantics.reJsKeyword.test(name)) {
			name = `_${name}`;
		}

		if (!this.isDefContext) {
			this.variables[name] = (this.variables[name] || 0) + 1;
		}
		return name;
	}

	public setDefContext(isDef: boolean): void {
		this.isDefContext = isDef;
	}

	private static deleteAllItems(items: Record<string, unknown>): void {
		for (const name in items) {
			delete items[name];
		}
	}

	public incrementLineIndex(): number {
		this.lineIndex += 1;
		return this.lineIndex;
	}

	public getRestoreMap(): Record<string, number> {
		return this.restoreMap;
	}

	public addRestoreLabel(label: string): void {
		this.restoreMap[label] = -1;
	}

	public getDataList(): (string | number)[] {
		return this.dataList;
	}

	public resetParser(): void {
		this.lineIndex = 0;
		this.indent = 0;
		this.indentAdd = 0;
		Semantics.deleteAllItems(this.variables);
		this.definedLabels.length = 0;
		Semantics.deleteAllItems(this.gosubLabels);
		this.dataList.length = 0;
		this.dataIndex = 0;
		Semantics.deleteAllItems(this.restoreMap);
		Semantics.deleteAllItems(this.instrMap);
		this.isDeg = false;
		this.isDefContext = false;
	}

	public getSemantics(): ActionDict<string> {
		return getSemantics(this);
	}
}
