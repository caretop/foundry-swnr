import { ValidatedDialog } from "./ValidatedDialog.js";
export function chatListeners(message, html) {
    html.on("click", ".card-buttons button", _onChatCardAction.bind(this));
    /*
    html.find(".roll-shock").each((_i, div) => {
        //_addHealthButtons($(div));
    });*/

    html.find(".orgDamage").each((_i, div) => {
        //_addTraumaHitButton($(div));
        _addHealthButtons($(div));
    });

    //html.on("click", ".item-name", this._onChatCardToggleContent.bind(this));
    const longDesc = html.find(".longShowDesc");
    if (longDesc) {
        const bind = function (event) {
            event.preventDefault();
            const hiddenDesc = html.find(".hiddenLong");
            const shownDesc = html.find(".hiddenShort");
            hiddenDesc.show();
            //longDesc.hide();
            shownDesc.hide();
        };
        longDesc.on("click", bind);
    }
    const shortDesc = html.find(".longHideDesc");
    if (shortDesc) {
        const bind = function (event) {
            event.preventDefault();
            const hiddenDesc = html.find(".hiddenLong");
            const shownDesc = html.find(".hiddenShort");
            hiddenDesc.hide();
            //longDesc.hide();
            shownDesc.show();
        };
        shortDesc.on("click", bind);
    }
}

Hooks.on("getChatLogEntryContext", (html, options) => {
    let canApply = li => li.find(".dice-roll").length && game.user.role == 4;
    options.push(
      {
        name: "Modify this roll",
        icon: '<i class="fas fa-pencil-alt"></i>',
        condition: canApply,
        callback: li => modifyRoll(li)
    })
})

async function modifyRoll(li) {
    let this_mess = ui.chat.collection.get($(li).attr("data-message-id"));
    let newRoll = duplicate(this_mess.roll);

    let modification = await new Promise(resolve => {
        new Dialog({
            title: "Modify Roll",
            content: 
                `<div>
                    <label> Modifier: </label>
                    <input type = "number" class = "postModifier" value = "0">
                    </input>
                </div>`,
            buttons: {
                ok: {
                    label: "OK",
                    callback: () => {
                        resolve({
                            Modifier:$('.postModifier')[0].value,
                        })
                    }               
                },
                no: {
                    label: "Cancel",
                },
            },
            default: "ok",
        }).render(true);
    })

    let input_mod = parseInt(modification.Modifier);
    newRoll.total = newRoll.total + input_mod;
    if (this_mess.data.flavor === undefined) {
        if (input_mod < 0) {
            newRoll.formula = (newRoll.formula + input_mod);
            newRoll.flavor = ("<i>Modifier: " + input_mod + "<i/>");
        }
        if (input_mod >= 0 ) {
            newRoll.formula = (newRoll.formula + " + " + input_mod);
            newRoll.flavor = ("<i>Modifier: +" + input_mod + "<i/>");
        }
    }
    if (this_mess.data.flavor != undefined) { 
        if (input_mod < 0) {
            newRoll.formula = (newRoll.formula + input_mod);
            newRoll.flavor = (this_mess.data.flavor + "<br/><i>Modifier: " + input_mod + "<i/>");
        }
        if (input_mod >= 0 ) {
            newRoll.formula = (newRoll.formula + " + " + input_mod);
            newRoll.flavor = (this_mess.data.flavor + "<br/><i>Modifier: +" + input_mod + "<i/>");
        }
    }

    await this_mess.update({flavor: newRoll.flavor, content: newRoll.total, roll: JSON.stringify(newRoll)});
    li = [];
    this_mess = [];
    newRoll = [];
    this_mess = [];
    modification = [];
    input_mod = [];
    return li;
}



export function _addTraumaHitButton(html) {
    const totalDiv = html.find(".dice-total");
    const formulaDiv = html.find(".dice-formula")
    const traumaDiv = html.siblings(".trauma-title")
    const total = parseInt(totalDiv.text());
    const traumaRate = parseInt(traumaDiv.text().slice(-1))
    const multTotal = total * traumaRate;
   
    /*
    if (isNaN(total)) {
        console.log("Error in converting a string to a number " + totalDiv.text());
        return;
    }*/
    const TraumaHitButton = $(`<button class="dice-total-fullDamage-btn chat-button-small"><i class="fas fa-head-side-virus" title="Traumatic Hit"></i></button>`);
    const btnContainer = $('<span class="dmgBtn-container" style="bottom:1px;"></span>');
    btnContainer.append(TraumaHitButton);
    html.siblings(".dmg-title").append(btnContainer);

    TraumaHitButton.on("click", (ev) => {
        ev.stopPropagation();
        new roll
        //totalDiv.text(multTotal.toString())
        //console.log(totalDiv.text("1"))
        //applyHealthDrop(totalDiv.text())
    });
}







export function _addHealthButtons(html) {
    const totalDiv = html.find(".dice-total");
    const total = parseInt(totalDiv.text());
    if (isNaN(total)) {
        console.log("Error in converting a string to a number " + totalDiv.text());
        return;
    }

    const fullDamageButton = $(`<button class="dice-total-fullDamage-btn chat-button-small"><i class="fas fa-user-minus" title="Click to apply full damage to selected token(s)."></i></button>`);
    const halfDamageButton = $(`<button class="dice-total-halfDamage-btn chat-button-small"><i class="fas fa-user-shield" title="Click to apply half damage to selected token(s)."></i></button>`);
    // const doubleDamageButton = $(`<button class="dice-total-doubleDamage-btn" style="${btnStyling}"><i class="fas fa-user-injured" title="Click to apply double damage to selected token(s)."></i></button>`);
    const fullHealingButton = $(`<button class="dice-total-fullHealing-btn chat-button-small"><i class="fas fa-user-plus" title="Click to apply full healing to selected token(s)."></i></button>`);
    const btnContainer = $('<span class="dmgBtn-container" style=" right:24px; bottom:1px;"></span>');
    btnContainer.append(fullDamageButton);
    btnContainer.append(halfDamageButton);
    // btnContainer.append(doubleDamageButton);
    btnContainer.append(fullHealingButton);
    totalDiv.append(btnContainer);
    html.siblings(".dmg-title").append(btnContainer)
    // Handle button clicks
    fullDamageButton.on("click", (ev) => {
        ev.stopPropagation();
        applyHealthDrop(parseInt(totalDiv.text()));
    });
    halfDamageButton.on("click", (ev) => {
        ev.stopPropagation();
        applyHealthDrop(Math.floor(total * 0.5));
    });
    // doubleDamageButton.click(ev => {
    //     ev.stopPropagation();
    // applyHealthDrop(total*2);
    // });
    fullHealingButton.on("click", (ev) => {
        ev.stopPropagation();
        applyHealthDrop(total * -1);
    });
}
export async function applyHealthDrop(total) {
    var _a, _b, _c, _d, _e;
    if (total == 0)
        return; // Skip changes of 0
    const tokens = (_a = canvas === null || canvas === void 0 ? void 0 : canvas.tokens) === null || _a === void 0 ? void 0 : _a.controlled;
    if (!tokens || tokens.length == 0) {
        (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error("Please select at least one token");
        return;
    }
    // console.log(
    //   `Applying health drop ${total} to ${tokens.length} selected tokens`
    // );
    for (const t of tokens) {
        const actor = t.actor;
        if (!actor) {
            (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.error("Error getting actor for token " + t.name);
            continue;
        }
        let newTotal = total-actor.data.data.soak.value
        let newHealth = actor.data.data.health.value - (newTotal);
        //let newTotal = total-actor.data.data.soak.value
        if (newHealth < 0) {
            newHealth = 0;
        }
        else if (newHealth > actor.data.data.health.max) {
            newHealth = actor.data.data.health.max;
        }

        let newSoak = actor.data.data.soak.value - total
        if(newSoak<=0){
            newSoak = 0 
        }
        //console.log(`Updating ${actor.name} health to ${newHealth}`);
        await actor.update({ "data.health.value": newHealth });
        await actor.update({ "data.soak.value": newSoak });
        // Taken from Mana
        //https://gitlab.com/mkahvi/fvtt-micro-modules/-/blob/master/pf1-floating-health/floating-health.mjs#L182-194
        const fillColor = total < 0 ? "0x00FF00" : "0xFF0000";
        const floaterData = {
            anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
            direction: total > 0
                ? CONST.TEXT_ANCHOR_POINTS.BOTTOM
                : CONST.TEXT_ANCHOR_POINTS.TOP,
            // duration: 2000,
            fontSize: 32,
            fill: fillColor,
            stroke: 0x000000,
            strokeThickness: 4,
            jitter: 0.3,
        };
        if (((_d = game === null || game === void 0 ? void 0 : game.release) === null || _d === void 0 ? void 0 : _d.generation) >= 10)
            (_e = canvas === null || canvas === void 0 ? void 0 : canvas.interface) === null || _e === void 0 ? void 0 : _e.createScrollingText(t.center, `${newTotal * -1}`, floaterData);
        // v10
        else
            t.hud.createScrollingText(`${newTotal * -1}`, floaterData); // v9
    }
}
export function _findCharTargets() {
    var _a, _b, _c, _d, _e;
    const chars = [];
    (_a = canvas === null || canvas === void 0 ? void 0 : canvas.tokens) === null || _a === void 0 ? void 0 : _a.controlled.forEach((i) => {
        var _a, _b;
        if (((_a = i.actor) === null || _a === void 0 ? void 0 : _a.type) == "character" || ((_b = i.actor) === null || _b === void 0 ? void 0 : _b.type) == "npc") {
            chars.push(i.actor);
        }
    });
    if (((_c = (_b = game.user) === null || _b === void 0 ? void 0 : _b.character) === null || _c === void 0 ? void 0 : _c.type) == "character" ||
        ((_e = (_d = game.user) === null || _d === void 0 ? void 0 : _d.character) === null || _e === void 0 ? void 0 : _e.type) == "npc") {
        chars.push(game.user.character);
    }
    return chars;
}
//Taken from WWN (which could have come from OSE)
export async function _onChatCardAction(event) {
    var _a, _b, _c, _d, _e;
    event.preventDefault();
    // Extract card data
    const button = event.currentTarget;
    //button.disabled = true;
    const card = button.closest(".chat-card");
    //const messageId = card.closest(".message").dataset.messageId;
    //const message = game.messages?.get(messageId);
    const action = button.dataset.action;
    // Validate permission to proceed with the roll
    const targets = _findCharTargets();
    if (action === "save") {
        if (!targets.length) {
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.warn(`You must have one or more controlled Tokens in order to use this option.`);
            //return (button.disabled = false);
        }
        for (const t of targets) {
            await t.rollSave(button.dataset.save);
        }
    }
    else if (action === "skill") {
        if (!targets.length) {
            (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.warn(`You must have one or more controlled Tokens in order to use this option.`);
            //return (button.disabled = false);
        }
        let skill = button.dataset.skill;
        let stat = null;
        if (skill.indexOf("/") != -1) {
            stat = skill.split("/")[0].toLowerCase();
            skill = skill.split("/")[1];
        }
        for (const t of targets) {
            if (t.type == "npc") {
                const skill = t.data.data.skillBonus;
                const roll = new Roll("2d6 + @skill", { skill });
                await roll.roll({ async: true });
                const flavor = game.i18n.format(game.i18n.localize("swnr.npc.skill.trained"), { actor: t.name });
                roll.toMessage({ flavor, speaker: { actor: t } });
            }
            else {
                const candidates = t.itemTypes.skill.filter((i) => { var _a; return ((_a = i.name) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === skill.toLocaleLowerCase(); });
                if (candidates.length == 1) {
                    if (candidates[0].type == "skill") {
                        if (stat == null || stat === "ask") {
                            // No stat given or written as ask. Use roll default.
                            candidates[0].roll(false);
                        }
                        else {
                            // Stat given force the roll
                            const skillItem = candidates[0];
                            const dice = skillItem.data.data.pool === "ask"
                                ? "2d6"
                                : skillItem.data.data.pool;
                            const skillRank = skillItem.data.data.rank;
                            const statShortName = game.i18n.localize("swnr.stat.short." + stat);
                            let statData = {
                                mod: 0,
                            };
                            if (t.data.data["stats"][stat])
                                statData = t.data.data["stats"][stat];
                            skillItem.rollSkill(skillItem.name, statShortName, statData.mod, dice, skillRank, 0);
                        }
                    }
                }
                else {
                    (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.info(`Cannot find skill ${skill}`);
                }
            }
        }
    }
    else if (action === "effort") {
        if (!targets.length) {
            (_d = ui.notifications) === null || _d === void 0 ? void 0 : _d.warn(`You must have one or more controlled Tokens in order to use this option.`);
            //return (button.disabled = false);
        }
        const effort = button.dataset.effort;
        for (const t of targets) {
            if (t.type === "character") {
                if (t.data.data.effort.value == 0) {
                    (_e = ui.notifications) === null || _e === void 0 ? void 0 : _e.info(`${t.name} has no available effort`);
                    return;
                }
                const updated_effort = t.data.data.effort[effort] + 1;
                const effort_key = `data.effort.${effort}`;
                await t.update({ [effort_key]: updated_effort });
            }
        }
    }
}
export function getDefaultImage(itemType) {
    const icon_path = "systems/swnr/assets/icons/game-icons.net/item-icons";
    const imgMap = {
        shipWeapon: "sinusoidal-beam.svg",
        shipDefense: "bubble-field.svg",
        shipFitting: "power-generator.svg",
        cyberware: "cyber-eye.svg",
        focus: "reticule.svg",
        armor: "armor-white.svg",
        weapon: "weapon-white.svg",
        power: "psychic-waves-white.svg",
        skill: "book-white.svg",
    };
    if (itemType in imgMap) {
        return `${icon_path}/${imgMap[itemType]}`;
    }
    else {
        return "icons/svg/item-bag.svg";
    }
}
export function calculateStats(stats) {
    for (const stat of Object.values(stats)) {
        stat.total = stat.base + stat.boost + stat.temp;
        const v = (stat.total - 10.5) / 3.5;
        stat.mod =
            Math.min(2, Math.max(-2, Math[v < 0 ? "ceil" : "floor"](v))) + stat.bonus;
    }
}
export function limitConcurrency(fn) {
    let limited = false;
    return async function (...args) {
        if (limited) {
            return;
        }
        limited = true;
        const r = await fn.apply(this, args);
        limited = false;
        return r;
    };
}
export async function initCompendSkills(actor) {
    var _a;
    const candidates = {};
    for (const e of game.packs) {
        if (e.metadata.entity === "Item") {
            const items = await e.getDocuments();
            if (items.filter((i) => i.type == "skill").length) {
                candidates[e.metadata.name] = e;
                console.log("skills", e.name, e.metadata, candidates);
            }
        }
    }
    if (Object.keys(candidates).length == 0) {
        (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error("Cannot find a compendium with a skill item");
        return;
    }
    let compOptions = "";
    for (const label in candidates) {
        const cand = candidates[label];
        compOptions += `<option value='${cand.metadata.name}'>${cand.metadata.label}</option>`;
    }
    const dialogTemplate = `
  <div class="flex flex-col -m-2 p-2 pb-4 space-y-2">
    <h1> Select Compendium </h1>
    <div class="flex flexrow">
      Compendium: <select id="compendium"
      class="px-1.5 border border-gray-800 bg-gray-400 bg-opacity-75 placeholder-blue-800 placeholder-opacity-75 rounded-md">
      ${compOptions}
      </select>
    </div>
  </div>
  `;
    const popUpDialog = new ValidatedDialog({
        title: "Add Skills",
        content: dialogTemplate,
        buttons: {
            addSkills: {
                label: "Add Skills",
                callback: async (html) => {
                    const comped = html.find("#compendium")[0]
                        .value;
                    const toAdd = await candidates[comped].getDocuments();
                    const primarySkills = toAdd
                        .filter((i) => i.data.type === "skill")
                        .map((item) => item.toObject());
                    await actor.createEmbeddedDocuments("Item", primarySkills);
                },
            },
            close: {
                label: "Close",
            },
        },
        default: "addSkills",
    }, {
        failCallback: () => {
            return;
        },
        classes: ["swnr"],
    });
    const s = popUpDialog.render(true);
    if (s instanceof Promise)
        await s;
}
export function initSkills(actor, skillSet) {
    const items = skills[skillSet].map((element) => {
        const skillRoot = `swnr.skills.${skillSet}.${element}.`;
        return {
            type: "skill",
            name: game.i18n.localize(skillRoot + "name"),
            data: {
                rank: -1,
                pool: "ask",
                description: game.i18n.localize(skillRoot + "text"),
                source: game.i18n.localize("swnr.skills.labels." + skillSet),
                dice: "2d6",
            },
        };
    });
    actor.createEmbeddedDocuments("Item", items);
}
const skills = {
    none: [],
    spaceMagic: ["knowMagic", "useMagic", "sunblade", "fight"],
    classic: [
        "artist",
        "athletics",
        "bureaucracy",
        "business",
        "combat-energy",
        "combat-gunnery",
        "combat-primitive",
        "combat-projectile",
        "combat-psitech",
        "combat-unarmed",
        "computer",
        "culture-alien",
        "culture-criminal",
        "culture-spacer",
        "culture-traveller",
        "culture",
        "culture",
        "culture",
        "exosuit",
        "gambling",
        "history",
        "instructor",
        "language",
        "leadership",
        "navigation",
        "perception",
        "persuade",
        "profession",
        "religion",
        "science",
        "security",
        "stealth",
        "steward",
        "survival",
        "tactics",
        "tech-astronautic",
        "tech-maltech",
        "tech-medical",
        "tech-postech",
        "tech-pretech",
        "tech-psitech",
        "vehicle-air",
        "vehicle-grav",
        "vehicle-land",
        "vehicle-space",
        "vehicle-water",
    ],
    revised: [
        "administer",
        "connect",
        "exert",
        "fix",
        "heal",
        "know",
        "lead",
        "notice",
        "perform",
        "pilot",
        "program",
        "punch",
        "shoot",
        "sneak",
        "stab",
        "survive",
        "talk",
        "trade",
        "work",
    ],
    psionic: [
        "biopsionics",
        "metapsionics",
        "precognition",
        "telekinesis",
        "telepathy",
        "teleportation",
    ],
};

//# sourceMappingURL=utils.js.map
