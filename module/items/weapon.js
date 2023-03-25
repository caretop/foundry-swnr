import { SWNRBaseItem } from "./../base-item.js";
import { ValidatedDialog } from "../ValidatedDialog.js";
export class SWNRWeapon extends SWNRBaseItem {
    get ammo() {
        return this.data.data.ammo;
    }
    get canBurstFire() {
        return (this.ammo.burst &&
            (this.ammo.type === "infinite" ||
                (this.ammo.type !== "none" && this.ammo.value >= 5)));
    }
    get hasAmmo() {
        return (this.ammo.type === "none" ||
            this.ammo.type === "infinite" ||
            this.ammo.value > 0);
    }
    async rollAttack(damageBonus, stat, skillMod, modifier, useBurst) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this.actor) {
            const message = `Called rollAttack on item without an actor.`;
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error(message);
            throw new Error(message);
        }
        if (!this.hasAmmo) {
            (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error(`Your ${this.name} is out of ammo!`);
            return;
        }
        if (useBurst &&
            this.ammo.type !== "infinite" &&
            this.ammo.type !== "none" &&
            this.ammo.value < 5) {
            (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.error(`Your ${this.name} is does not have enough ammo to burst!`);
            return;
        }
        //console.log({ skillMod, stat, modifier, useBurst, damageBonus });
        const template = "systems/swnr/templates/chat/attack-roll.html";
        const burstFire = useBurst ? 2 : 0;
        // 1d20 + attack bonus (PC plus weapon) + skill mod (-2 if untrained)
        // weapon dice + stat mod + skill if enabled or punch.
        // shock: damage + stat
        // const skill = this.actor.items.filter(w => w.)
        // Burst is +2 To hit and to damage
        const rollData = {
            actor: this.actor.getRollData(),
            weapon: this.data.data,
            hitRoll: undefined,
            stat,
            burstFire,
            modifier,
            damageBonus,
            effectiveSkillRank: skillMod < 0 ? -2 : skillMod,
            shockDmg: ((_d = this.data.data.shock) === null || _d === void 0 ? void 0 : _d.dmg) > 0 ? this.data.data.shock.dmg : 0,
        };
        const hitRoll = new Roll("1d20 + @burstFire + @modifier + @actor.ab + @weapon.ab + @stat + @effectiveSkillRank", rollData);
        await hitRoll.roll({ async: true });
        const hitExplainTip = "1d20 +burst +mod +CharAB +WpnAB +Stat +Skill";
        rollData.hitRoll = +((_f = (_e = hitRoll.dice[0].total) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : 0);

        let damageRoll = new Roll("("+this.data.data.damage + "+@burstFire + @stat + @damageBonus)", rollData);    

        const traumaRoll = new Roll(this.data.data.traumaDie + "+@actor.traumaRb", rollData);
        await traumaRoll.roll({ async: true });

        //const multDamageRoll = new Roll(this.data.data.damage*2 + " + @burstFire*2 + @stat*2 + @damageBonus*2", rollData);
        if(traumaRoll.total>=6){
            damageRoll = new Roll("("+this.data.data.damage + "+@burstFire + @stat + @damageBonus)" + "*" + this.data.data.traumaRating,rollData);
        }
       
        await damageRoll.roll({ async: true });
       
        const damageExplainTip = "roll +burst +statBonus +dmgBonus";
        const diceTooltip = {
            hit: await hitRoll.render(),
            trauma: await traumaRoll.render(),
            damage: await damageRoll.render(),
            hitExplain: hitExplainTip,
            damageExplain: damageExplainTip,
        };
        const rollArray = [hitRoll, damageRoll];
        // Placeholder for shock damage
        let shock_content = null;
        let shock_roll = null;
        // Show shock damage
        if (game.settings.get("swnr", "addShockMessage")) {
            if (this.data.data.shock && this.data.data.shock.dmg > 0) {
                shock_content = `Shock Damage  AC ${this.data.data.shock.ac}`;
                const _shockRoll = new Roll(" @shockDmg + @stat " +
                    (this.data.data.skillBoostsShock ? ` + ${damageBonus}` : ""), rollData);
                await _shockRoll.roll({ async: true });
                shock_roll = await _shockRoll.render();
                rollArray.push(_shockRoll);
            }
        }
        const dialogData = {
            actor: this.actor,
            weapon: this,
            hitRoll,
            stat,
            damageRoll,
            burstFire,
            modifier,
            effectiveSkillRank: rollData.effectiveSkillRank,
            diceTooltip,
            ammoRatio: Math.clamped(Math.floor((this.data.data.ammo.value * 20) / this.data.data.ammo.max), 0, 20),
            shock_roll,
            shock_content,
        };
        const rollMode = game.settings.get("core", "rollMode");
        // const dice = hitRoll.dice.concat(damageRoll.dice)
        // const formula = dice.map(d => (<any>d).formula).join(' + ');
        // const results = dice.reduce((a, b) => a.concat(b.results), [])
        const diceData = Roll.fromTerms([PoolTerm.fromRolls(rollArray)]);
        if (this.data.data.ammo.type !== "none" &&
            this.data.data.ammo.type !== "infinite") {
            const newAmmoTotal = this.data.data.ammo.value - 1 - (burstFire + 2);
            await this.update({ "data.ammo.value": newAmmoTotal }, {});
            if (newAmmoTotal === 0)
                (_g = ui.notifications) === null || _g === void 0 ? void 0 : _g.warn(`Your ${this.name} is now out of ammo!`);
        }
        const chatContent = await renderTemplate(template, dialogData);
        // TODO: break up into two rolls and chain them?
        // const promise = game.dice5d
        //   ? game.dice5d.showForRoll(diceData)
        //   : Promise.resolve();
        // promise.then(() => {
        const chatData = {
            speaker: ChatMessage.getSpeaker({ actor: (_h = this.actor) !== null && _h !== void 0 ? _h : undefined }),
            roll: JSON.stringify(diceData),
            content: chatContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        };
        getDocumentClass("ChatMessage").applyRollMode(chatData, rollMode);
        getDocumentClass("ChatMessage").create(chatData);
        // });
    }
    async roll(shiftKey = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this.actor) {
            const message = `Called weapon.roll on item without an actor.`;
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error(message);
            new Error(message);
            return;
        }
        if (!this.hasAmmo) {
            (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error(`Your ${this.name} is out of ammo!`);
            return;
        }
        const title = game.i18n.format("swnr.dialog.attackRoll", {
            actorName: (_c = this.actor) === null || _c === void 0 ? void 0 : _c.name,
            weaponName: this.name,
        });
        const ammo = this.data.data.ammo;
        const burstFireHasAmmo = ammo.type !== "none" && ammo.burst && ammo.value >= 5;
        let dmgBonus = 0;
        // for finesse weapons take the stat with the higher mod
        let statName = this.data.data.stat;
        const secStatName = this.data.data.secondStat;
        // check if there is 2nd stat name and its mod is better
        if (secStatName != null &&
            secStatName != "none" &&
            ((_d = this.actor.data.data["stats"]) === null || _d === void 0 ? void 0 : _d[statName].mod) <
                ((_e = this.actor.data.data["stats"]) === null || _e === void 0 ? void 0 : _e[secStatName].mod)) {
            statName = secStatName;
        }
        // Set to not ask and just roll
        if (!shiftKey && this.data.data.remember && this.data.data.remember.use) {
            const stat = ((_f = this.actor.data.data["stats"]) === null || _f === void 0 ? void 0 : _f[statName]) || {
                mod: 0,
            };
            const skill = this.actor.getEmbeddedDocument("Item", this.data.data.skill);
            const skillMod = skill.data.data.rank < 0 ? -2 : skill.data.data.rank;
            if (((_g = this.actor) === null || _g === void 0 ? void 0 : _g.type) == "character") {
                dmgBonus = this.data.data.skillBoostsDamage ? skill.data.data.rank + this.actor.data.data.bonusDamage : 0;
            }
            return this.rollAttack(dmgBonus, stat.mod, skillMod, this.data.data.remember.modifier, this.data.data.remember.burst);
        }
        const dialogData = {
            actor: this.actor.data,
            weapon: this.data.data,
            skills: this.actor.itemTypes.skill,
            statName: statName,
            skill: this.data.data.skill,
            burstFireHasAmmo,
        };
        const template = "systems/swnr/templates/dialogs/roll-attack.html";
        const html = await renderTemplate(template, dialogData);
        const _rollForm = async (html) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const form = html[0].querySelector("form");
            const modifier = parseInt((_a = form.querySelector('[name="modifier"]')) === null || _a === void 0 ? void 0 : _a.value);
            const burstFire = ((_b = (form.querySelector('[name="burstFire"]'))) === null || _b === void 0 ? void 0 : _b.checked)
                ? true
                : false;
            const skillId = ((_c = form.querySelector('[name="skill"]')) === null || _c === void 0 ? void 0 : _c.value) ||
                this.data.data.skill;
            if (!this.actor) {
                console.log("Error actor no longer exists ");
                return;
            }
            let skillMod = 0;
            const skill = this.actor.getEmbeddedDocument("Item", skillId);
            if (((_d = this.actor) === null || _d === void 0 ? void 0 : _d.type) == "npc" && html.find('[name="skilled"]')) {
                const npcSkillMod = html.find('[name="skilled"]').prop("checked")
                    ? this.actor.data.data["skillBonus"]
                    : 0;
                if (npcSkillMod)
                    skillMod = npcSkillMod;
            }
            else {
                skillMod = skill.data.data.rank < 0 ? -2 : skill.data.data.rank;
            }
            // for finesse weapons take the stat with the higher mod
            let statName = this.data.data.stat;
            const secStatName = this.data.data.secondStat;
            // check if there is 2nd stat name and its mod is better
            if (secStatName != null &&
                secStatName != "none" &&
                ((_e = this.actor.data.data["stats"]) === null || _e === void 0 ? void 0 : _e[statName].mod) <
                    ((_f = this.actor.data.data["stats"]) === null || _f === void 0 ? void 0 : _f[secStatName].mod)) {
                statName = secStatName;
            }
            const stat = ((_g = this.actor.data.data["stats"]) === null || _g === void 0 ? void 0 : _g[statName]) || {
                mod: 0,
            };
            // 1d20 + attack bonus (PC plus weapon) + skill mod (-2 if untrained)
            // weapon dice + stat mod + skill if enabled or punch.
            // shock: damage + stat
            // const skill = this.actor.items.filter(w => w.)
            // Burst is +2 To hit and to damage
            if (((_h = this.actor) === null || _h === void 0 ? void 0 : _h.type) == "character") {
                dmgBonus = this.data.data.skillBoostsDamage ? skill.data.data.rank + this.actor.data.data.bonusDamage : 0;
            }
            else if (((_j = this.actor) === null || _j === void 0 ? void 0 : _j.type) == "npc") {
                dmgBonus = this.data.data.skillBoostsDamage
                    ? this.actor.data.data.skillBonus
                    : 0;
                if (this.actor.data.data.attacks.bonusDamage) {
                    dmgBonus += this.actor.data.data.attacks.bonusDamage;
                }
            }
            // If remember is checked, set the skill and data
            const remember = ((_k = (form.querySelector('[name="remember"]'))) === null || _k === void 0 ? void 0 : _k.checked)
                ? true
                : false;
            if (remember) {
                await this.update({
                    data: {
                        remember: {
                            use: true,
                            burst: burstFire,
                            modifier: modifier,
                        },
                        skill: skillId,
                    },
                });
            }
            return this.rollAttack(dmgBonus, stat.mod, skillMod, modifier, burstFire);
            // END roll form
        };
        (_h = this.popUpDialog) === null || _h === void 0 ? void 0 : _h.close();
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
            failCallback: () => {
                var _a;
                (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error(game.i18n.localize("swnr.roll.skillNeeded"));
            },
            classes: ["swnr"],
        });
        this.popUpDialog.render(true);
    }
}
export const document = SWNRWeapon;
export const name = "weapon";

//# sourceMappingURL=weapon.js.map
