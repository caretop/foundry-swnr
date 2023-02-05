import { SWNRCharacterActor } from "./character";
import { BaseActorSheet } from "../actor-base-sheet";
interface CharacterActorSheetData extends ActorSheet.Data {
    weapons?: Item[];
    armor?: Item[];
    gear?: Item[];
    skills?: Item[];
    useHomebrewLuckSave: boolean;
    showTempAttrMod: boolean;
    itemTypes: SWNRCharacterActor["itemTypes"];
}
export declare class CharacterActorSheet extends BaseActorSheet<CharacterActorSheetData> {
    object: SWNRCharacterActor;
    _injectHTML(html: JQuery<HTMLElement>): void;
    static get defaultOptions(): ActorSheet.Options;
    activateListeners(html: JQuery): void;
    _onAttrRoll(event: JQuery.ClickEvent): Promise<void>;
    _onResourceName(event: JQuery.ClickEvent): Promise<void>;
    _onResourceDelete(event: JQuery.ClickEvent): Promise<void>;
    _onHPMaxChange(event: JQuery.ClickEvent): Promise<void>;
    _onResourceCreate(event: JQuery.ClickEvent): Promise<void>;
    _onLoadSkills(event: JQuery.ClickEvent): Promise<unknown>;
    _onItemLevelUp(event: JQuery.ClickEvent): Promise<void>;
    _onWeaponRoll(event: JQuery.ClickEvent<HTMLElement>): Promise<void>;
    _onSaveThrow(event: JQuery.ClickEvent): Promise<void>;
    _onStatsRoll(event: JQuery.ClickEvent): Promise<Application>;
    _onRest(event: JQuery.ClickEvent): Promise<void>;
    _onHpRoll(event: JQuery.ClickEvent): Promise<void>;
    _onSkillRoll(event: JQuery.ClickEvent): Promise<void>;
    /** @override */
    getData(): Promise<CharacterActorSheetData>;
    /** @override */
    _updateObject(event: Event, formData: Record<string, number | string>): Promise<SWNRCharacterActor | undefined>;
    _itemEditHandler(formData: Record<string, string | number>): void;
    _onConfigureActor(event: JQuery.ClickEvent): Promise<void>;
    /**
     * Extend and override the sheet header buttons
     * @override
     */
    _getHeaderButtons(): Application.HeaderButton[];
}
export declare const sheet: typeof CharacterActorSheet;
export declare const types: string[];
export {};
