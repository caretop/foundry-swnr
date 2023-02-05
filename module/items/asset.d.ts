import { AssetType } from "../item-types";
import { SWNRBaseItem } from "./../base-item";
declare type AttackRolls = [Roll, Roll] | null;
export declare class SWNRFactionAsset extends SWNRBaseItem<"asset"> {
    popUpDialog?: Dialog;
    getAttackRolls(isOffense: boolean): Promise<AttackRolls>;
    _attack(isOffense: boolean): Promise<void>;
    _search(targetType: AssetType | ""): Promise<void>;
    _logAction(): Promise<void>;
    roll(_shiftKey?: boolean): Promise<void>;
}
export declare const document: typeof SWNRFactionAsset;
export declare const name = "asset";
export {};
