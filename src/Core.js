import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";
//import { CommaOpChar, TabOpChar } from "./Constants";
import { ScriptCreator } from "./ScriptCreator";
function fnHereDoc(fn) {
    return String(fn).replace(/^[^/]+\/\*\S*/, "").replace(/\*\/[^/]+$/, "");
}
function expandNextStatements(src, semanticsHelper) {
    return src.split('\n').map((line, lineIdx) => {
        // Find the first REM or ' that is not inside a string
        let commentIdx = -1;
        let inString = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"')
                inString = !inString;
            // Check for REM (case-insensitive) or '
            if (!inString) {
                if (line.slice(i, i + 3).toUpperCase() === "REM" && (i === 0 || /\s/.test(line[i - 1]))) {
                    commentIdx = i;
                    break;
                }
                if (c === "'") {
                    commentIdx = i;
                    break;
                }
            }
        }
        let code = line;
        let comment = "";
        if (commentIdx !== -1) {
            code = line.slice(0, commentIdx);
            comment = line.slice(commentIdx);
        }
        // Replace NEXT i,j,k with NEXT i : NEXT j : NEXT k (not inside strings)
        code = code.replace(/NEXT\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)/gi, (match, vars, offset) => {
            const before = code.slice(0, offset);
            const quoteCount = (before.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0)
                return match; // inside string, skip
            const col = offset + 1;
            semanticsHelper.addCompileMessage(`WARNING: Not supported: Line ${lineIdx + 1}, col ${col}: Expanding NEXT statement: ${vars}\n`);
            return vars.split(/\s*,\s*/).map(v => `NEXT ${v}`).join(' : ');
        });
        return code + comment;
    }).join('\n');
}
export class Core {
    constructor(defaultConfig) {
        this.semantics = new Semantics();
        this.databaseMap = {};
        this.addIndex = (dir, input) => {
            if (typeof input === "function") {
                input = {
                    [dir]: JSON.parse(fnHereDoc(input).trim())
                };
            }
            const exampleMap = {};
            for (const value in input) {
                const item = input[value];
                for (let i = 0; i < item.length; i += 1) {
                    exampleMap[item[i].key] = item[i];
                }
            }
            this.setExampleMap(exampleMap);
        };
        this.addItem = (key, input) => {
            let inputString = typeof input !== "string" ? fnHereDoc(input) : input;
            inputString = inputString.replace(/^\n/, "").replace(/\n$/, ""); // remove preceding and trailing newlines
            if (!key) { // maybe ""
                console.warn("addItem: no key!");
                key = "unknown";
            }
            const example = this.getExample(key);
            if (example) {
                example.script = inputString;
            }
        };
        this.defaultConfig = defaultConfig;
        this.config = Object.assign({}, defaultConfig);
    }
    getDefaultConfigMap() {
        return this.defaultConfig;
    }
    getConfigMap() {
        return this.config;
    }
    initDatabaseMap() {
        const databaseDirs = this.config.databaseDirs.split(",");
        for (const source of databaseDirs) {
            const parts = source.split("/");
            const key = parts[parts.length - 1];
            this.databaseMap[key] = {
                key,
                source,
                exampleMap: undefined
            };
        }
        return this.databaseMap;
    }
    getDatabaseMap() {
        return this.databaseMap;
    }
    getDatabase() {
        return this.databaseMap[this.config.database];
    }
    getExampleMap() {
        const exampleMap = this.databaseMap[this.config.database].exampleMap;
        if (!exampleMap) {
            console.error("getExampleMap: Undefined exampleMap for database", this.config.database);
            return {};
        }
        return exampleMap;
    }
    setExampleMap(exampleMap) {
        this.databaseMap[this.config.database].exampleMap = exampleMap;
    }
    getExample(name) {
        const exampleMap = this.getExampleMap();
        return exampleMap[name];
    }
    compileScript(script) {
        if (!this.arithmeticParser) {
            const semanticsActionDict = this.semantics.getSemanticsActionDict();
            if (this.config.grammar === "strict") {
                const basicParser = new Parser(arithmetic.basicGrammar, semanticsActionDict);
                this.arithmeticParser = new Parser(arithmetic.strictGrammar, semanticsActionDict, basicParser);
            }
            else {
                this.arithmeticParser = new Parser(arithmetic.basicGrammar, semanticsActionDict);
            }
        }
        this.semantics.resetParser();
        const semanticsHelper = this.semantics.getHelper();
        const preprocessedScript = expandNextStatements(script, semanticsHelper); // some preprocessing
        const compiledScript = this.arithmeticParser.parseAndEval(preprocessedScript);
        const messages = semanticsHelper.getCompileMessages();
        return { compiledScript, messages };
    }
    getSemantics() {
        return this.semantics;
    }
    parseArgs(args, config) {
        for (const arg of args) {
            const [name, ...valueParts] = arg.split("=");
            const nameType = typeof config[name];
            let value = valueParts.join("=");
            if (value !== undefined) {
                if (nameType === "boolean") {
                    value = value === "true";
                }
                else if (nameType === "number") {
                    value = Number(value);
                }
                config[name] = value;
            }
        }
        return config;
    }
    prepareWorkerFnString(workerFnString) {
        /*
        const constants = `
    const CommaOpChar = "${CommaOpChar}";
    const TabOpChar = "${TabOpChar}";
`;
        const workerStringWithConstants = workerFnString.replace(/const postMessage =/, `${constants}    const postMessage =`); // fast hack: get constants into worker string
        return workerStringWithConstants;
        */
        return workerFnString; // currently no modification
    }
    createStandaloneScript(workerString, compiledScript, usedInstrMap) {
        if (!this.scriptCreator) {
            this.scriptCreator = new ScriptCreator(this.config.debug);
        }
        workerString = this.prepareWorkerFnString(workerString);
        const inFrame = this.scriptCreator.createStandaloneScript(workerString, compiledScript, usedInstrMap);
        return inFrame;
    }
}
//# sourceMappingURL=Core.js.map