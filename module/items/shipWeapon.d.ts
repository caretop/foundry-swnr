import { SWNRBaseItem } from "../base-item";
export declare class SWNRShipWeapon extends SWNRBaseItem<"shipWeapon"> {
    popUpDialog?: Dialog;
    get ammo(): this["data"]["data"]["ammo"];
    get hasAmmo(): boolean;
    rollAttack(shooterId: string | null, shooterName: string | null, skillMod: number, statMod: number, abMod: number, mod: number, weaponAb: number, npcSkill: number): Promise<void>;
    roll(_shiftKey?: boolean): Promise<void>;
}
export declare const document: typeof SWNRShipWeapon;
export declare const name = "shipWeapon";
