import { calculateStats, initSkills, initCompendSkills, limitConcurrency, } from "../utils.js";
import { ValidatedDialog } from "../ValidatedDialog.js";
import { BaseActorSheet } from "../actor-base-sheet.js";
// < SWNRCharacterData, SWNRCharacterActor>
export class CharacterActorSheet extends BaseActorSheet {
    _injectHTML(html) {
        html
            .find(".window-content")
            .addClass(["cq", "overflow-y-scroll", "relative"]);
        super._injectHTML(html);
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["swnr", "sheet", "actor", "character", "test broken"],
            template: "systems/swnr/templates/actors/character-sheet.html",
            width: 750,
            height: 600,
            tabs: [
                {
                    navSelector: ".pc-sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "combat",
                },
            ],
        });
    }
    activateListeners(html) {
        super.activateListeners(html);
        html
            .find(".resource-list-val")
            .on("change", this._onResourceName.bind(this));
        html
            .find(".resource-delete")
            .on("click", this._onResourceDelete.bind(this));
        html.find(".statRoll").on("click", this._onStatsRoll.bind(this));
        html.find(".skill").on("click", this._onSkillRoll.bind(this));
        html.find(".save").on("click", this._onSaveThrow.bind(this));
        html.find(".item-level-up").on("click", this._onItemLevelUp.bind(this));
        html
            .find(".resource-create")
            .on("click", this._onResourceCreate.bind(this));
        html
            .find(".hp-label")
            .on("click", limitConcurrency(this._onHpRoll.bind(this)));
        html.find(".rest-button").on("click", this._onRest.bind(this));
        html.find(".soak-reset-button").on("click", this._onResetSoak.bind(this));
        html
            .find('[name="data.health.max"]')
            .on("input", this._onHPMaxChange.bind(this));
        html
            .find(".item.weapon .item-name")
            .on("click", this._onWeaponRoll.bind(this));
        html.find(".skill-load-button").on("click", this._onLoadSkills.bind(this));
        html.find(".attrClick").on("click", this._onAttrRoll.bind(this));
        // Drag events for macros.
        if (this.actor.isOwner) {
            const handler = (ev) => this._onDragStart(ev);
            // Find all items on the character sheet.
            html.find(".item").each((i, li) => {
                // Ignore for the header row.
                if (li.classList.contains("item-header"))
                    return;
                // Add draggable attribute and dragstart listener.
                li.setAttribute("draggable", "true");
                li.addEventListener("dragstart", handler, false);
            });
        }
    }
    async _onAttrRoll(event) {
        var _a;
        event.preventDefault();
        const action = game.settings.get("swnr", "attrRoll");
        if (action === "none") {
            return;
        }
        const attrShort = $(event.currentTarget).data("attr");
        const attr = this.actor.data.data.stats[attrShort];
        const msg = game.i18n.format("swnr.chat.statRollFlavor", {
            name: (_a = this.actor) === null || _a === void 0 ? void 0 : _a.name,
            stat: attrShort,
        });
        const rollMode = game.settings.get("core", "rollMode");
        let formula = "d20";
        if (action == "d20" || action == "2d6") {
            if (action == "d20") {
                formula = `d20 + ${attr.mod}`;
            }
            else if (action == "2d6") {
                formula = `2d6 + ${attr.mod}`;
            }
            const roll = new Roll(formula);
            await roll.roll({ async: true });
            getDocumentClass("ChatMessage").create({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: msg,
                roll: JSON.stringify(roll),
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            });
        }
        else {
            const roll = new Roll(formula);
            await roll.roll({ async: true });
            let success = false;
            let target = `<${attr.total}`;
            if (action == "d20under") {
                success = roll.total ? roll.total < attr.total : false;
            }
            else if (action == "d20underEqual") {
                success = roll.total ? roll.total <= attr.total : false;
                target = `<=${attr.total}`;
            }
            const save_text = game.i18n.format(success
                ? game.i18n.localize("swnr.npc.saving.success")
                : game.i18n.localize("swnr.npc.saving.failure"), { actor: this.actor.name, target: target });
            const chatTemplate = "systems/swnr/templates/chat/save-throw.html";
            const chatDialogData = {
                saveRoll: await roll.render(),
                title: msg,
                save_text,
                success,
            };
            const chatContent = await renderTemplate(chatTemplate, chatDialogData);
            const chatData = {
                speaker: ChatMessage.getSpeaker(),
                roll: JSON.stringify(roll),
                content: chatContent,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            };
            getDocumentClass("ChatMessage").applyRollMode(chatData, rollMode);
            getDocumentClass("ChatMessage").create(chatData);
        }
    }
    async _onResourceName(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        const value = (_a = event.target) === null || _a === void 0 ? void 0 : _a.value;
        const resourceType = $(event.currentTarget).data("rlType");
        const idx = $(event.currentTarget).parents(".item").data("rlIdx");
        const resourceList = duplicate(this.actor.data.data.tweak.resourceList);
        resourceList[idx][resourceType] = value;
        await this.actor.update({ "data.tweak.resourceList": resourceList });
    }
    async _onResourceDelete(event) {
        event.preventDefault();
        event.stopPropagation();
        const idx = $(event.currentTarget).parents(".item").data("rlIdx");
        const resourceList = duplicate(this.actor.data.data.tweak.resourceList);
        resourceList.splice(idx, 1);
        await this.actor.update({ "data.tweak.resourceList": resourceList });
    }
    async _onHPMaxChange(event) {
        event.preventDefault();
        //console.log("Changing HP Max" , this.actor);
        await this.actor.update({
            "data.health_max_modified": this.actor.data.data.level.value,
        });
    }
    async _onResourceCreate(event) {
        event.preventDefault();
        //console.log("Changing HP Max" , this.actor);
        let resourceList = this.actor.data.data.tweak.resourceList;
        if (!resourceList) {
            resourceList = [];
        }
        resourceList.push({ name: "Resource X", value: 0, max: 1 });
        await this.actor.update({
            "data.tweak.resourceList": resourceList,
        });
    }
    async _onLoadSkills(event) {
        var _a;
        event.preventDefault();
        const _addSkills = async (html) => {
            const form = html[0].querySelector("form");
            const skillList = (form.querySelector('[name="skillList"]:checked'));
            const extra = (form.querySelector("[name=extra]:checked"));
            if (skillList && skillList.value === "compendiumList") {
                initCompendSkills(this.actor);
            }
            else {
                initSkills(this.actor, skillList.value);
            }
            if (extra)
                initSkills(this.actor, extra.value);
            return;
        };
        const template = "systems/swnr/templates/dialogs/add-bulk-skills.html";
        const html = await renderTemplate(template, {});
        (_a = this.popUpDialog) === null || _a === void 0 ? void 0 : _a.close();
        this.popUpDialog = new Dialog({
            title: game.i18n.format("swnr.dialog.add-bulk-skills", {
                actor: this.actor.name,
            }),
            content: html,
            default: "addSkills",
            buttons: {
                addSkills: {
                    label: game.i18n.localize("swnr.dialog.add-skills"),
                    callback: _addSkills,
                },
            },
        }, { classes: ["swnr"] });
        return await this.popUpDialog.render(true);
    }
    async _onItemLevelUp(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        event.preventDefault();
        event.stopPropagation();
        const wrapper = $(event.currentTarget).parents(".item");
        const item = (this.actor.getEmbeddedDocument("Item", wrapper.data("itemId")));
        if (item.type == "skill") {
            const skill = item;
            const rank = skill.data.data.rank;
            if (rank > 0) {
                const lvl = this.actor.data.data.level.value;
                if (rank == 1 && lvl < 3) {
                    (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error("Must be at least level 3 (edit manually to override)");
                    return;
                }
                else if (rank == 2 && lvl < 6) {
                    (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error("Must be at least level 6 (edit manually to override)");
                    return;
                }
                else if (rank == 3 && lvl < 9) {
                    (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.error("Must be at least level 9 (edit manually to override)");
                    return;
                }
                else if (rank > 3) {
                    (_d = ui.notifications) === null || _d === void 0 ? void 0 : _d.error("Cannot auto-level above 4");
                    return;
                }
            }
            const skillCost = rank + 2;
            const isPsy = skill.data.data.source.toLocaleLowerCase() ===
                game.i18n.localize("swnr.skills.labels.psionic").toLocaleLowerCase()
                ? true
                : false;
            const skillPointsAvail = isPsy
                ? this.actor.data.data.unspentPsySkillPoints +
                    this.actor.data.data.unspentSkillPoints
                : this.actor.data.data.unspentSkillPoints;
            if (skillCost > skillPointsAvail) {
                (_e = ui.notifications) === null || _e === void 0 ? void 0 : _e.error(`Not enough skill points. Have: ${skillPointsAvail}, need: ${skillCost}`);
                return;
            }
            else if (isNaN(skillPointsAvail)) {
                (_f = ui.notifications) === null || _f === void 0 ? void 0 : _f.error(`Skill points not set`);
                return;
            }
            await skill.update({ "data.rank": rank + 1 });
            if (isPsy) {
                const newPsySkillPoints = Math.max(0, this.actor.data.data.unspentPsySkillPoints - skillCost);
                let newSkillPoints = this.actor.data.data.unspentSkillPoints;
                if (skillCost > this.actor.data.data.unspentPsySkillPoints) {
                    //Not enough psySkillPoints, dip into regular
                    newSkillPoints -=
                        skillCost - this.actor.data.data.unspentPsySkillPoints;
                }
                await this.actor.update({
                    "data.unspentSkillPoints": newSkillPoints,
                    "data.unspentPsySkillPoints": newPsySkillPoints,
                });
                (_g = ui.notifications) === null || _g === void 0 ? void 0 : _g.info(`Removed ${skillCost} from unspent skills, with at least one psychic skill point`);
            }
            else {
                const newSkillPoints = this.actor.data.data.unspentSkillPoints - skillCost;
                await this.actor.update({ "data.unspentSkillPoints": newSkillPoints });
                (_h = ui.notifications) === null || _h === void 0 ? void 0 : _h.info(`Removed ${skillCost} skill points`);
            }
        }
    }
    async _onWeaponRoll(event) {
        event.preventDefault();
        const itemId = event.currentTarget.parentElement.dataset.itemId;
        const weapon = (this.actor.getEmbeddedDocument("Item", itemId));
        return weapon.roll(event.shiftKey);
    }
    async _onSaveThrow(event) {
        event.preventDefault();
        const e = event.currentTarget;
        const save = e.dataset.saveType;
        if (!save)
            return;
        this.actor.rollSave(save);
    }
    async _onStatsRoll(event) {
        var _a;
        event.preventDefault();
        const title = `${game.i18n.localize("swnr.chat.statRoll")}: ${this.actor.name}`;
        const template = "systems/swnr/templates/dialogs/roll-stats.html";
        const dialogData = {
            diceOptions: ["3d6", "4d6kh3"],
        };
        const html = await renderTemplate(template, dialogData);
        const _doRoll = async (html) => {
            const rollMode = game.settings.get("core", "rollMode");
            const elements = html[0].querySelector("form");
            const dice = (elements.querySelector('[name="statpool"]')).value;
            const formula = new Array(6).fill(dice).join("+");
            const roll = new Roll(formula);
            await roll.roll({ async: true });
            const stats = {};
            ["str", "dex", "con", "int", "wis", "cha"].map((k, i) => {
                stats[k] = {
                    dice: roll.dice[i].results,
                    base: roll.dice[i].total,
                    boost: 0,
                    mod: 0,
                    bonus: 0,
                    total: 0,
                };
            });
            calculateStats(stats);
            const data = {
                actor: this.actor,
                stats,
                totalMod: Object.values(stats).reduce((s, v) => {
                    return s + v.mod;
                }, 0),
            };
            const chatContent = await renderTemplate("systems/swnr/templates/chat/stat-block.html", data);
            const chatMessage = getDocumentClass("ChatMessage");
            chatMessage.create(chatMessage.applyRollMode({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                roll: JSON.stringify(roll.toJSON()),
                content: chatContent,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            }, rollMode));
            return roll;
        };
        (_a = this.popUpDialog) === null || _a === void 0 ? void 0 : _a.close();
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
        return this.popUpDialog;
    }
    async _onRest(event) {
        event.preventDefault();
        const rest = async (isFrail) => {
            const data = this.actor.data.data;
            const newStrain = Math.max(data.systemStrain.value - 1, 0);
            const newHP = isFrail
                ? data.health.value
                : Math.min(data.health.value + data.level.value, data.health.max);
            await this.actor.update({
                data: {
                    systemStrain: { value: newStrain },
                    health: { value: newHP },
                    effort: { scene: 0, day: 0 },
                    tweak: {
                        extraEffort: {
                            scene: 0,
                            day: 0,
                        },
                    },
                },
            });
        };

        const d = new Dialog({
            title: game.i18n.localize("swnr.sheet.rest-title"),
            content: game.i18n.localize("swnr.sheet.rest-desc"),
            buttons: {
                yes: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Yes",
                    callback: () => rest(false),
                },
                frail: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Yes, but no HP",
                    callback: () => rest(true),
                },
                no: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "No",
                },
            },
            default: "no",
        }, {
            classes: ["swnr"],
        });
        d.render(true);
    }

    async _onResetSoak(event) {
        event.preventDefault();
        const data = this.actor.data.data;
        const newMaxSoak = data.soak.max
        await this.actor.update({
            data:{
                soak:{ value: newMaxSoak}
            }
        })
    }

    async _onHpRoll(event) {
        // 2e warrior/partial : +2
        // 1e psy 1d4, expert 1d6, warrior 1d8
        var _a, _b;
        event.preventDefault();
        const currentLevel = this.actor.data.data.level.value;
        const lastModified = this.actor.data.data["health_max_modified"];
        if (currentLevel <= lastModified) {
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.info("Not rolling hp: already rolled this level (or higher)");
            return;
        }
        // const lastLevel =
        // currentLevel === 1 ? 0 : this.actor.getFlag("swnr", "lastHpLevel");
        const health = this.actor.data.data.health;
        const currentHp = health.max;
        const hd = this.actor.data.data.hitDie;
        //todo: sort out health boosts from classes.
        const constBonus = this.actor.data.data.stats.con.mod;
        //console.log(currentLevel, this.actor.data.data.stats.con, this.actor.data.data.stats.con.mod)
        const perLevel = `max(${hd} + ${constBonus}, 1)`;
        const _rollHP = async () => {
            const hitArray = Array(currentLevel).fill(perLevel);
            const formula = hitArray.join("+");
            let msg = `Rolling Level ${currentLevel} HP: ${formula}<br>(Roll for level + con mod)<br>`;
            const roll = new Roll(formula);
            await roll.roll({ async: true });
            if (roll.total) {
                let hpRoll = roll.total;
                msg += `Got a ${hpRoll}<br>`;
                if (currentLevel == 1) {
                    // Rolling the first time
                }
                else if (currentLevel > 1) {
                    hpRoll = Math.max(hpRoll, currentHp + 1);
                }
                msg += `Setting HP max to ${hpRoll}<br>`;
                await this.actor.update({
                    "data.health_max_modified": currentLevel,
                    "data.health.max": hpRoll,
                });
                getDocumentClass("ChatMessage").create({
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    flavor: msg,
                    roll: JSON.stringify(roll),
                    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                });
            }
            else {
                console.log("Something went wrong with roll ", roll);
            }
        };
        if (this.actor.data.data.hitDie) {
            const performHPRoll = await new Promise((resolve) => {
                Dialog.confirm({
                    title: game.i18n.format("swnr.dialog.hp.title", {
                        actor: this.actor.name,
                    }),
                    yes: () => resolve(true),
                    no: () => resolve(false),
                    content: game.i18n.format("swnr.dialog.hp.text", {
                        actor: this.actor.name,
                        level: currentLevel,
                        formula: perLevel,
                    })
                });
            });
            if (performHPRoll)
                await _rollHP();
        }
        else {
            (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.info("Set the character's HitDie");
        }
        return;
    }
    async _onSkillRoll(event) {
        event.preventDefault();
        const target = event.currentTarget;
        const dataset = target.dataset;
        const skillID = dataset.itemId;
        const skill = (this.actor.getEmbeddedDocument("Item", skillID));
        skill.roll(event.shiftKey);
    }
    /** @override */
    async getData() {
        let data = super.getData();
        if (data instanceof Promise)
            data = await data;
        return {
            ...data,
            useHomebrewLuckSave: !!game.settings.get("swnr", "useHomebrewLuckSave"),
            showTempAttrMod: true,
            itemTypes: this.actor.itemTypes,
        };
    }
    /** @override */
    async _updateObject(event, formData) {
        this._itemEditHandler(formData);
        super._updateObject(event, formData);
        return this.actor;
    }
    _itemEditHandler(formData) {
        const itemUpdates = {};
        Object.keys(formData)
            .filter((k) => k.startsWith("items."))
            .forEach((k) => {
            const value = formData[k];
            delete formData[k];
            const broken = k.split(".");
            const id = broken[1];
            const update = broken.splice(2).join(".");
            if (!itemUpdates[id])
                itemUpdates[id] = { _id: id };
            itemUpdates[id][update] = value;
        });
        for (const key in itemUpdates) {
            if (Object.prototype.hasOwnProperty.call(itemUpdates, key)) {
                const element = itemUpdates[key];
                this.actor.updateEmbeddedDocuments("Item", [element]);
            }
        }
    }
    async _onConfigureActor(event) {
        var _a;
        event.preventDefault();
        const template = "systems/swnr/templates/dialogs/tweak-char.html";
        const data = {
            actor: this.actor,
            itemTypes: this.actor.itemTypes,
        };
        const html = await renderTemplate(template, data);
        (_a = this.popUpDialog) === null || _a === void 0 ? void 0 : _a.close();
        const _saveTweakChar = async (html) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const form = html[0].querySelector("form");
            const advantageInit = ((_a = (form.querySelector('[name="advantageInit"]'))) === null || _a === void 0 ? void 0 : _a.checked)
                ? true
                : false;
            const quickSkill1 = ((_b = form.querySelector('[name="quickSkill1"]')) === null || _b === void 0 ? void 0 : _b.value) || null;
            const quickSkill2 = ((_c = form.querySelector('[name="quickSkill2"]')) === null || _c === void 0 ? void 0 : _c.value) || null;
            const quickSkill3 = ((_d = form.querySelector('[name="quickSkill3"]')) === null || _d === void 0 ? void 0 : _d.value) || null;
            const extraEffortName = ((_e = form.querySelector('[name="extraEffortName"]')) === null || _e === void 0 ? void 0 : _e.value) || "";
            const owedDisplay = ((_f = form.querySelector('[name="owedDisplay"]')) === null || _f === void 0 ? void 0 : _f.value) || "";
            const debtDisplay = ((_g = form.querySelector('[name="debtDisplay"]')) === null || _g === void 0 ? void 0 : _g.value) || "";
            const balanceDisplay = ((_h = form.querySelector('[name="balanceDisplay"]')) === null || _h === void 0 ? void 0 : _h.value) || "";
            const showResourceList = ((_j = (form.querySelector('[name="showResourceList"]'))) === null || _j === void 0 ? void 0 : _j.checked)
                ? true
                : false;
            const update = {
                "data.tweak": {
                    advInit: advantageInit,
                    quickSkill1: quickSkill1,
                    quickSkill2: quickSkill2,
                    quickSkill3: quickSkill3,
                    extraEffortName: extraEffortName,
                    showResourceList: showResourceList,
                    owedDisplay: owedDisplay,
                    debtDisplay: debtDisplay,
                    balanceDisplay: balanceDisplay
                },
            };
            await this.actor.update(update);
        };
        this.popUpDialog = new Dialog({
            title: game.i18n.format("swnr.dialog.tweak-char", {
                actor: this.actor.name,
            }),
            content: html,
            default: "saveChanges",
            buttons: {
                saveChanges: {
                    label: game.i18n.localize("swnr.dialog.save-changes"),
                    callback: _saveTweakChar,
                },
            },
        }, { classes: ["swnr"] });
        await this.popUpDialog.render(true);
    }
    /**
     * Extend and override the sheet header buttons
     * @override
     */
    _getHeaderButtons() {
        var _a;
        const buttons = super._getHeaderButtons();
        // Token Configuration
        const canConfigure = ((_a = game.user) === null || _a === void 0 ? void 0 : _a.isGM) || this.actor.isOwner;
        if (this.options.editable && canConfigure) {
            // Insert tweaks into first spot on the array
            buttons.splice(0, 0, {
                label: game.i18n.localize("swnr.sheet.tweaks"),
                class: "configure-actor",
                icon: "fas fa-code",
                onclick: (ev) => this._onConfigureActor(ev),
            });
        }
        return buttons;
    }
}
Hooks.on("renderChatMessage", (message, html, user) => {
    var _a, _b, _c;
    const statApplyButton = (html.find(".statApplyButton button"));
    if (statApplyButton.length !== 0) {
        // fix later
        const actorId = message.data["speaker"]["actor"];
        if (!actorId)
            throw new Error("no id");
        const actor = (_a = game.actors) === null || _a === void 0 ? void 0 : _a.get(actorId);
        if (!actor)
            throw new Error("missing actor?");
        if (message.getFlag("swnr", "alreadyDone") ||
            (!((_b = game.user) === null || _b === void 0 ? void 0 : _b.isGM) && ((_c = game.user) === null || _c === void 0 ? void 0 : _c.id) === user.id)) {
            statApplyButton.prop("disabled", true);
        }
        else {
            const bind = function (event) {
                event.preventDefault();
                message.setFlag("swnr", "alreadyDone", true);
                statApplyButton.prop("disabled", true);
                const messageContent = statApplyButton.parents(".message-content");
                const stats = {};
                ["str", "dex", "con", "int", "wis", "cha"].forEach((stat) => {
                    stats[stat] = {
                        base: parseInt(messageContent.find(`.stat-${stat} .statBase`).text()),
                    };
                });
                actor.update({ data: { stats } });
            };
            statApplyButton.one("click", bind);
        }
    }
});
export const sheet = CharacterActorSheet;
export const types = ["character"];

//# sourceMappingURL=character-sheet.js.map
