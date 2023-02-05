import { SWNRMechActor } from "./mech";
import { VehicleBaseActorSheet } from "../vehicle-base-sheet";
interface MechActorSheetData extends ActorSheet.Data {
    shipWeapons?: Item[];
    itemTypes: SWNRMechActor["itemTypes"];
}
export declare class MechActorSheet extends VehicleBaseActorSheet<MechActorSheetData> {
    object: SWNRMechActor;
    get actor(): SWNRMechActor;
    getData(options?: Application.RenderOptions): Promise<MechActorSheetData>;
    static get defaultOptions(): ActorSheet.Options;
    activateListeners(html: JQuery): void;
}
export declare const sheet: typeof MechActorSheet;
export declare const types: string[];
export {};
