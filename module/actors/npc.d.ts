import { SWNRBaseActor } from "../base-actor";
export declare class SWNRNPCActor extends SWNRBaseActor<"npc"> {
    prepareBaseData(): void;
    rollHitDice(forceDieRoll: boolean): Promise<void>;
    rollSave(save: string): Promise<void>;
    _onCreate(data: Parameters<SWNRBaseActor["_onCreate"]>[0], options: Parameters<SWNRBaseActor["_onCreate"]>[1], userId: string): void;
}
export declare const document: typeof SWNRNPCActor;
export declare const name = "npc";
