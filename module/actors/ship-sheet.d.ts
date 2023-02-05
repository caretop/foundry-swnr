import { SWNRShipActor } from "./ship";
import { VehicleBaseActorSheet } from "../vehicle-base-sheet";
import "../../lib/sortable/Sortable";
interface ShipActorSheetData extends ActorSheet.Data {
    shipWeapons?: Item[];
    crewMembers?: string[];
    itemTypes: SWNRShipActor["itemTypes"];
}
export declare class ShipActorSheet extends VehicleBaseActorSheet<ShipActorSheetData> {
    object: SWNRShipActor;
    get actor(): SWNRShipActor;
    _injectHTML(html: JQuery<HTMLElement>): void;
    getData(options?: Application.RenderOptions): Promise<ShipActorSheetData>;
    static get defaultOptions(): ActorSheet.Options;
    activateListeners(html: JQuery): void;
    _onResourceName(event: JQuery.ClickEvent): Promise<void>;
    _onResourceDelete(event: JQuery.ClickEvent): Promise<void>;
    _onResourceCreate(event: JQuery.ClickEvent): Promise<void>;
    _onPayment(event: JQuery.ClickEvent): Promise<void>;
    _onMaintenance(event: JQuery.ClickEvent): Promise<void>;
    _onPay(event: JQuery.ClickEvent, paymentType: "payment" | "maintenance"): Promise<void>;
    _onCrewNPCRoll(event: JQuery.ClickEvent): Promise<void>;
    _setCaptSupport(dept: string): Promise<void>;
    _onShipAction(event: JQuery.ClickEvent): Promise<void>;
    _onHullChange(event: JQuery.ClickEvent): void;
    _onRepair(event: JQuery.ClickEvent): Promise<void>;
    _onTravel(event: JQuery.ClickEvent): void;
    _onSensor(event: JQuery.ClickEvent): Promise<void>;
    _onSpike(event: JQuery.ClickEvent): Promise<void>;
    _onRefuel(event: JQuery.ClickEvent): Promise<void>;
    _onCrisis(event: JQuery.ClickEvent): void;
    _onSysFailure(event: JQuery.ClickEvent): Promise<void>;
    _onCalcCost(event: JQuery.ClickEvent): void;
}
export declare const sheet: typeof ShipActorSheet;
export declare const types: string[];
export {};
