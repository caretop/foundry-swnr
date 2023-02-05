import { SWNRBaseActor } from "../base-actor";
export declare class SWNRCharacterActor extends SWNRBaseActor<"character"> {
    getRollData(): this["data"]["data"];
    prepareBaseData(): void;
    prepareDerivedData(): void;
    rollSave(save: string): Promise<void>;
}
export declare const document: typeof SWNRCharacterActor;
export declare const name = "character";
