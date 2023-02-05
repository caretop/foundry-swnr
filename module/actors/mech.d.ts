import { SWNRBaseActor } from "../base-actor";
export declare class SWNRMechActor extends SWNRBaseActor<"mech"> {
    getRollData(): this["data"]["data"];
    prepareDerivedData(): void;
    addCrew(actorId: string): Promise<void>;
    removeCrew(actorId: string): Promise<void>;
    _preCreate(actorDataConstructorData: any, options: any, user: any): Promise<void>;
}
export declare const document: typeof SWNRMechActor;
export declare const name = "mech";
