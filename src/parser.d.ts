export type ConfigEntryType = string | number | boolean;
export type ConfigType = Record<string, ConfigEntryType>;
type VariableValue = string | number | Function | [] | VariableValue[];
declare function dimArray(dims: number[], initVal?: string | number): VariableValue[];
export declare const testParser: {
    dimArray: typeof dimArray;
};
export {};
//# sourceMappingURL=parser.d.ts.map