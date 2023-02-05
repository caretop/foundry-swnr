import { SWNRVehicleActor } from "./vehicle";
import { VehicleBaseActorSheet } from "../vehicle-base-sheet";
interface VehicleActorSheetData extends ActorSheet.Data {
    shipWeapons?: Item[];
    itemTypes: SWNRVehicleActor["itemTypes"];
}
export declare class VehicleActorSheet extends VehicleBaseActorSheet<VehicleActorSheetData> {
    object: SWNRVehicleActor;
    get actor(): SWNRVehicleActor;
    static get defaultOptions(): ActorSheet.Options;
    getData(options?: Application.RenderOptions): Promise<VehicleActorSheetData>;
    activateListeners(html: JQuery): void;
}
export declare const sheet: typeof VehicleActorSheet;
export declare const types: string[];
export {};
