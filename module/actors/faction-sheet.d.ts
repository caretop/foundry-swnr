import { AllItemClasses } from "../item-types";
import { BaseActorSheet } from "../actor-base-sheet";
import { SWNRFactionActor } from "./faction";
interface FactionActorSheetData extends ActorSheet.Data {
    itemTypes: SWNRFactionActor["itemTypes"];
    assets: AllItemClasses & {
        data: {
            type: "asset";
        };
    };
}
export declare class FactionActorSheet extends BaseActorSheet<FactionActorSheetData> {
    popUpDialog?: Dialog;
    get actor(): SWNRFactionActor;
    _injectHTML(html: JQuery<HTMLElement>): void;
    _onAssetCreate(event: JQuery.ClickEvent): Promise<void>;
    getAssetImage(itemType: string): string | null;
    getData(options?: Application.RenderOptions): Promise<FactionActorSheetData>;
    static get defaultOptions(): ActorSheet.Options;
    _onAddLog(event: JQuery.ClickEvent): Promise<void>;
    _onDelLog(event: JQuery.ClickEvent): Promise<void>;
    _onDelLogAll(event: JQuery.ClickEvent): Promise<void>;
    _onDelTag(event: JQuery.ClickEvent): Promise<void>;
    _onAddCustomTag(event: JQuery.ClickEvent): Promise<void>;
    _onAddTag(event: JQuery.ClickEvent): Promise<void>;
    _onStartTurn(event: JQuery.ClickEvent): Promise<void>;
    _onSetGoal(event: JQuery.ClickEvent): Promise<void>;
    _onAssetRepair(event: JQuery.ClickEvent): Promise<void>;
    _onBaseAdd(event: JQuery.ClickEvent): Promise<void>;
    _onAssetUnusable(event: JQuery.ClickEvent): Promise<void>;
    _onAssetStealthed(event: JQuery.ClickEvent): Promise<void>;
    _onRatingUp(type: string): Promise<void>;
    activateListeners(html: JQuery): void;
}
export declare const sheet: typeof FactionActorSheet;
export declare const types: string[];
export {};
