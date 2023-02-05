import { SWNRDroneActor } from "./drone";
import { VehicleBaseActorSheet } from "../vehicle-base-sheet";
interface DroneActorSheetData extends ActorSheet.Data {
    shipWeapons?: Item[];
    itemTypes: SWNRDroneActor["itemTypes"];
}
export declare class DroneActorSheet extends VehicleBaseActorSheet<DroneActorSheetData> {
    object: SWNRDroneActor;
    get actor(): SWNRDroneActor;
    static get defaultOptions(): ActorSheet.Options;
    getData(options?: Application.RenderOptions): Promise<DroneActorSheetData>;
    activateListeners(html: JQuery): void;
    _onHullChange(event: JQuery.ClickEvent): void;
}
export declare const sheet: typeof DroneActorSheet;
export declare const types: string[];
export {};
