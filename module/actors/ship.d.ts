import { SWNRBaseActor } from "../base-actor";
export declare type SysToFail = "drive" | "wpn" | "def" | "fit";
export declare class SWNRShipActor extends SWNRBaseActor<"ship"> {
    ENGINE_ID: string;
    getRollData(): this["data"]["data"];
    moveDates(n: number): void;
    setScheduledDate(d: Date, type: "payment" | "maintenance"): Promise<void>;
    prepareDerivedData(): void;
    applyDefaulStats(hullType: string): Promise<void>;
    useDaysOfLifeSupport(nDays: number): Promise<void>;
    rollSensor(actorName: string | null, targetMod: number, observerMod: number, skillMod: number, statMod: number, dice: string, rollingAs: "observer" | "target" | "single", rollMode: "roll" | "gmroll" | "blindroll"): Promise<void>;
    rollSpike(pilotId: string, pilotName: string | null, skillMod: number, statMod: number, mod: number, dice: string, difficulty: number, travelDays: number): Promise<void>;
    calcCost(maintenance: boolean): Promise<void>;
    rollCrisis(): void;
    _getRandomInt(exclusiveMax: number): number;
    _breakItem(id: string, forceDestroy: boolean): Promise<[Record<string, unknown> | null, string]>;
    rollSystemFailure(sysToInclude: SysToFail[], whatToRoll: string): Promise<void>;
    addCrew(actorId: string): Promise<void>;
    removeCrew(actorId: string): Promise<void>;
    _preCreate(actorDataConstructorData: any, options: any, user: any): Promise<void>;
}
export declare const document: typeof SWNRShipActor;
export declare const name = "ship";
