import { SWNRBaseItem } from "../base-item";
export declare class SWNRShipDefense extends SWNRBaseItem<"shipDefense"> {
    roll(_shiftKey?: boolean): Promise<void>;
}
export declare const document: typeof SWNRShipDefense;
export declare const name = "shipDefense";
