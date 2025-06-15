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
        return this.arithmeticParser.parseAndEval(script);
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