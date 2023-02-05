import { SWNRBaseActor } from "../base-actor";
export declare class SWNRVehicleActor extends SWNRBaseActor<"vehicle"> {
    getRollData(): this["data"]["data"];
    prepareDerivedData(): void;
    _preCreate(actorDataConstructorData: any, options: any, user: any): Promise<void>;
    addCrew(actorId: string): Promise<void>;
    removeCrew(actorId: string): Promise<void>;
}
export declare const document: typeof SWNRVehicleActor;
export declare const name = "vehicle";
