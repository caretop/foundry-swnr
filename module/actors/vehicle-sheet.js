import { VehicleBaseActorSheet } from "../vehicle-base-sheet.js";
export class VehicleActorSheet extends VehicleBaseActorSheet {
    get actor() {
        if (super.actor.type != "vehicle")
            throw Error;
        return super.actor;
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["swnr", "sheet", "actor", "ship"],
            template: "systems/swnr/templates/actors/vehicle-sheet.html",
            width: 800,
            height: 600,
        });
    }
    async getData(options) {
        var _a;
        let data = super.getData(options);
        if (data instanceof Promise)
            data = await data;
        const crewArray = [];
        if (this.actor.data.data.crewMembers) {
            for (let i = 0; i < this.actor.data.data.crewMembers.length; i++) {
                const cId = this.actor.data.data.crewMembers[i];
                const crewMember = (_a = game.actors) === null || _a === void 0 ? void 0 : _a.get(cId);
                if (crewMember &&
                    (crewMember.type == "character" || crewMember.type == "npc")) {
                    crewArray.push(crewMember);
                    //console.log(crewArray);
                }
            }
            //console.log("CA", crewArray);
        }
        else {
            //console.log("no crewmembers");
        }
        return mergeObject(data, {
            itemTypes: this.actor.itemTypes,
            crewArray: crewArray,
        });
    }
    activateListeners(html) {
        super.activateListeners(html);
    }
}
export const sheet = VehicleActorSheet;
export const types = ["vehicle"];

//# sourceMappingURL=vehicle-sheet.js.map
