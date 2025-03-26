import type { Mode, StringStream } from 'codemirror';
interface State {
    tokenize: ((stream: StringStream, state: State) => string | null) | null;
}
export declare class LocoBasicMode {
    static getMode(): Mode<State>;
}
export {};
//# sourceMappingURL=LocoBasicMode.d.ts.map