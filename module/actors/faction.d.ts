import { SWNRBaseActor } from "../base-actor";
export declare class SWNRFactionActor extends SWNRBaseActor<"faction"> {
    getRollData(): this["data"]["data"];
    _onCreate(): Promise<void>;
    getHealth(level: number): number;
    logMessage(title: string, content: string, longContent?: string | null, logRollString?: string | null): Promise<void>;
    addCustomTag(name: string, desc: string, effect: string): Promise<void>;
    addTag(name: string): Promise<void>;
    addBase(hp: number, assetType: string, name: string, imgPath: string | null): Promise<void>;
    startTurn(): Promise<void>;
    setGoal(): Promise<void>;
    ratingUp(type: string): Promise<void>;
    setHomeWorld(journalId: string): Promise<void>;
    prepareDerivedData(): void;
}
export declare const document: typeof SWNRFactionActor;
export declare const name = "faction";
export declare const FACTION_GOALS: {
    name: string;
    desc: string;
}[];
export declare const FACTION_ACTIONS: ({
    name: string;
    desc: string;
    longDesc: string;
    roll?: undefined;
} | {
    name: string;
    desc: string;
    longDesc?: undefined;
    roll?: undefined;
} | {
    name: string;
    desc: string;
    longDesc: string;
    roll: string;
})[];
export declare const FACTION_TAGS: {
    name: string;
    desc: string;
    effect: string;
}[];
