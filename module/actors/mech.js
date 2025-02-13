import { SWNRBaseActor } from "../base-actor.js";
export class SWNRMechActor extends SWNRBaseActor {
    getRollData() {
        this.data._source.data;
        const data = super.getRollData();
        // data.itemTypes = <SWNRCharacterData["itemTypes"]>this.itemTypes;
        return data;
    }
    prepareDerivedData() {
        const data = this.data.data;
        const mechClass = data.mechClass;
        let mechMass = data.mass.max;
        let mechPower = data.power.max;
        let mechHardpoint = data.hardpoints.max;
        let multiplier = 1;
        if (mechClass == "light") {
            multiplier = 2;
        }
        else if (mechClass == "heavy") {
            multiplier = 4;
        }
        const mechInventory = this.items.filter((i) => i.type === "shipDefense" ||
            i.type === "shipWeapon" ||
            i.type === "shipFitting");
        for (let i = 0; i < mechInventory.length; i++) {
            const item = mechInventory[i];
            let itemMass = item.data.data.mass;
            let itemPower = item.data.data.power;
            if (item.data.data.massMultiplier) {
                itemMass *= multiplier;
            }
            if (item.data.data.powerMultiplier) {
                itemPower *= multiplier;
            }
            mechMass -= itemMass;
            mechPower -= itemPower;
            if (item.type == "shipWeapon") {
                const itemHardpoint = item.data.data["hardpoint"];
                if (itemHardpoint) {
                    mechHardpoint -= itemHardpoint;
                }
            }
        }
        data.power.value = mechPower;
        data.mass.value = mechMass;
        data.hardpoints.value = mechHardpoint;
    }
    async addCrew(actorId) {
        var _a, _b;
        const actor = (_a = game.actors) === null || _a === void 0 ? void 0 : _a.get(actorId);
        if (actor) {
            const crewMembers = this.data.data.crewMembers;
            //Only add crew once
            if (crewMembers.indexOf(actorId) == -1) {
                //only one crew member allowed
                if (crewMembers.length == 1) {
                    // Swap
                    crewMembers[0] = actorId;
                    await this.update({
                        "data.crewMembers": crewMembers,
                    });
                }
                else {
                    // No crew member
                    let crew = this.data.data.crew.current;
                    crew += 1;
                    crewMembers.push(actorId);
                    await this.update({
                        "data.crew.current": crew,
                        "data.crewMembers": crewMembers,
                    });
                }
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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async _preCreate(actorDataConstructorData, options, user) {
        await super._preCreate(actorDataConstructorData, options, user);
        if (actorDataConstructorData.type &&
            this.data._source.img == "icons/svg/mystery-man.svg") {
            const mechImg = "systems/swnr/assets/icons/mech.png";
            this.data._source.img = mechImg;
        }
    }
}
export const document = SWNRMechActor;
export const name = "mech";

//# sourceMappingURL=mech.js.map
