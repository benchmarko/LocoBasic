import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";
function fnHereDoc(fn) {
    return String(fn).replace(/^[^/]+\/\*\S*/, "").replace(/\*\/[^/]+$/, "");
}
export class Core {
    constructor(defaultConfig) {
        this.semantics = new Semantics();
        this.databaseMap = {};
        this.onCheckSyntax = async (_s) => ""; // eslint-disable-line @typescript-eslint/no-unused-vars
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
            /*
            if (!key) { // maybe ""
                const firstLine = inputString.slice(0, inputString.indexOf("\n"));
                const matches = firstLine.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
                key = matches ? matches[1] : "unknown";
            }
            */
            if (!key) { // maybe ""
                console.warn("addItem: no key:", key);
                key = "unknown";
            }
            const example = this.getExample(key);
            if (example) {
                example.script = inputString;
            }
        };
        this.config = defaultConfig;
    }
    getConfigObject() {
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
        //this.exampleMap = exampleMap;
    }
    getExample(name) {
        const exampleMap = this.getExampleMap();
        return exampleMap[name];
    }
    setOnCheckSyntax(fn) {
        this.onCheckSyntax = fn;
    }
    compileScript(script) {
        if (!this.arithmeticParser) {
            const semantics = this.semantics.getSemantics();
            if (this.config.grammar === "strict") {
                const basicParser = new Parser(arithmetic.basicGrammar, semantics);
                this.arithmeticParser = new Parser(arithmetic.strictGrammar, semantics, basicParser);
            }
            else {
                this.arithmeticParser = new Parser(arithmetic.basicGrammar, semantics);
            }
        }
        this.semantics.resetParser();
        return this.arithmeticParser.parseAndEval(script);
    }
    async executeScript(compiledScript, vm) {
        vm.setOutput("");
        if (compiledScript.startsWith("ERROR")) {
            return "ERROR";
        }
        const syntaxError = await this.onCheckSyntax(compiledScript);
        if (syntaxError) {
            vm.cls();
            return "ERROR: " + syntaxError;
        }
        let output = "";
        try {
            const fnScript = new Function("_o", compiledScript);
            const result = fnScript(vm) || "";
            if (result instanceof Promise) {
                output = await result;
                vm.flush();
                output = vm.getOutput() || "";
            }
            else {
                vm.flush();
                output = vm.getOutput() || "";
            }
        }
        catch (error) {
            output = vm.getOutput() || "";
            if (output) {
                output += "\n";
            }
            output += String(error).replace("Error: INFO: ", "INFO: ");
            if (error instanceof Error) {
                const anyErr = error;
                const lineNumber = anyErr.lineNumber; // only on FireFox
                const columnNumber = anyErr.columnNumber; // only on FireFox
                if (lineNumber || columnNumber) {
                    const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
                    output += ` (Line ${errLine}, column ${columnNumber})`;
                }
            }
        }
        return output;
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
}
//# sourceMappingURL=Core.js.map