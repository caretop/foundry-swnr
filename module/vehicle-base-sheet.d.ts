import { BaseActorSheet } from "./actor-base-sheet";
export declare class VehicleBaseActorSheet<T extends ActorSheet.Data> extends BaseActorSheet<T> {
    activateListeners(html: JQuery): void;
    _onCrewShow(event: JQuery.ClickEvent): Promise<void>;
    _onCrewDelete(event: JQuery.ClickEvent): Promise<void>;
    _onCrewSkillRoll(event: JQuery.ClickEvent): Promise<void>;
}
