import { SWNRBaseItem } from "./../base-item";
export declare class SWNRSkill extends SWNRBaseItem<"skill"> {
    popUpDialog?: Dialog;
    rollSkill(skillName: string | null, statShortName: string, statMod: number, dice: string, skillRank: number, modifier: string | number): Promise<void>;
    roll(shiftKey?: boolean): Promise<void>;
}
export declare const document: typeof SWNRSkill;
export declare const name = "skill";
