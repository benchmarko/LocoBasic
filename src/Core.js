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
    setOnCheckSyntax(fn) {
        this.onCheckSyntax = fn;
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
        return this.arithmeticParser.parseAndEval(script);
    }
    async executeScript(compiledScript, vm) {
        vm.reset();
        //vm.setOutput("");
        if (compiledScript.startsWith("ERROR:")) {
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
            const result = await fnScript(vm);
            if (this.config.debug > 0) {
                console.debug("executeScript: ", result);
            }
            vm.flush();
            output = vm.getOutput() || "";
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
        // remain for all timers
        const timerMap = vm.getTimerMap();
        for (const timer in timerMap) {
            if (timerMap[timer] !== undefined) {
                const timerMap = vm.getTimerMap();
                const value = timerMap[timer];
                clearTimeout(value);
                clearInterval(value);
                timerMap[timer] = undefined;
            }
        }
        const compileMessages = this.semantics.getHelper().getCompileMessages();
        output += compileMessages.join("\n"); //TTT
        return output;
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
}
//# sourceMappingURL=Core.js.map