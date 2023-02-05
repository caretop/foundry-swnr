import { VehicleBaseActorSheet } from "../vehicle-base-sheet.js";
export class MechActorSheet extends VehicleBaseActorSheet {
    get actor() {
        if (super.actor.type != "mech")
            throw Error;
        return super.actor;
    }
    async getData(options) {
        var _a;
        let data = super.getData(options);
        if (data instanceof Promise)
            data = await data;
        let pilot = null;
        if (this.actor.data.data.crewMembers.length > 0) {
            //should only be 1 or 0 but grabbing first in case it changes.
            const cId = this.actor.data.data.crewMembers[0];
            const crewMember = (_a = game.actors) === null || _a === void 0 ? void 0 : _a.get(cId);
            if (crewMember) {
                if (crewMember.type == "character" || crewMember.type == "npc") {
                    pilot = crewMember;
                }
            }
        }
        return mergeObject(data, {
            itemTypes: this.actor.itemTypes,
            pilot: pilot,
        });
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["swnr", "sheet", "actor", "ship"],
            template: "systems/swnr/templates/actors/mech-sheet.html",
            width: 800,
            height: 600,
            tabs: [
                {
                    navSelector: ".pc-sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "mods",
                },
            ],
        });
    }
    activateListeners(html) {
        super.activateListeners(html);
    }
}
export const sheet = MechActorSheet;
export const types = ["mech"];

//# sourceMappingURL=mech-sheet.js.map
