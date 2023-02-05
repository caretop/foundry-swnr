import { SWNRBaseItem } from "./../base-item";
export declare class SWNRPower extends SWNRBaseItem<"power"> {
    popUpDialog?: Dialog;
    roll(_shiftKey?: boolean): Promise<void>;
}
export declare const document: typeof SWNRPower;
export declare const name = "power";
