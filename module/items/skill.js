import { SWNRBaseItem } from "./../base-item.js";
import { ValidatedDialog } from "../ValidatedDialog.js";
export class SWNRSkill extends SWNRBaseItem {
    async rollSkill(skillName, statShortName, statMod, dice, skillRank, modifier) {
        const rollMode = game.settings.get("core", "rollMode");
        const formula = `${dice} + @stat + @skill + @modifier`;
        const roll = new Roll(formula, {
            skill: skillRank,
            modifier: modifier,
            stat: statMod,
        });
        await roll.roll({ async: true });
        const title = `${game.i18n.localize("swnr.chat.skillCheck")}: ${statShortName}/${skillName}`;
        roll.toMessage({
            speaker: ChatMessage.getSpeaker(),
            flavor: title,
        }, { rollMode });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async roll(shiftKey = false) {
        var _a, _b, _c, _d, _e;
        const skillData = this.data.data;
        const template = "systems/swnr/templates/dialogs/roll-skill.html";
        if (this.actor == null) {
            const message = `Called rollSkill without an actor.`;
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error(message);
            return;
        }
        else if (this.actor.type != "character") {
            (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error("Calling roll skill on non-character");
            return;
        }
        const skillName = this.name;
        // Set to not ask and just roll
        if (!shiftKey && this.data.data.remember && this.data.data.remember.use) {
            const modifier = this.data.data.remember.modifier;
            const defaultStat = this.data.data.defaultStat;
            const dice = this.data.data.pool;
            const skillRank = this.data.data.rank;
            if (defaultStat == "ask" || dice == "ask") {
                (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.info("Quick roll set, but dice or stat is set to ask");
            }
            else {
                const stat = ((_d = this.actor) === null || _d === void 0 ? void 0 : _d.data.data["stats"][defaultStat]) || {
                    mod: 0,
                };
                const statShortName = game.i18n.localize("swnr.stat.short." + defaultStat);
                this.rollSkill(skillName, statShortName, stat.mod, dice, skillRank, modifier);
                return;
            }
        }
        const modifier = this.data.data.remember && this.data.data.remember.modifier
            ? this.data.data.remember.modifier
            : 0;
        const title = `${game.i18n.localize("swnr.chat.skillCheck")}: ${skillName}`;
        const dialogData = {
            title: title,
            skillName: skillName,
            skill: skillData,
            data: this.actor.data,
            modifier,
        };
        const html = await renderTemplate(template, dialogData);
        const _doRoll = async (html) => {
            var _a, _b, _c, _d, _e;
            const form = html[0].querySelector("form");
            const dice = form.querySelector('[name="dicepool"]')
                .value;
            const statShortNameForm = (form.querySelector('[name="stat"]')).value;
            if (["str", "dex", "con", "int", "wis", "cha"].includes(statShortNameForm) == false) {
                (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error("Stat must be set and not ask");
                return;
            }
            if (["2d6", "3d6kh2", "4d6kh2"].includes(dice) == false) {
                (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error("Dice must be set and not ask");
                return;
            }
            const stat = ((_c = this.actor) === null || _c === void 0 ? void 0 : _c.data.data["stats"][statShortNameForm]) || {
                mod: 0,
            };
            const modifier = (form.querySelector('[name="modifier"]')).value;
            if (Number.isNaN(Number(modifier))) {
                (_d = ui.notifications) === null || _d === void 0 ? void 0 : _d.error("Modifier is not a number");
                return;
            }
            const statShortName = game.i18n.localize("swnr.stat.short." + statShortNameForm);
            // If remember is checked, set the skill and data
            const remember = ((_e = (form.querySelector('[name="remember"]'))) === null || _e === void 0 ? void 0 : _e.checked)
                ? true
                : false;
            if (remember) {
                await this.update({
                    data: {
                        remember: {
                            use: true,
                            modifier: Number(modifier),
                        },
                        defaultStat: statShortNameForm,
                        pool: dice,
                    },
                });
            }
            this.rollSkill(skillName, statShortName, stat.mod, dice, skillData.rank, modifier);
        };
        (_e = this.popUpDialog) === null || _e === void 0 ? void 0 : _e.close();
        this.popUpDialog = new ValidatedDialog({
            title: title,
            content: html,
            default: "roll",
            buttons: {
                roll: {
                    label: game.i18n.localize("swnr.chat.roll"),
                    callback: _doRoll,
                },
            },
        }, {
            failCallback: () => {
                return;
            },
            classes: ["swnr"],
        });
        const s = this.popUpDialog.render(true);
        if (s instanceof Promise)
            await s;
    }
}
export const document = SWNRSkill;
export const name = "skill";

//# sourceMappingURL=skill.js.map
