import type { ActionDict, Node } from "ohm-js";
import type { DefinedLabelEntryType, ISemantics, UsedLabelEntryType } from "./Interfaces";
import { SemanticsHelper } from "./SemanticsHelper";

export const CommaOpChar = "\u2192"; // Unicode arrow right
export const TabOpChar = "\u21d2"; // Unicode double arrow right

function evalChildren(children: Node[]): string[] {
	return children.map(child => child.eval());
}

function evalOptionalArg(arg: Node): string {
	const argEval = arg.child(0)?.eval();
	return argEval !== undefined ? `, ${argEval}` : "";
}

function createComparisonExpression(a: Node, op: string, b: Node): string {
	return `-(${a.eval()} ${op} ${b.eval()})`;
}

function getSemanticsActions(semanticsHelper: SemanticsHelper) {
	const adaptIdentName = (str: string) => str.replace(/\./g, "_");

	const drawMovePlot = (lit: Node, x: Node, _comma1: Node, y: Node, _comma2: Node, pen: Node, _comma3: Node, mode: Node) => {
		const command = lit.sourceString.toLowerCase();
		semanticsHelper.addInstr(command);
		const modeStr = mode.child(0) ? notSupported(mode.child(0)) : "";
		return `${command}(${x.eval()}, ${y.eval()}${evalOptionalArg(pen)}${modeStr})`;
	};

	const cosSinTan = (lit: Node, _open: Node, num: Node, _close: Node) => { // eslint-disable-line @typescript-eslint/no-unused-vars
		const func = lit.sourceString.toLowerCase();
		semanticsHelper.addInstr(func);

		if (!semanticsHelper.getDeg()) {
			return `${func}(${num.eval()})`;
		}
		semanticsHelper.addInstr("toRad");
		return `${func}(toRad(${num.eval()}))`;
		//or inline: semanticsHelper.getDeg() ? `Math.${func}((${num.eval()}) * Math.PI / 180)` : `Math.${func}(${num.eval()})`
	};

	const loopBlock = (startNode: Node, content: Node, separator: Node, endNode: Node) => {
		const startStr = startNode.eval();
		const contentStr = evalChildren(content.children).join(';');
		const endStr = endNode.eval();

		let separatorStr = separator.eval();
		if (contentStr && !contentStr.endsWith("}")) {
			separatorStr = ";" + separatorStr;
		}
		return `${startStr}${contentStr}${separatorStr}${endStr}`;
	};

	const uncommentNotSupported = (str: string) => {
		const regExpNotSupp = new RegExp("/\\* not supported: (.*) \\*/");
		if (regExpNotSupp.test(str)) {
			return str.replace(regExpNotSupp, "$1");
		}
		return str;
	};

	const evalAnyFn = (arg: Node): string => {
		if (arg.isIteration()) {
			return arg.children.map(evalAnyFn).join(",");
		} else if (arg.isLexical() || arg.isTerminal()) {
			return arg.sourceString;
		}
		const argStr = arg.eval() as string;
		return uncommentNotSupported(argStr);
	};

	const notSupported = (str: Node, ...args: Node[]) => {
		const name = evalAnyFn(str);

		const argList = args.map(evalAnyFn);
		const argStr = argList.length ? ` ${argList.join(" ")}` : "";

		const message = str.source.getLineAndColumnMessage();
		semanticsHelper.addCompileMessage(`WARNING: Not supported: ${message}`);

		return `/* not supported: ${name}${uncommentNotSupported(argStr)} */`;
	};

	function processSubroutines(lineList: string[], definedLabels: DefinedLabelEntryType[]): string[] {
		const usedLabels = semanticsHelper.getUsedLabels();
		const gosubLabels = usedLabels["gosub"] || {};

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
					lineList[i] = lineList[i].replace(/\n/g, "\n  ");
				}

				const asyncStr = hasAwait ? "async " : "";
				lineList[first] = `${indentStr}${asyncStr}function _${subroutineStart.label}() {${indentStr}\n` + lineList[first];
				lineList[label.last] = lineList[label.last].replace(`${indentStr}  return;`, `${indentStr}}`); // end of subroutine: replace "return" by "}" (can also be on same line)

				if (hasAwait) {
					awaitLabels.push(subroutineStart.label);
				}
				subroutineStart = undefined;
			}
		}
		return awaitLabels;
	}

	const addSemicolon = (str: string) => {
		return str.endsWith("}") ? str : str + ";" // add semicolon, but not for closing bracket
	}

	const semantics = {
		Program(lines: Node) {
			const lineList = evalChildren(lines.children);
			const variableList = semanticsHelper.getVariables();
			const variableDeclarations = variableList.length ? "let " + variableList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";" : "";

			const definedLabels = semanticsHelper.getDefinedLabels();
			const awaitLabels = processSubroutines(lineList, definedLabels);

			const instrMap = semanticsHelper.getInstrMap();
			const dataList = semanticsHelper.getDataList();

			// Prepare data definition snippet if needed
			let dataListSnippet = "";
			if (dataList.length) {
				const restoreMap = semanticsHelper.getRestoreMap();

				for (const label of definedLabels) {
					if (restoreMap[label.label] === -1) {
						restoreMap[label.label] = label.dataIndex;
					}
				}
				for (const key of Object.keys(restoreMap)) {
					if (restoreMap[key] < 0) {
						restoreMap[key] = 0;
					}
				}

				dataListSnippet = `
function _defineData() {
	_o._data = [
${dataList.join(",\n")}
	];
	_o._restoreMap = ${JSON.stringify(restoreMap)};
}
`;
			}

			const endingFrame = !instrMap["end"] ? `return frame();` : "";

			if (endingFrame) {
				semanticsHelper.addInstr("frame");
			}

			const libraryFunctions = Object.keys(instrMap).sort();

			const needsCommaOrTabOpChar = instrMap["printTab"];

			// Assemble code lines
			const codeLines = [
				'"use strict";',
				libraryFunctions ? `const {${libraryFunctions.join(", ")}} = _o;` : '',
				dataList.length ? '_defineData();' : '',
				needsCommaOrTabOpChar ? `const CommaOpChar = "${CommaOpChar}", TabOpChar = "${TabOpChar}";` : '',
				variableDeclarations,
				...lineList.filter(line => line.trimEnd() !== ''),
				endingFrame,
				dataListSnippet
			].filter(Boolean);

			let lineStr = codeLines.join('\n');
			if (!lineStr.endsWith("\n")) {
				lineStr += "\n";
			}
			if (awaitLabels.length) {
				for (const label of awaitLabels) {
					const regEx = new RegExp(`_${label}\\(\\);`, "g");
					lineStr = lineStr.replace(regEx, `await _${label}();`);
				}
			}
			return lineStr;
		},

		LabelRange(start: Node, minus: Node, end: Node) {
			return [start, minus, end].map((node) => evalAnyFn(node)).join("");
		},

		LetterRange(start: Node, minus: Node, end: Node) {
			return [start, minus, end].map((node) => evalAnyFn(node)).join("");
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
			const variableName = ident.eval();
			const resolvedVariableName = semanticsHelper.getVariable(variableName);
			const value = e.eval();
			return `${resolvedVariableName} = ${value}`;
		},

		LoopBlockContent(separator: Node, stmts: Node) {
			const separatorStr = separator.eval();
			const lineStr = stmts.eval();

			return `${separatorStr}${lineStr}`;
		},

		LoopBlockSeparator_colon(_colonLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "";
		},

		LoopBlockSeparator_newline(comment: Node, eol: Node, _label: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// labels in blocks are ignored
			const commentStr = comment.sourceString ? ` //${comment.sourceString.substring(1)}` : "";
			const eolStr = eol.sourceString + semanticsHelper.getIndentStr();
			return `${commentStr}${eolStr}`;
		},

		Abs(_absLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("abs");
			return `abs(${e.eval()})`; // or inline:`Math.abs(${e.eval()})`
		},

		AddressOf(op: Node, ident: Node) {
			return notSupported(op, ident) + "0";
		},

		After(_afterLit: Node, e1: Node, _comma1: Node, e2: Node, _gosubLit: Node, label: Node) {
			semanticsHelper.addInstr("after");
			const timeout = e1.eval();
			const timer = e2.child(0)?.eval() || 0;
			const labelString = label.sourceString;
			semanticsHelper.addUsedLabel(labelString, "gosub");
			return `after(${timeout}, ${timer}, _${labelString})`;
		},

		Asc(_ascLit: Node, _open: Node, str: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("asc");
			return `asc(${str.eval()})`; // or inline: `(${str.eval()}).charCodeAt(0)`
		},

		Atn(_atnLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("atn");

			if (!semanticsHelper.getDeg()) {
				return `atn(${num.eval()})`;
			}
			semanticsHelper.addInstr("toDeg");
			return `toDeg(atn(${num.eval()}))`;
			// or inline: semanticsHelper.getDeg() ? `(Math.atan(${num.eval()}) * 180 / Math.PI)` : `Math.atan(${num.eval()})`
		},

		Auto(lit: Node, label: Node, comma: Node, step: Node) {
			return notSupported(lit, label, comma, step);
		},

		BinS(_binLit: Node, _open: Node, num: Node, _comma: Node, pad: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("bin$");
			return `bin$(${num.eval()}${evalOptionalArg(pad)})`;
		},

		Border(lit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, num, comma, num2);
		},

		Call(lit: Node, args: Node) {
			return notSupported(lit, args.asIteration());
		},

		Cat: notSupported,

		Chain(lit: Node, merge: Node, file: Node, comma: Node, num: Node, comma2: Node, del: Node) {
			return notSupported(lit, merge, file, comma, num, comma2, del);
		},

		ChrS(_chrLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("chr$");
			return `chr$(${e.eval()})`; // or inline: `String.fromCharCode(${e.eval()})`
		},

		Cint(_cintLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("cint");
			return `cint(${e.eval()})`; // or inline: `Math.round(${e.eval()})`
		},

		Clear: notSupported,

		Clear_input(lit: Node, inputLit: Node) {
			return notSupported(lit, inputLit);
		},

		Clg(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Closein: notSupported,

		Closeout: notSupported,

		Cls(_clsLit: Node, stream: Node) {
			semanticsHelper.addInstr("cls");
			const streamStr = stream.child(0)?.eval() || "";
			return `cls(${streamStr})`;
		},

		Comment(_commentLit: Node, remain: Node) {
			return `//${remain.sourceString}`;
		},

		Cont: notSupported,

		CopychrS(lit: Node, open: Node, stream: Node, close: Node) {
			return notSupported(lit, open, stream, close) + '" "';
		},

		Cos: cosSinTan,

		Creal(_lit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("creal");
			return `creal(${num.eval()})`; // or inline: `${num.eval()}`;
		},

		Cursor(lit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, num, comma, num2);
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
			const fnIdent = semanticsHelper.getVariable(`fn${ident.eval()}`);

			semanticsHelper.setDefContext(true); // do not create global variables in this context
			const argStr = evalChildren(args.children).join(", ") || "()";

			const defBody = e.eval();
			semanticsHelper.setDefContext(false);

			return `${fnIdent} = ${argStr} => ${defBody}`;
		},

		Defint(lit: Node, letterRange: Node) {
			return notSupported(lit, letterRange.asIteration());
		},

		Defreal(lit: Node, letterRange: Node) {
			return notSupported(lit, letterRange.asIteration());
		},

		Defstr(lit: Node, letterRange: Node) {
			return notSupported(lit, letterRange.asIteration());
		},

		Deg(_degLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.setDeg(true);
			return `/* deg */`; // we assume to check it at compile time 
		},

		Delete(lit: Node, labelRange: Node) {
			return notSupported(lit, labelRange);
		},

		Derr(lit: Node) {
			return notSupported(lit) + "0";
		},

		Di: notSupported,

		Dim(_dimLit: Node, dimArgs: Node) {
			const argumentList: string[] = evalChildren(dimArgs.asIteration().children);
			return argumentList.join("; ");
		},

		Draw: drawMovePlot,

		Drawr: drawMovePlot,

		Edit(lit: Node, label: Node) {
			return notSupported(lit, label);
		},

		Ei: notSupported,

		End(_endLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("end");
			return `return end()`;
		},

		Ent(lit: Node, nums: Node) { // TODO: separator
			return notSupported(lit, nums.asIteration());
		},

		Env(lit: Node, nums: Node) { // TODO: separator
			return notSupported(lit, nums.asIteration());
		},

		Eof(lit: Node) {
			return notSupported(lit) + "-1";
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

		Erl(lit: Node) {
			return notSupported(lit) + "0";
		},

		Err(lit: Node) {
			return notSupported(lit) + "0";
		},

		Error(_errorLit: Node, e: Node) {
			return `throw new Error(${e.eval()})`;
		},

		Every(_everyLit: Node, e1: Node, _comma1: Node, e2: Node, _gosubLit: Node, label: Node) {
			semanticsHelper.addInstr("every");
			const timeout = e1.eval();
			const timer = e2.child(0)?.eval() || 0;
			const labelString = label.sourceString;
			semanticsHelper.addUsedLabel(labelString, "gosub");
			return `every(${timeout}, ${timer}, _${labelString})`;
		},

		Exp(_expLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("exp");
			return `exp(${num.eval()})`; // or inline: `Math.exp(${e.eval()})`
		},

		Fill(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Fix(_fixLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("fix");
			return `fix(${num.eval()})`; // or inline: `Math.trunc(${num.eval()})`
		},

		Fre(lit: Node, open: Node, e: Node, close: Node) {
			return notSupported(lit, open, e, close) + "0";
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

			semanticsHelper.addIndent(2);
			const result = `for (${variableExpression} = ${startExpression}; ${comparisonStatement}; ${variableExpression} += ${stepExpression}) {`;

			return result;
		},

		ForNextBlock: loopBlock,

		Frame(_frameLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("frame");
			return `await frame()`;
		},

		Gosub(_gosubLit: Node, e: Node) {
			const labelString = e.sourceString;
			semanticsHelper.addUsedLabel(labelString, "gosub");

			return `_${labelString}()`;
		},

		Goto(lit: Node, label: Node) {
			return notSupported(lit, label);
		},

		GraphicsPaper(lit: Node, paperLit: Node, num: Node) {
			return notSupported(lit, paperLit, num);
		},

		GraphicsPen(_graphicsLit: Node, _penLit: Node, num: Node, _comma: Node, mode: Node) {
			semanticsHelper.addInstr("graphicsPen");
			const modeStr = mode.child(0) ? notSupported(mode.child(0)) : "";
			return `graphicsPen(${num.eval()}${modeStr})`;
		},

		HexS(_hexLit: Node, _open: Node, num: Node, _comma: Node, pad: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("hex$");
			return `hex$(${num.eval()}${evalOptionalArg(pad)})`;
		},

		Himem(lit: Node) {
			return notSupported(lit) + "0";
		},

		IfExp_label(label: Node) {
			return notSupported(label);
		},

		IfThen_then(_thenLit: Node, thenStat: Node) {
			const thenStatement = thenStat.eval();
			return thenStatement;
		},

		If(_iflit: Node, condExp: Node, thenStat: Node, elseLit: Node, elseStat: Node) {
			const initialIndent = semanticsHelper.getIndentStr();
			semanticsHelper.addIndent(2);
			const increasedIndent = semanticsHelper.getIndentStr();

			const condition = condExp.eval();
			const thenStatement = addSemicolon(thenStat.eval());

			let result = `if (${condition}) {\n${increasedIndent}${thenStatement}\n${initialIndent}}`; // put in newlines to also allow line comments
			if (elseLit.sourceString) {
				const elseStatement = addSemicolon(evalChildren(elseStat.children).join('; '));
				result += ` else {\n${increasedIndent}${elseStatement}\n${initialIndent}}`;
			}

			semanticsHelper.addIndent(-2);
			return result;
		},

		Ink(_inkLit: Node, num: Node, _comma: Node, col: Node, _comma2: Node, col2: Node) {
			semanticsHelper.addInstr("ink");
			const col2Str = col2.child(0) ? notSupported(col2.child(0)) : "";
			return `ink(${num.eval()}, ${col.eval()}${col2Str})`;
		},

		Inkey(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		InkeyS(_inkeySLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("inkey$");
			return `await inkey$()`;
		},

		Inp(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		Input(_inputLit: Node, stream: Node, _comma: Node, _semi: Node, message: Node, _commaSemi: Node, ids: Node) {
			semanticsHelper.addInstr("input");
			const streamStr = stream.child(0)?.eval() || "";

			const messageString = message.sourceString.replace(/\s*[;,]$/, "") || '""';
			const identifiers = evalChildren(ids.asIteration().children);
			const isNumberString = identifiers[0].includes("$") ? "" : ", true"; // TODO
			if (identifiers.length > 1) {
				const identifierStr = `[${identifiers.join(", ")}]`;
				return `${identifierStr} = (await input(${streamStr}${messageString}${isNumberString})).split(",")`;
			}

			return `${identifiers[0]} = await input(${streamStr}${messageString}${isNumberString})`;
		},

		Instr_noLen(_instrLit: Node, _open: Node, e1: Node, _comma: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("instr");
			return `instr(${e1.eval()}, ${e2.eval()})`;
		},

		Instr_len(_instrLit: Node, _open: Node, len: Node, _comma1: Node, e1: Node, _comma2: Node, e2: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("instr");
			return `instr(${e1.eval()}, ${e2.eval()}, ${len.eval()})`;
		},

		Int(_intLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("int");
			return `int(${num.eval()})`; // or inline: `Math.floor(${num.eval()})`
		},

		Joy(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		Key_key(lit: Node, num: Node, comma: Node, str: Node) {
			return notSupported(lit, num, comma, str);
		},

		Key_def(lit: Node, defLit: Node, num: Node, comma: Node, repeat: Node, comma2: Node, codes: Node) {
			//const codesIteration = codes.child(0) ? codes.child(0).asIteration() : undefined;
			if (num.eval() === "78" && repeat.eval() === "1") {
				const codeList = codes.child(0) ? evalChildren(codes.child(0).asIteration().children) : undefined;
				const codeListStr = codeList ? `, ${codeList.join(", ")}`: "";
				semanticsHelper.addInstr("keyDef");
				return `keyDef(${num.eval()}, ${repeat.eval()}${codeListStr})`;
			}
			return notSupported(lit, defLit, num, comma, repeat, comma2, codes.child(0) ? codes.child(0).asIteration() : codes);
		},

		LeftS(_leftLit: Node, _open: Node, pos: Node, _comma: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("left$");
			return `left$(${pos.eval()}, ${len.eval()})`;
		},

		Len(_lenLit: Node, _open: Node, str: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("len");
			return `len(${str.eval()})`; // or inline: `(${str.eval()}).length`
		},

		Let(_letLit: Node, assign: Node) {
			return `${assign.eval()}`;
		},

		LineInput(lit: Node, inputLit: Node, stream: Node, comma: Node, message: Node, semi: Node, e: Node) {
			return notSupported(lit, inputLit, stream, comma, message, semi, e);
		},

		List(lit: Node, labelRange: Node, comma: Node, stream: Node) {
			return notSupported(lit, labelRange, comma, stream);
		},

		Load(lit: Node, file: Node, comma: Node, address: Node) {
			return notSupported(lit, file, comma, address);
		},

		Locate(lit: Node, stream: Node, comma: Node, x: Node, comma2: Node, y: Node) {
			return notSupported(lit, stream, comma, x, comma2, y);
		},

		Log(_logLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("log");
			return `log(${num.eval()})`; // or inline: `Math.log(${num.eval()})`
		},

		Log10(_log10Lit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("log10");
			return `log10(${num.eval()})`; // or inline: `Math.log10(${num.eval()})`
		},

		LowerS(_lowerLit: Node, _open: Node, str: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("lower$");
			return `lower$(${str.eval()})`; // or inline: `(${str.eval()}).toLowerCase()`
		},

		Mask(lit: Node, num: Node, comma: Node, num2: Node, comma2: Node, num3: Node) {
			return notSupported(lit, num, comma, num2, comma2, num3);
		},

		Max(_maxLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("max");
			return `max(${evalChildren(args.asIteration().children)})`; // or inline: return `Math.max(${evalChildren(args.asIteration().children)})`;
		},

		Memory(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Merge(lit: Node, file: Node) {
			return notSupported(lit, file);
		},

		MidS(_midLit: Node, _open: Node, str: Node, _comma1: Node, start: Node, _comma2: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("mid$");
			return `mid$(${str.eval()}, ${start.eval()}${evalOptionalArg(len)})`;
		},

		MidSAssign(_midLit: Node, _open: Node, ident: Node, _comma1: Node, start: Node, _comma2: Node, len: Node, _close: Node, _op: Node, newStr: Node) {
			semanticsHelper.addInstr("mid$Assign");
			const variableName = ident.eval();
			return `${variableName} = mid$Assign(${variableName}, ${start.eval()}, ${newStr.eval()}${evalOptionalArg(len)})`;
		},

		Min(_minLit: Node, _open: Node, args: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("min");
			return `min(${evalChildren(args.asIteration().children)})`; // or inline: return `Math.max(${evalChildren(args.asIteration().children)})`;
		},

		Mode(_modeLit: Node, num: Node) {
			semanticsHelper.addInstr("mode");
			//semanticsHelper.addInstr("cls");
			return `mode(${num.eval()})`;
		},

		Move: drawMovePlot,

		Mover: drawMovePlot,

		New: notSupported,

		Next(_nextLit: Node, _variable: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// we cannot parse NEXT with multiple variables, if we want to match FOR and NEXT
			semanticsHelper.addIndent(-2);
			return `}`;
		},

		On_numGosub(_onLit: Node, e1: Node, _gosubLit: Node, args: Node) {
			const index = e1.eval();
			const argumentList = args.asIteration().children.map(child => child.sourceString);

			for (let i = 0; i < argumentList.length; i += 1) {
				const labelString = argumentList[i];
				semanticsHelper.addUsedLabel(labelString, "gosub");
			}

			return `([${argumentList.map((label) => `_${label}`).join(",")}]?.[${index} - 1] || (() => undefined))()`; // 1-based index
		},

		On_numGoto(lit: Node, num: Node, gotoLit: Node, labels: Node) {
			return notSupported(lit, num, gotoLit, labels.asIteration());
		},

		On_breakCont(lit: Node, breakLit: Node, contLit: Node) {
			return notSupported(lit, breakLit, contLit);
		},

		On_breakGosub(lit: Node, breakLit: Node, gosubLit: Node, label: Node) {
			return notSupported(lit, breakLit, gosubLit, label);
		},

		On_breakStop(lit: Node, breakLit: Node, stopLit: Node) {
			return notSupported(lit, breakLit, stopLit);
		},

		On_errorGoto(lit: Node, errorLit: Node, gotoLit: Node, label: Node) {
			return notSupported(lit, errorLit, gotoLit, label);
		},

		Openin(lit: Node, file: Node) {
			return notSupported(lit, file);
		},

		Openout(lit: Node, file: Node) {
			return notSupported(lit, file);
		},

		Origin(_originLit: Node, x: Node, _comma: Node, y: Node, _comma2: Node, win: Node,) {
			semanticsHelper.addInstr("origin");
			const winStr = win.child(0) ? notSupported(win.child(0)) : "";
			return `origin(${x.eval()}, ${y.eval()}${winStr})`;
		},

		Out(lit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, num, comma, num2);
		},

		Paper(_paperLit: Node, stream: Node, _comma: Node, e: Node) {
			semanticsHelper.addInstr("paper");
			const streamStr = stream.child(0)?.eval() || "";
			return `paper(${streamStr}${e.eval()})`;
		},

		Peek(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		Pen(_penLit: Node, stream: Node, _comma: Node, e: Node, _comma2: Node, e2: Node) {
			semanticsHelper.addInstr("pen");
			const streamStr = stream.child(0)?.eval() || "";
			const modeStr = e2.child(0) ? notSupported(e2.child(0)) : "";
			return `pen(${streamStr}${e.eval()}${modeStr})`;
		},

		Pi(_piLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("pi");
			return `pi`; // or inline: "Math.PI";
		},

		Plot: drawMovePlot,

		Plotr: drawMovePlot,

		Poke(lit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, num, comma, num2);
		},

		Pos(lit: Node, open: Node, streamLit: Node, num: Node, close: Node) {
			if (num.eval() !== "0") {
				return notSupported(lit, open, streamLit, num, close) + "0";
			}
			semanticsHelper.addInstr("pos");
			return "pos()";
		},

		PrintArg_strCmp(_cmp: Node, args: Node) {
			const parameterString = args.children[0].eval();
			return parameterString;
		},

		PrintArg_usingNum(_printLit: Node, format: Node, _semi: Node, numArgs: Node) {
			semanticsHelper.addInstr("using");
			const formatString = format.eval();
			const argumentList = evalChildren(numArgs.asIteration().children);
			//const parameterString = argumentList.map((arg) => `dec$(${arg}, ${formatString})`).join(', ');
			const parameterString = argumentList.join(', ');
			return `using(${formatString}, ${parameterString})`;
		},

		PrintArg_commaOp(_comma: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `"${CommaOpChar}"`; // Unicode arrow right
		},

		StreamArg(streamLit: Node, stream: Node) {
			return notSupported(streamLit, stream) + "";
		},

		Print(_printLit: Node, stream: Node, _comma: Node, args: Node, semi: Node) {
			//semanticsHelper.addInstr("printText");
			const streamStr = stream.child(0)?.eval() || "";
			const argumentList = evalChildren(args.asIteration().children);
			const parameterString = argumentList.join(', ') || "";

			const hasCommaOrTab = parameterString.includes(`"${CommaOpChar}`) || parameterString.includes(`"${TabOpChar}`);
			if (hasCommaOrTab) {
				semanticsHelper.addInstr("printTab");
			} else {
				semanticsHelper.addInstr("print");
			}

			let newlineString = "";
			if (!semi.sourceString) {
				newlineString = parameterString ? `, "\\n"` : `"\\n"`;
			}
			return `${hasCommaOrTab ? "printTab" : "print"}(${streamStr}${parameterString}${newlineString})`;
		},

		Rad(_radLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.setDeg(false);
			return `/* rad */`; // we assume to check it at compile time
		},

		Randomize(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Read(_readlit: Node, args: Node) {
			semanticsHelper.addInstr("read");
			const argumentList = evalChildren(args.asIteration().children);
			const results = argumentList.map(identifier => `${identifier} = read()`);
			return results.join("; ");
		},

		Release(lit: Node, num: Node) {
			return notSupported(lit, num);
		},

		Rem(_remLit: Node, remain: Node) {
			return `// ${remain.sourceString}`;
		},

		Remain(_remainLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("remain");
			return `remain(${e.eval()})`;
		},

		Renum(lit: Node, num: Node, comma: Node, num2: Node, comma2: Node, num3: Node) {
			return notSupported(lit, num, comma, num2, comma2, num3);
		},

		Restore(_restoreLit: Node, e: Node) {
			const labelString = e.sourceString || "0";
			semanticsHelper.addRestoreLabel(labelString);
			semanticsHelper.addUsedLabel(labelString, "restore");

			semanticsHelper.addInstr("restore");
			return `restore(${labelString})`;
		},

		Resume(lit: Node, labelOrNext: Node) {
			return notSupported(lit, labelOrNext);
		},

		Return(_returnLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return "return";
		},

		RightS(_rightLit: Node, _open: Node, str: Node, _comma: Node, len: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("right$");
			return `right$(${str.eval()}, ${len.eval()})`;
		},

		Rnd(_rndLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("rnd");
			const arg = e.child(0)?.eval() ?? ""; // we ignore arg, but...
			return `rnd(${arg})`; // or inline: `Math.random()`
		},

		Round(_roundLit: Node, _open: Node, num: Node, _comma: Node, decimals: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const decimalPlaces = evalOptionalArg(decimals);
			if (decimalPlaces) {
				semanticsHelper.addInstr("round");
				return `round(${num.eval()}${decimalPlaces})`;
			}
			semanticsHelper.addInstr("round1");
			return `round1(${num.eval()})`;
			// or inline: `Math.round(${num.eval()})`; // common round without decimals places
			// A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
		},

		Rsx(_rsxLit: Node, cmd: Node, e: Node) {
			semanticsHelper.addInstr("rsxCall");
			const cmdString = adaptIdentName(cmd.sourceString).toLowerCase();
			const rsxArgs: string = e.child(0)?.eval() || "";

			if (rsxArgs === "") {
				return `await rsxCall("${cmdString}"${rsxArgs})`;
			}
			// need assign, not so nice to use <RSXFUNCTION>" as separator
			return rsxArgs.replace("<RSXFUNCTION>", `await rsxCall("${cmdString}"`) + ")";
		},

		RsxAddressOf(_adressOfLit: Node, ident: Node) {
			const identString = ident.eval().toLowerCase();
			return `@${identString}`;
		},

		RsxArgs(_comma: Node, args: Node) {
			const argumentList = evalChildren(args.asIteration().children);

			// Remove "@" prefix from arguments
			const argumentListNoAddr = argumentList.map(arg =>
				arg.startsWith("@") ? arg.substring(1) : arg
			);

			// Extract assignments and remove "@" prefix
			const assignList = argumentList.map(arg => arg.startsWith("@") ? arg.substring(1) : undefined);

			// Remove trailing undefined values
			while (assignList.length && assignList[assignList.length - 1] === undefined) {
				assignList.pop();
			}

			// Build the result string
			const assignments = assignList.length ? `[${assignList.join(", ")}] = ` : "";
			const result = `${assignments}<RSXFUNCTION>, ${argumentListNoAddr.join(", ")}`;

			return result;
		},

		Run(lit: Node, labelOrFileOrNoting: Node) {
			return notSupported(lit, labelOrFileOrNoting);
		},

		Save(lit: Node, file: Node, comma: Node, type: Node, comma2: Node, num: Node, comma3: Node, num2: Node, comma4: Node, num3: Node) {
			return notSupported(lit, file, comma, type, comma2, num, comma3, num2, comma4, num3);
		},

		Sgn(_sgnLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("sgn");
			return `sgn(${num.eval()})`; // or inline: `Math.sign(${num.eval()})`
		},

		Sin: cosSinTan,

		Sound(lit: Node, args: Node) {
			return notSupported(lit, args.asIteration());
		},

		SpaceS(_stringLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("space$");
			return `space$(${num.eval()})`; // or inline: `" ".repeat(${num.eval()})`
		},

		Spc(_lit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("spc");
			return `spc(${num.eval()})`; // or inline: `" ".repeat(${num.eval()})`
		},

		Speed_ink(lit: Node, inkLit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, inkLit, num, comma, num2);
		},

		Speed_key(lit: Node, keyLit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, keyLit, num, comma, num2);
		},

		Speed_write(lit: Node, writeLit: Node, num: Node) {
			return notSupported(lit, writeLit, num);
		},

		Sq(lit: Node, open: Node, num: Node, close: Node) {
			return notSupported(lit, open, num, close) + "0";
		},

		Sqr(_sqrLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("sqr");
			return `sqr(${num.eval()})`; // or inline: `Math.sqrt(${e.eval()})`;
		},

		Stop(_stopLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("stop");
			return `return stop()`;
		},

		StrS(_strLit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("str$");
			return `str$(${num.eval()})`;
		},

		StringS_str(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, chr: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// Note: we do not use charAt(0) to get just one char
			semanticsHelper.addInstr("string$Str");
			return `string$Str(${len.eval()}, ${chr.eval()})`; // or inline: `(${chr.eval()}).repeat(${len.eval()})`
		},

		StringS_num(_stringLit: Node, _open: Node, len: Node, _commaLit: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("string$Num");
			return `string$Num(${len.eval()}, ${num.eval()})`; // or inline: `String.fromCharCode(${num.eval()}).repeat(${len.eval()})`
		},

		Symbol_def(lit: Node, args: Node) {
			return notSupported(lit, args.asIteration());
		},

		Symbol_after(lit: Node, afterLit: Node, num: Node) {
			return notSupported(lit, afterLit, num);
		},

		Tab(_lit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `"${TabOpChar}${num.eval()}"`; // Unicode double arrow right
		},

		Tag(_tagLit: Node, stream: Node) {
			semanticsHelper.addInstr("tag");
			const streamStr = stream.child(0)?.eval() || "";
			return `tag(${streamStr})`;
		},

		Tagoff(_tagoffLit: Node, stream: Node) {
			semanticsHelper.addInstr("tagoff");
			const streamStr = stream.child(0)?.eval() || "";
			return `tagoff(${streamStr})`;
		},

		Tan: cosSinTan,

		Test(lit: Node, open: Node, num: Node, comma: Node, num2: Node, close: Node) {
			return notSupported(lit, open, num, comma, num2, close) + "0";
		},

		Testr(lit: Node, open: Node, num: Node, comma: Node, num2: Node, close: Node) {
			return notSupported(lit, open, num, comma, num2, close) + "0";
		},

		Time(_timeLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("time");
			return `time()`;
		},

		Troff: notSupported,

		Tron: notSupported,

		Unt(_lit: Node, _open: Node, num: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("unt");
			return `unt(${num.eval()})`; // or inline: `${num.eval()}`
		},

		UpperS(_upperLit: Node, _open: Node, str: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("upper$");
			return `upper$(${str.eval()})`; // or inline: `(${str.eval()}).toUpperCase()`
		},

		Val(_upperLit: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
			const numStr = String(e.eval());

			if (numPattern.test(numStr)) { // for non-hex/bin number strings we can use this simple version
				semanticsHelper.addInstr("val1");
				return `val1(${numStr})`; // or inline: `Number(${numStr})`;
			}
			semanticsHelper.addInstr("val");
			return `val(${numStr})`;
		},

		Vpos(lit: Node, open: Node, streamLit: Node, num: Node, close: Node) {
			if (num.eval() !== "0") {
				return notSupported(lit, open, streamLit, num, close) + "0";
			}
			semanticsHelper.addInstr("vpos");
			return "vpos()";
		},

		Wait(lit: Node, num: Node, comma: Node, num2: Node, comma2: Node, num3: Node) {
			return notSupported(lit, num, comma, num2, comma2, num3);
		},

		Wend(_wendLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addIndent(-2);
			return '}';
		},

		While(_whileLit: Node, e: Node) {
			const cond = e.eval();
			semanticsHelper.addIndent(2);
			return `while (${cond}) {`;
		},

		WhileWendBlock: loopBlock,

		Width(lit: Node, num: Node,) {
			return notSupported(lit, num);
		},

		Window_def(lit: Node, stream: Node, comma0: Node, num: Node, comma: Node, num2: Node, comma2: Node, num3: Node, comma3: Node, num4: Node) {
			return notSupported(lit, stream, comma0, num, comma, num2, comma2, num3, comma3, num4);
		},

		Window_swap(lit: Node, swapLit: Node, num: Node, comma: Node, num2: Node) {
			return notSupported(lit, swapLit, num, comma, num2);
		},

		Write(_printLit: Node, stream: Node, _comma: Node, args: Node) {
			semanticsHelper.addInstr("write");
			const streamStr = stream.child(0)?.eval() || "";
			const parameterString = evalChildren(args.asIteration().children).join(', ');
			return `write(${streamStr}${parameterString})`;
		},

		Xpos(_xposLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("xpos");
			return `xpos()`;
		},

		Ypos(_xposLit: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			semanticsHelper.addInstr("ypos");
			return `ypos()`;
		},

		Zone(_lit: Node, num: Node) {
			semanticsHelper.addInstr("zone");
			return `zone(${num.eval()})`;
		},

		AndExp_and(a: Node, _op: Node, b: Node) {
			return `${a.eval()} & ${b.eval()}`;
		},

		NotExp_not(_op: Node, e: Node) {
			return `~(${e.eval()})`;
		},

		OrExp_or(a: Node, _op: Node, b: Node) {
			return `${a.eval()} | ${b.eval()}`;
		},

		XorExp_xor(a: Node, _op: Node, b: Node) {
			return `${a.eval()} ^ ${b.eval()}`;
		},


		AddExp_minus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} - ${b.eval()}`;
		},
		AddExp_plus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} + ${b.eval()}`;
		},

		CmpExp_eq(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "===", b);
		},
		CmpExp_ge(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, ">=", b);
		},
		CmpExp_gt(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, ">", b);
		},
		CmpExp_le(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "<=", b);
		},
		CmpExp_lt(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "<", b);
		},
		CmpExp_ne(a: Node, _op: Node, b: Node) {
			return createComparisonExpression(a, "!==", b);
		},

		DivExp_div(a: Node, _op: Node, b: Node) {
			return `((${a.eval()} / ${b.eval()}) | 0)`;
		},

		ExpExp_power(a: Node, _: Node, b: Node) {
			return `Math.pow(${a.eval()}, ${b.eval()})`;
		},

		ModExp_mod(a: Node, _op: Node, b: Node) {
			return `${a.eval()} % ${b.eval()}`;
		},

		MulExp_divide(a: Node, _op: Node, b: Node) {
			return `${a.eval()} / ${b.eval()}`;
		},

		MulExp_times(a: Node, _op: Node, b: Node) {
			return `${a.eval()} * ${b.eval()}`;
		},

		PriExp_neg(_op: Node, e: Node) {
			return `-${e.eval()}`;
		},
		PriExp_paren(_open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()})`;
		},
		PriExp_pos(_op: Node, e: Node) {
			return `+${e.eval()}`;
		},

		StrAddExp_plus(a: Node, _op: Node, b: Node) {
			return `${a.eval()} + ${b.eval()}`;
		},
		StrCmpExp_eq(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} === ${b.eval()})`;
		},
		StrCmpExp_ge(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} >= ${b.eval()})`;
		},
		StrCmpExp_gt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} > ${b.eval()})`;
		},
		StrCmpExp_le(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} <= ${b.eval()})`;
		},
		StrCmpExp_lt(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} < ${b.eval()})`;
		},
		StrCmpExp_ne(a: Node, _op: Node, b: Node) {
			return `-(${a.eval()} !== ${b.eval()})`;
		},

		StrPriExp_paren(_open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `(${e.eval()})`;
		},

		ArrayArgs(args: Node) {
			return evalChildren(args.asIteration().children).join("][");
		},

		ArrayIdent(ident: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${ident.eval()}[${e.eval()}]`;
		},

		DimArrayArgs(args: Node) {
			return evalChildren(args.asIteration().children).join(", ");
		},

		DimArrayIdent(ident: Node, _open: Node, indices: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			const identStr = ident.eval();
			const indicesStr = indices.eval();
			const isMultiDimensional = indicesStr.includes(","); // also for expressions containing comma
			const valueStr = identStr.endsWith("$") ? ', ""' : "";

			if (isMultiDimensional) { // one value (not detected for expressions containing comma)
				semanticsHelper.addInstr("dim");
				return `${identStr} = dim([${indicesStr}]${valueStr})`;
			}

			semanticsHelper.addInstr("dim1");
			return `${identStr} = dim1(${indicesStr}${valueStr})`;
		},

		StrArrayIdent(ident: Node, _open: Node, e: Node, _close: Node) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return `${ident.eval()}[${e.eval()}]`;
		},

		dataUnquoted(data: Node) {
			const str = data.sourceString;
			if (!isNaN(Number(str))) {
				return str;
			}
			return notSupported(data) + `"${str}"`;
		},

		decimalValue(value: Node) {
			const valueStr = value.sourceString.replace(/^(-?)(0+)(\d)/, "$1$3"); // avoid octal numbers: remove leading zeros, but keep sign
			if (valueStr !== value.sourceString) {
				notSupported(value);
			}
			return valueStr;
		},

		hexValue(_prefix: Node, value: Node) {
			return `0x${value.sourceString}`;
		},

		binaryValue(_prefix: Node, value: Node) {
			return `0b${value.sourceString}`;
		},

		string(_quote1: Node, e: Node, quote2: Node) {
			const str = e.sourceString.replace(/\\/g, "\\\\"); // escape backslashes
			const varStr = quote2.sourceString !== '"' ? notSupported(quote2).replace("\n", "eol") : "";
			return `"${str}"${varStr}`;
		},

		ident(ident: Node, suffix: Node) {
			const name = adaptIdentName(ident.sourceString);
			const suffixStr = suffix.child(0)?.sourceString;
			if (suffixStr !== undefined) { // real or integer suffix
				return semanticsHelper.getVariable(name) + notSupported(suffix);
			}
			return semanticsHelper.getVariable(name);
		},

		fnIdent(fn: Node, _space: Node, ident: Node, suffix: Node) {
			const name = fn.sourceString + adaptIdentName(ident.sourceString);
			const suffixStr = suffix.child(0)?.sourceString;
			if (suffixStr !== undefined) { // real or integer suffix
				return semanticsHelper.getVariable(name) + notSupported(suffix);
			}
			return semanticsHelper.getVariable(name);
		},

		strIdent(ident: Node, typeSuffix: Node) {
			const name = adaptIdentName(ident.sourceString) + typeSuffix.sourceString;
			return semanticsHelper.getVariable(name);
		},

		strFnIdent(fn: Node, _space: Node, ident: Node, typeSuffix: Node) {
			const name = fn.sourceString + adaptIdentName(ident.sourceString) + typeSuffix.sourceString;
			return semanticsHelper.getVariable(name);
		}
	};
	return semantics;
}

export class Semantics implements ISemantics {
	private readonly helper: SemanticsHelper;

	constructor() {
		this.helper = new SemanticsHelper();
	}

	public resetParser(): void {
		this.helper.resetParser();
	}

	public getUsedLabels(): Record<string, Record<string, UsedLabelEntryType>> {
		return this.helper.getUsedLabels();
	}

	public getSemanticsActions() {
		return getSemanticsActions(this.helper);
	}

	public getSemanticsActionDict(): ActionDict<string> {
		return this.getSemanticsActions() as ActionDict<string>;
	}

	public getHelper(): SemanticsHelper {
		return this.helper;
	}
}
