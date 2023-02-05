import { SWNRBaseActor } from "../base-actor.js";
import { DRONE_MODEL_DATA } from "./vehicle-hull-base.js";
export class SWNRDroneActor extends SWNRBaseActor {
    getRollData() {
        this.data._source.data;
        const data = super.getRollData();
        // data.itemTypes = <SWNRCharacterData["itemTypes"]>this.itemTypes;
        return data;
    }
    prepareDerivedData() {
        const data = this.data.data;
        //TODO
        data.fittings.value = data.fittings.max;
        const shipInventory = this.items.filter((i) => i.type === "shipDefense" ||
            i.type === "shipWeapon" ||
            i.type === "shipFitting");
        const totalMass = shipInventory
            .map((i) => i.data.data.mass)
            .reduce((i, n) => i + n, 0);
        data.fittings.value -= totalMass;
    }
    // Convert weapons to shipWeapons to use same weapon rolling interface
    async createEmbeddedDocuments(itemType, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemArray, options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        itemArray = itemArray.map((i) => {
            if (i.type !== "weapon") {
                return i;
            }
            else {
                return {
                    name: i.name,
                    type: "shipWeapon",
                    data: {
                        mass: 1,
                        cost: i.data.cost,
                        power: 0,
                        ammo: i.data.ammo,
                        damage: i.data.damage,
                        type: "drone",
                    },
                };
            }
        });
        return super.createEmbeddedDocuments(itemType, itemArray, options);
    }
    async addCrew(actorId) {
        var _a, _b, _c;
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
                const itemName = this.name + " " + this.data.data.model;
                actor.createEmbeddedDocuments("Item", [
                    {
                        name: itemName,
                        type: "item",
                        img: "systems/swnr/assets/icons/drone.png",
                        data: {
                            encumbrance: this.data.data.enc,
                        },
                    },
                ], {});
                (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.info(`Created an item "${itemName}" on ${actor.name}'s sheet`);
            }
        }
        else {
            (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.error("Actor added no longer exists");
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
    async applyDefaulStats(modelType) {
        if (DRONE_MODEL_DATA[modelType]) {
            await this.update(DRONE_MODEL_DATA[modelType]);
        }
        else {
            console.log("drone model type not found " + modelType);
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async _preCreate(actorDataConstructorData, options, user) {
        await super._preCreate(actorDataConstructorData, options, user);
        if (actorDataConstructorData.type &&
            this.data._source.img == "icons/svg/mystery-man.svg") {
            const mechImg = "systems/swnr/assets/icons/drone.png";
            this.data._source.img = mechImg;
        }
    }
}
export const document = SWNRDroneActor;
export const name = "drone";

//# sourceMappingURL=drone.js.map
