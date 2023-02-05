import { SWNRBaseItem } from "./../base-item";
export declare class SWNRWeapon extends SWNRBaseItem<"weapon"> {
    popUpDialog?: Dialog;
    get ammo(): this["data"]["data"]["ammo"];
    get canBurstFire(): boolean;
    get hasAmmo(): boolean;
    rollAttack(damageBonus: number, stat: number, skillMod: number, modifier: number, useBurst: boolean): Promise<void>;
    roll(shiftKey?: boolean): Promise<void>;
}
export declare const document: typeof SWNRWeapon;
export declare const name = "weapon";
