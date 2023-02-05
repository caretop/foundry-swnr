import { DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { SWNRBaseActor } from "../base-actor";
export declare class SWNRDroneActor extends SWNRBaseActor<"drone"> {
    getRollData(): this["data"]["data"];
    prepareDerivedData(): void;
    createEmbeddedDocuments(itemType: string, itemArray: Array<Record<any, any>>, options: DocumentModificationOptions): Promise<Array<foundry.abstract.Document<any, any>>>;
    addCrew(actorId: string): Promise<void>;
    removeCrew(actorId: string): Promise<void>;
    applyDefaulStats(modelType: string): Promise<void>;
    _preCreate(actorDataConstructorData: any, options: any, user: any): Promise<void>;
}
export declare const document: typeof SWNRDroneActor;
export declare const name = "drone";
