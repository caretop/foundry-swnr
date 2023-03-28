import { SWNRBaseItem } from "../base-item.js";
import { ValidatedDialog } from "../ValidatedDialog.js";
export class SWNRShipWeapon extends SWNRBaseItem {
    get ammo() {
        return this.data.data.ammo;
    }
    get hasAmmo() {
        return this.ammo.type === "none" || this.ammo.value > 0;
    }
    async rollAttack(shooterId, shooterName, skillMod, statMod, abMod, mod, weaponAb, npcSkill) {
        var _a;
        const template = "systems/swnr/templates/chat/attack-roll.html";
        const rollData = {
            skillMod,
            statMod,
            abMod,
            mod,
            weaponAb,
            npcSkill,
        };
        const hitRollStr = "1d20 + @skillMod + @statMod + @abMod + @mod +@weaponAb +@npcSkill";
        const damageRollStr = `${this.data.data.damage} + @statMod`;
        const hitRoll = new Roll(hitRollStr, rollData);
        await hitRoll.roll({ async: true });

        let damageRoll = new Roll(damageRollStr, rollData);

        const traumaRoll = new Roll(this.data.data.traumaDie + "+@actor.traumaRb", rollData);
        await traumaRoll.roll({ async: true });

        if(traumaRoll.total>=6){
            damageRoll = new Roll("("+this.data.data.damage + "+@statmod)" + "*" + this.data.data.traumaRating, rollData);
        }

        await damageRoll.roll({ async: true });
        const diceTooltip = {
            hit: await hitRoll.render(),
            trauma: await traumaRoll.render(),
            damage: await damageRoll.render(),
            hitExplain: hitRollStr,
            damageExplain: damageRollStr,
        };
        
        if (this.data.data.ammo.type !== "none") {
            const newAmmoTotal = this.data.data.ammo.value - 1;
            await this.update({ "data.ammo.value": newAmmoTotal }, {});
            if (newAmmoTotal === 0)
                (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.warn(`Your ${this.name} is now out of ammo!`);
        }
        const dialogData = {
            weapon: this,
            hitRoll,
            damageRoll,
            diceTooltip,
        };
        const rollMode = game.settings.get("core", "rollMode");
        // const dice = hitRoll.dice.concat(damageRoll.dice)
        // const formula = dice.map(d => (<any>d).formula).join(' + ');
        // const results = dice.reduce((a, b) => a.concat(b.results), [])
        const diceData = Roll.fromTerms([
            PoolTerm.fromRolls([hitRoll, damageRoll]),
        ]);
        const chatContent = await renderTemplate(template, dialogData);
        const chatData = {
            speaker: { alias: shooterName },
            roll: JSON.stringify(diceData),
            content: chatContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        };
        getDocumentClass("ChatMessage").applyRollMode(chatData, rollMode);
        getDocumentClass("ChatMessage").create(chatData);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async roll(_shiftKey = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this.actor) {
            const message = `Called ship weapon.roll on item without an actor.`;
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error(message);
            new Error(message);
            return;
        }
        if (this.data.data.broken || this.data.data.destroyed) {
            (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error("Weapon is broken/disabled or destroyed. Cannot fire!");
            return;
        }
        if (!this.hasAmmo) {
            (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.error(`Your ${this.name} is out of ammo!`);
            return;
        }
        if (this.actor.type == "ship" ||
            this.actor.type == "mech" ||
            this.actor.type == "drone" ||
            this.actor.type == "vehicle") {
            let defaultGunnerId = null;
            // if there is one crew member or there is a gunner
            if (this.actor.data.data.crewMembers.length == 1) {
                defaultGunnerId = this.actor.data.data.crewMembers[0];
            }
            else if (this.actor.type == "ship") {
                defaultGunnerId = this.actor.data.data.roles.gunnery;
            }
            //get the gunner if exists
            let defaultGunner = null;
            if (defaultGunnerId) {
                const _temp = (_d = game.actors) === null || _d === void 0 ? void 0 : _d.get(defaultGunnerId);
                if (_temp && (_temp.type == "character" || _temp.type == "npc")) {
                    defaultGunner = _temp;
                }
            }
            const crewArray = [];
            if (this.actor.data.data.crewMembers) {
                for (let i = 0; i < this.actor.data.data.crewMembers.length; i++) {
                    const cId = this.actor.data.data.crewMembers[i];
                    const crewMember = (_e = game.actors) === null || _e === void 0 ? void 0 : _e.get(cId);
                    if (crewMember &&
                        (crewMember.type == "character" || crewMember.type == "npc")) {
                        crewArray.push(crewMember);
                    }
                }
            }
            const title = game.i18n.format("swnr.dialog.attackRoll", {
                actorName: (_f = this.actor) === null || _f === void 0 ? void 0 : _f.name,
                weaponName: this.name,
            });
            if (defaultGunner == null && crewArray.length > 0) {
                //There is no gunner. Use first crew as default
                defaultGunner = crewArray[0];
                defaultGunnerId = crewArray[0].id;
            }
            if ((defaultGunner === null || defaultGunner === void 0 ? void 0 : defaultGunner.type) == "npc" && crewArray.length > 0) {
                //See if we have a non NPC to set as gunner to get skills and attr
                for (const char of crewArray) {
                    if (char.type == "character") {
                        defaultGunner = char;
                        defaultGunnerId = char.id;
                        break;
                    }
                }
            }
            const dialogData = {
                actor: this.actor.data,
                weapon: this.data.data,
                defaultSkill1: "Shoot",
                defaultSkill2: "Combat/Gunnery",
                defaultStat: "int",
                gunner: defaultGunner,
                gunnerId: defaultGunnerId,
                crewArray: crewArray,
            };
            const template = "systems/swnr/templates/dialogs/roll-ship-attack.html";
            const html = await renderTemplate(template, dialogData);
            const _rollForm = async (html) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const form = html[0].querySelector("form");
                const mod = parseInt((_a = form.querySelector('[name="modifier"]')) === null || _a === void 0 ? void 0 : _a.value);
                const shooterId = (_b = (form.querySelector('[name="shooterId"]'))) === null || _b === void 0 ? void 0 : _b.value;
                const shooter = shooterId ? (_c = game.actors) === null || _c === void 0 ? void 0 : _c.get(shooterId) : null;
                // const dice = (<HTMLSelectElement>form.querySelector('[name="dicepool"]'))
                //   .value;
                const skillName = (_d = (form.querySelector('[name="skill"]'))) === null || _d === void 0 ? void 0 : _d.value;
                const statName = (_e = (form.querySelector('[name="stat"]'))) === null || _e === void 0 ? void 0 : _e.value;
                let skillMod = 0;
                let statMod = 0;
                let abMod = 0;
                const weaponAbStr = ((_f = form.querySelector('[name="weaponAb"]')) === null || _f === void 0 ? void 0 : _f.value) ||
                    "0";
                const npcSkillStr = ((_g = form.querySelector('[name="npcSkill"]')) === null || _g === void 0 ? void 0 : _g.value) ||
                    "0";
                const weaponAb = parseInt(weaponAbStr);
                const npcSkill = parseInt(npcSkillStr);
                let shooterName = "";
                if (shooter) {
                    if (skillName) {
                        // We need to look up by name
                        for (const skill of shooter.itemTypes.skill) {
                            if (skillName == skill.data.name) {
                                skillMod =
                                    skill.data.data["rank"] < 0 ? -2 : skill.data.data["rank"];
                            }
                        }
                    } //end skill
                    if (statName) {
                        const sm = (_h = shooter.data.data["stats"]) === null || _h === void 0 ? void 0 : _h[statName].mod;
                        if (sm) {
                            console.log("setting stat mod", sm);
                            statMod = sm;
                        }
                    }
                    if (shooter.type == "character") {
                        abMod = shooter.data.data.ab;
                    }
                    shooterName = shooter.name;
                }
                this.rollAttack(shooterId, shooterName, skillMod, statMod, abMod, mod, weaponAb, npcSkill);
            };
            (_g = this.popUpDialog) === null || _g === void 0 ? void 0 : _g.close();
            this.popUpDialog = new ValidatedDialog({
                title: title,
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
            this.popUpDialog.render(true);
        }
        else {
            (_h = ui.notifications) === null || _h === void 0 ? void 0 : _h.error("todo");
        }
    }
}
export const document = SWNRShipWeapon;
export const name = "shipWeapon";

//# sourceMappingURL=shipWeapon.js.map
