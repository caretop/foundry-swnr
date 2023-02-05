import { SWNRBaseItem } from "./../base-item";
export declare class SWNRFocus extends SWNRBaseItem<"focus"> {
    roll(_shiftKey?: boolean): Promise<void>;
}
export declare const document: typeof SWNRFocus;
export declare const name = "focus";
