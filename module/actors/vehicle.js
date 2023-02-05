import { SWNRBaseActor } from "../base-actor.js";
export class SWNRVehicleActor extends SWNRBaseActor {
    getRollData() {
        this.data._source.data;
        const data = super.getRollData();
        // data.itemTypes = <SWNRCharacterData["itemTypes"]>this.itemTypes;
        return data;
    }
    prepareDerivedData() {
        const data = this.data.data;
        const mass = data.mass.max;
        const power = data.power.max;
        const hardpoints = data.hardpoints.max;
        const shipInventory = this.items.filter((i) => i.type === "shipDefense" ||
            i.type === "shipWeapon" ||
            i.type === "shipFitting");
        const totalMass = shipInventory
            .map((i) => i.data.data.mass)
            .reduce((i, n) => i + n, 0);
        const totalPower = shipInventory
            .map((i) => i.data.data.power)
            .reduce((i, n) => i + n, 0);
        const totalHardpoint = shipInventory
            .filter((i) => i.type === "shipWeapon")
            .map((i) => i.data.data["hardpoint"])
            .reduce((i, n) => i + n, 0);
        data.mass.value = mass - totalMass;
        data.power.value = power - totalPower;
        data.hardpoints.value = hardpoints - totalHardpoint;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async _preCreate(actorDataConstructorData, options, user) {
        await super._preCreate(actorDataConstructorData, options, user);
        if (actorDataConstructorData.type &&
            this.data._source.img == "icons/svg/mystery-man.svg") {
            const mechImg = "systems/swnr/assets/icons/vehicle.png";
            this.data._source.img = mechImg;
        }
    }
    async addCrew(actorId) {
        var _a, _b;
        const actor = (_a = game.actors) === null || _a === void 0 ? void 0 : _a.get(actorId);
        if (actor) {
            const crewMembers = this.data.data.crewMembers;
            //Only add crew once
            if (crewMembers.indexOf(actorId) == -1) {
                let crew = this.data.data.crew.current;
                crew += 1;
                crewMembers.push(actorId);
                await this.update({
                    "data.crew.current": crew,
                    "data.crewMembers": crewMembers,
                });
            }
        }
        else {
            (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error("Actor added no longer exists");
        }
    }
    async removeCrew(actorId) {
        var _a;
        const crewMembers = this.data.data.crewMembers;
        //Only remove if there
        const idx = crewMembers.indexOf(actorId);
        if (idx == -1) {
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error("Crew member not found");
        }
        else {
            crewMembers.splice(idx, 1);
            let crew = this.data.data.crew.current;
            crew -= 1;
            await this.update({
                "data.crew.current": crew,
                "data.crewMembers": crewMembers,
            });
        }
    }
}
export const document = SWNRVehicleActor;
export const name = "vehicle";

//# sourceMappingURL=vehicle.js.map
