import { SWNRNPCActor } from "./npc";
import { AllItemClasses } from "../item-types";
import { BaseActorSheet } from "../actor-base-sheet";
interface NPCActorSheetData extends ActorSheet.Data {
    itemTypes: SWNRNPCActor["itemTypes"];
    abilities: AllItemClasses & {
        data: {
            type: "power" | "focus";
        };
    };
    equipment: AllItemClasses & {
        data: {
            type: "armor" | "item" | "weapon";
        };
    };
}
export declare class NPCActorSheet extends BaseActorSheet<NPCActorSheetData> {
    popUpDialog?: Dialog;
    get actor(): SWNRNPCActor;
    _injectHTML(html: JQuery<HTMLElement>): void;
    getData(options?: Application.RenderOptions): Promise<NPCActorSheetData>;
    static get defaultOptions(): ActorSheet.Options;
    activateListeners(html: JQuery): void;
    _onItemDamage(event: JQuery.ClickEvent): Promise<void>;
    _onReaction(event: JQuery.ClickEvent): Promise<void>;
    _onHPMaxChange(event: JQuery.ClickEvent): Promise<void>;
    _onHitDice(event: JQuery.ClickEvent): Promise<void>;
    _onMorale(event: JQuery.ClickEvent): Promise<void>;
    _onSavingThrow(event: JQuery.ClickEvent): Promise<void>;
    _onSkill(event: JQuery.ClickEvent): Promise<void>;
    /** @override */
    _updateObject(event: Event, formData: Record<string, number | string>): Promise<SWNRNPCActor>;
    _itemEditHandler(formData: Record<string, number | string>): void;
}
export declare const sheet: typeof NPCActorSheet;
export declare const types: string[];
export {};
