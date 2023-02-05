import { SWNRBaseItem } from "../base-item";
export declare class SWNRShipFitting extends SWNRBaseItem<"shipFitting"> {
    roll(_shiftKey?: boolean): Promise<void>;
}
export declare const document: typeof SWNRShipFitting;
export declare const name = "shipFitting";
