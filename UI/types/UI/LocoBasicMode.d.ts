import type { Mode, StringStream } from 'codemirror';
import type { ConfigType } from '../Interfaces';
interface State {
    tokenize: ((stream: StringStream, state: State) => string | null) | null;
}
export declare class LocoBasicMode {
    static getMode(syntax?: ConfigType["syntax"]): Mode<State>;
}
export {};
//# sourceMappingURL=LocoBasicMode.d.ts.map