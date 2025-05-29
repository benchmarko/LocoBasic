import type { ConfigEntryType, ConfigType, DatabaseMapType, DatabaseType, ExampleMapType, ExampleType, ICore, IVm, IVmAdmin } from "./Interfaces";
import { Parser } from "./Parser";
import { arithmetic } from "./arithmetic";
import { Semantics } from "./Semantics";

function fnHereDoc(fn: () => void) {
    return String(fn).replace(/^[^/]+\/\*\S*/, "").replace(/\*\/[^/]+$/, "");
}

export class Core implements ICore {
    private readonly defaultConfig: ConfigType;
    private readonly config: ConfigType;
    private readonly semantics = new Semantics();
    private readonly databaseMap: DatabaseMapType = {};
    private arithmeticParser: Parser | undefined;

    constructor(defaultConfig: ConfigType) {
        this.defaultConfig = defaultConfig;
        this.config = { ...defaultConfig };
    }

    private onCheckSyntax = async (_s: string) => ""; // eslint-disable-line @typescript-eslint/no-unused-vars

    public getDefaultConfigMap(): ConfigType {
        return this.defaultConfig;
    }

    public getConfigMap(): ConfigType {
        return this.config;
    }

    public initDatabaseMap(): DatabaseMapType {
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

    public getDatabaseMap(): DatabaseMapType {
        return this.databaseMap;
    }

    public getDatabase(): DatabaseType {
        return this.databaseMap[this.config.database];
    }

    public getExampleMap(): ExampleMapType {
        const exampleMap = this.databaseMap[this.config.database].exampleMap;
        if (!exampleMap) {
            console.error("getExampleMap: Undefined exampleMap for database", this.config.database);
            return {};
        }
        return exampleMap;
    }

    public setExampleMap(exampleMap: ExampleMapType): void {
        this.databaseMap[this.config.database].exampleMap = exampleMap;
    }

    public getExample(name: string): ExampleType {
        const exampleMap = this.getExampleMap();
        return exampleMap[name];
    }

    public setOnCheckSyntax(fn: (s: string) => Promise<string>): void {
        this.onCheckSyntax = fn;
    }

    public compileScript(script: string): string {
        if (!this.arithmeticParser) {
            const semanticsActionDict = this.semantics.getSemanticsActionDict();
            if (this.config.grammar === "strict") {
                const basicParser = new Parser(arithmetic.basicGrammar, semanticsActionDict);
                this.arithmeticParser = new Parser(arithmetic.strictGrammar, semanticsActionDict, basicParser);
            } else {
                this.arithmeticParser = new Parser(arithmetic.basicGrammar, semanticsActionDict);
            }
        }
        this.semantics.resetParser();
        return this.arithmeticParser.parseAndEval(script);
    }

    public async executeScript(compiledScript: string, vm: IVmAdmin): Promise<string> {
        vm.reset();

        if (compiledScript.startsWith("ERROR:")) {
            return "ERROR";
        }

        const syntaxError = await this.onCheckSyntax(compiledScript);
        if (syntaxError) {
            vm.cls();
            return "ERROR: " + syntaxError;
        }

        let errorStr = "";
        try {
            const fnScript = new Function("_o", compiledScript);
            const result = await fnScript(vm as IVm);

            if (this.config.debug > 0) {
                console.debug("executeScript: ", result);
            }
            vm.flush();
        } catch (error) {
            errorStr += String(error).replace("Error: INFO: ", "INFO: ");
            if (error instanceof Error) {
                const anyErr = error as unknown as Record<string, number>;
                const lineNumber = anyErr.lineNumber; // only on FireFox
                const columnNumber = anyErr.columnNumber; // only on FireFox

                if (lineNumber || columnNumber) {
                    const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
                    errorStr += ` (Line ${errLine}, column ${columnNumber})`;
                }
            }
        }

        // remain for all timers
        const snippetData = vm.getSnippetData();

        const timerMap = snippetData.timerMap;
        for (const timer in timerMap) {
            if (timerMap[timer] !== undefined) {
                const value = timerMap[timer];
                clearTimeout(value);
                clearInterval(value);
                timerMap[timer] = undefined;
            }
        }

        const compileMessages = this.semantics.getHelper().getCompileMessages();
        const output = [snippetData.output, vm.escapeText(errorStr), vm.escapeText(compileMessages.join("\n"))].join("\n");
        return output.trim();
    }

    public getSemantics() {
        return this.semantics;
    }

    public addIndex = (dir: string, input: Record<string, ExampleType[]> | (() => void)): void => { // need property function because we need bound "this"
        if (typeof input === "function") {
            input = {
                [dir]: JSON.parse(fnHereDoc(input).trim())
            };
        }

        const exampleMap: ExampleMapType = {};
        for (const value in input) {
            const item = input[value] as ExampleType[];

            for (let i = 0; i < item.length; i += 1) {
                exampleMap[item[i].key] = item[i];
            }
        }
        this.setExampleMap(exampleMap);
    };

    public addItem = (key: string, input: string | (() => void)): void => { // need property function because we need bound "this"
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

    public parseArgs(args: string[], config: Record<string, ConfigEntryType>): Record<string, ConfigEntryType> {
        for (const arg of args) {
            const [name, ...valueParts] = arg.split("=");
            const nameType = typeof config[name];

            let value: ConfigEntryType = valueParts.join("=");
            if (value !== undefined) {
                if (nameType === "boolean") {
                    value = value === "true";
                } else if (nameType === "number") {
                    value = Number(value);
                }
                config[name] = value;
            }
        }
        return config;
    }
}
