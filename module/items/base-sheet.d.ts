import { SWNRCharacterActor } from "../actors/character";
import { SWNRDroneActor } from "../actors/drone";
import { SWNRFactionActor } from "../actors/faction";
import { SWNRMechActor } from "../actors/mech";
import { SWNRNPCActor } from "../actors/npc";
import { SWNRShipActor } from "../actors/ship";
import { SWNRVehicleActor } from "../actors/vehicle";
interface BaseSheetData extends ItemSheet.Data {
    actor: SWNRCharacterActor | SWNRNPCActor | SWNRShipActor | SWNRDroneActor | SWNRVehicleActor | SWNRMechActor | SWNRFactionActor | null;
}
export declare class BaseSheet extends ItemSheet<DocumentSheet.Options, BaseSheetData> {
    static get defaultOptions(): DocumentSheet.Options;
    _injectHTML(html: JQuery<HTMLElement>): void;
    /**
     * @override
     */
    get template(): string;
    getData(): Promise<BaseSheetData>;
}
export declare const sheet: typeof BaseSheet;
export declare const types: never[];
export {};
