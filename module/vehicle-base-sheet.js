import { ValidatedDialog } from "./ValidatedDialog.js";
import { BaseActorSheet } from "./actor-base-sheet.js";
export class VehicleBaseActorSheet extends BaseActorSheet {
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".crew-delete").on("click", this._onCrewDelete.bind(this));
        html.find(".crew-roll").on("click", this._onCrewSkillRoll.bind(this));
        html.find(".crew-show").on("click", this._onCrewShow.bind(this));
    }
    async _onCrewShow(event) {
        var _a, _b;
        event.preventDefault();
        event.stopPropagation();
        const li = $(event.currentTarget).parents(".item");
        const crewActor = (_a = game.actors) === null || _a === void 0 ? void 0 : _a.get(li.data("crewId"));
        (_b = crewActor === null || crewActor === void 0 ? void 0 : crewActor.sheet) === null || _b === void 0 ? void 0 : _b.render(true);
    }
    async _onCrewDelete(event) {
        if (this.actor.type == "character" ||
            this.actor.type == "npc" ||
            this.actor.type == "faction") {
            return;
        }
        const actor = this.actor;
        const li = $(event.currentTarget).parents(".item");
        const performDelete = await new Promise((resolve) => {
            Dialog.confirm({
                title: game.i18n.format("swnr.deleteCrew", {
                    name: li.data("crewName"),
                }),
                yes: () => resolve(true),
                no: () => resolve(false),
                content: game.i18n.format("swnr.deleteCrew", {
                    name: li.data("crewName"),
                    actor: this.actor.name,
                }),
            });
        });
        if (!performDelete)
            return;
        li.slideUp(200, () => {
            requestAnimationFrame(() => {
                actor.removeCrew(li.data("crewId"));
            });
        });
    }
    async _onCrewSkillRoll(event) {
        var _a, _b, _c, _d;
        event.preventDefault();
        event.stopPropagation();
        const li = $(event.currentTarget).parents(".item");
        const crewActor = (_a = game.actors) === null || _a === void 0 ? void 0 : _a.get(li.data("crewId"));
        if (!crewActor) {
            (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error(`${li.data("crewName")} no longer exists`);
            return;
        }
        const skills = crewActor.itemTypes.skill;
        const isChar = crewActor.type == "character" ? true : false;
        const dialogData = {
            actor: crewActor,
            skills: skills,
            isChar,
        };
        const template = "systems/swnr/templates/dialogs/roll-skill-crew.html";
        const html = await renderTemplate(template, dialogData);
        const _rollForm = async (html) => {
            var _a, _b, _c, _d, _e;
            const rollMode = game.settings.get("core", "rollMode");
            const form = html[0].querySelector("form");
            const dice = form.querySelector('[name="dicepool"]')
                .value;
            const modifier = parseInt((_a = form.querySelector('[name="modifier"]')) === null || _a === void 0 ? void 0 : _a.value);
            const skillId = (_b = form.querySelector('[name="skill"]')) === null || _b === void 0 ? void 0 : _b.value;
            const skill = crewActor.getEmbeddedDocument("Item", skillId);
            const useNPCSkillBonus = ((_c = (form.querySelector('[name="useNPCSkillBonus"]'))) === null || _c === void 0 ? void 0 : _c.checked)
                ? true
                : false;
            const npcSkillBonus = useNPCSkillBonus && crewActor.type == "npc"
                ? crewActor.data.data.skillBonus
                : 0;
            const skillBonus = skill ? skill.data.data.rank : npcSkillBonus;
            const statName = (_d = form.querySelector('[name="stat"]')) === null || _d === void 0 ? void 0 : _d.value;
            const stat = ((_e = crewActor.data.data["stats"]) === null || _e === void 0 ? void 0 : _e[statName]) || {
                mod: 0,
            };
            const formula = `${dice} + @stat + @skillBonus + @modifier`;
            const roll = new Roll(formula, {
                skillBonus,
                modifier,
                stat: stat.mod,
            });
            const skillName = skill ? skill.name : "No Skill";
            const statNameDisply = statName
                ? game.i18n.localize("swnr.stat.short." + statName)
                : "No Stat";
            const title = `${game.i18n.localize("swnr.chat.skillCheck")}: ${statNameDisply}/${skillName}`;
            await roll.roll({ async: true });
            roll.toMessage({
                speaker: { alias: crewActor.name },
                flavor: title,
            }, { rollMode });
        };
        (_c = this.popUpDialog) === null || _c === void 0 ? void 0 : _c.close();
        this.popUpDialog = new ValidatedDialog({
            title: game.i18n.format("swnr.dialog.skillRoll", {
                actorName: crewActor === null || crewActor === void 0 ? void 0 : crewActor.name,
            }),
            content: html,
            default: "roll",
            buttons: {
                roll: {
                    label: game.i18n.localize("swnr.chat.roll"),
                    callback: _rollForm,
                },
            },
        }, {
            classes: ["swnr"],
        });
        (_d = this.popUpDialog) === null || _d === void 0 ? void 0 : _d.render(true);
    }
}
Hooks.on("dropActorSheetData", (actor, actorSheet, data) => {
    if (data.type == "Actor") {
        const payload = data["id"] ? data["id"] : data["uuid"].split(".", 2)[1];
        if (actor.type == "ship") {
            const shipActor = actor;
            shipActor.addCrew(payload);
        }
        else if (actor.type == "mech") {
            const mechActor = actor;
            mechActor.addCrew(payload);
        }
        else if (actor.type == "drone") {
            const droneActor = actor;
            droneActor.addCrew(payload);
        }
        else if (actor.type == "vehicle") {
            const vActor = actor;
            vActor.addCrew(payload);
        }
    }
});
// Compare ship hull sizes.
// -1 ship1 is smaller, 0 same, 1 ship1 is larger
function compareShipClass(ship1, ship2) {
    const sizeMap = {
        fighter: 0,
        frigate: 1,
        cruiser: 2,
        capital: 3,
    };
    const size1 = sizeMap[ship1] ? sizeMap[ship1] : 0;
    const size2 = sizeMap[ship2] ? sizeMap[ship2] : 0;
    return size1 - size2;
}
// Compare mech hull sizes.
// <0 ship1 is smaller, 0 same, >0 ship1 is larger
function compareMechClass(ship1, ship2) {
    const sizeMap = {
        suit: 0,
        light: 1,
        heavy: 2,
    };
    const size1 = sizeMap[ship1] ? sizeMap[ship1] : 0;
    const size2 = sizeMap[ship2] ? sizeMap[ship2] : 0;
    return size1 - size2;
}
// Compare vehicle hull sizes.
// <0 ship1 is smaller, 0 same, >0 ship1 is larger
function compareVehicleClass(ship1, ship2) {
    const sizeMap = {
        s: 0,
        m: 1,
        l: 2,
    };
    const size1 = sizeMap[ship1] ? sizeMap[ship1] : 0;
    const size2 = sizeMap[ship2] ? sizeMap[ship2] : 0;
    return size1 - size2;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("preCreateItem", (item, data, options, id) => {
    var _a, _b, _c, _d, _e, _f;
    if (item.type == "shipWeapon" ||
        item.type == "shipDefense" ||
        item.type == "shipFitting") {
        if (((_a = item.parent) === null || _a === void 0 ? void 0 : _a.type) == "ship" ||
            ((_b = item.parent) === null || _b === void 0 ? void 0 : _b.type) == "mech" ||
            ((_c = item.parent) === null || _c === void 0 ? void 0 : _c.type) == "vehicle") {
            if (item.name == "New Item" ||
                item.name == "New Weapon" ||
                item.name == "New Defense" ||
                item.name == "New Fitting") {
                //ugly but works for now. need a better way to check.
                return;
            }
            //TODO fix. This is get around Typescript complaints. Know we are valid by above if
            const shipItem = item;
            const data = shipItem.data.data;
            if (item.parent.type == "ship" && shipItem.data.data.type == "ship") {
                const shipClass = item.parent.data.data.shipClass;
                if (data.minClass != "" &&
                    compareShipClass(shipClass, data.minClass) < 0) {
                    (_d = ui.notifications) === null || _d === void 0 ? void 0 : _d.error(`Item minClass (${data.minClass}) is too large for (${shipClass}). Still adding. `);
                }
            }
            else if (item.parent.type == "mech" &&
                shipItem.data.data.type == "mech") {
                const mechClass = item.parent.data.data.mechClass;
                if (data.minClass != "" &&
                    compareMechClass(mechClass, data.minClass) < 0) {
                    (_e = ui.notifications) === null || _e === void 0 ? void 0 : _e.error(`Item minClass (${data.minClass}) is too large for (${mechClass}). Still adding. `);
                }
            }
            else if (item.parent.type == "vehicle" &&
                shipItem.data.data.type == "vehicle") {
                const vehicleClass = item.parent.data.data.size;
                if (data.minClass != "" &&
                    compareVehicleClass(vehicleClass, data.minClass) < 0) {
                    (_f = ui.notifications) === null || _f === void 0 ? void 0 : _f.error(`Item minClass (${data.minClass}) is too large for (${vehicleClass}). Still adding. `);
                }
            }
        }
        else {
            //console.log('Only ship items can go to a ship?', item);
        }
    }
    return item;
});

//# sourceMappingURL=vehicle-base-sheet.js.map
