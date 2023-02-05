import { BaseActorSheet } from "../actor-base-sheet.js";
import { FACTION_TAGS } from "./faction.js";
import { FACTION_GOALS, FACTION_ACTIONS } from "./faction.js";
import { ValidatedDialog } from "../ValidatedDialog.js";
export class FactionActorSheet extends BaseActorSheet {
    get actor() {
        if (super.actor.type !== "faction")
            throw Error;
        return super.actor;
    }
    _injectHTML(html) {
        html
            .find(".window-content")
            .addClass(["cq", "overflow-y-scroll", "relative"]);
        super._injectHTML(html);
    }
    async _onAssetCreate(event) {
        event.preventDefault();
        event.stopPropagation();
        const assetType = $(event.currentTarget).data("assetType");
        const givenName = $(event.currentTarget).data("assetName");
        const itemName = givenName ? `New ${givenName}` : "New Asset";
        const imgPath = this.getAssetImage(assetType);
        if (assetType) {
            await this.actor.createEmbeddedDocuments("Item", [
                {
                    name: itemName,
                    type: "asset",
                    img: imgPath,
                    data: {
                        assetType: assetType,
                    },
                },
            ], {});
        }
    }
    getAssetImage(itemType) {
        const icon_path = "systems/swnr/assets/icons/hawkin";
        const imgMap = {
            cunning: "cunning.png",
            force: "force.png",
            wealth: "wealth.png",
        };
        if (itemType in imgMap) {
            return `${icon_path}/${imgMap[itemType]}`;
        }
        else {
            return "icons/svg/item-bag.svg";
        }
    }
    async getData(options) {
        let data = super.getData(options);
        if (data instanceof Promise)
            data = await data;
        return mergeObject(data, {
            itemTypes: this.actor.itemTypes,
        });
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["swnr", "sheet", "actor", "faction"],
            template: "systems/swnr/templates/actors/faction-sheet.html",
            width: 750,
            height: 600,
            tabs: [
                {
                    navSelector: ".pc-sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "assets",
                },
            ],
        });
    }
    async _onAddLog(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        (_a = this.popUpDialog) === null || _a === void 0 ? void 0 : _a.close();
        const html = `<form class="-m-2 p-2 pb-4 space-y-2">
    <div class="form-group">
      <label>Manual Log Entry. To inline a roll use [[1dX]].</label>
      <textarea id="inputField" name="inputField" rows="4" cols="50" 
        class="bg-gray-100 border border-gray-700 rounded-md p-2"></textarea>
    </div>
  </form>`;
        this.popUpDialog = new ValidatedDialog({
            title: "Add Log",
            content: html,
            default: "add",
            buttons: {
                add: {
                    label: `Add Manual Log Entry`,
                    callback: async (html) => {
                        var _a;
                        const form = html[0].querySelector("form");
                        const log = (_a = (form.querySelector('[name="inputField"]'))) === null || _a === void 0 ? void 0 : _a.value;
                        if (log) {
                            this.actor.logMessage("Manual Faction Log", log);
                            // const logEntries = this.actor.data.data.log;
                            // logEntries.push(log);
                            // await this.actor.update({ data: { log: logEntries } });
                        }
                    },
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
    async _onDelLog(event) {
        event.preventDefault();
        event.stopPropagation();
        const div = $(event.currentTarget).parents(".logdiv");
        const p = $(event.currentTarget).parents();
        const idx = div.data("idx");
        const logs = this.actor.data.data.log;
        const log = logs[idx];
        // if (!tag) {
        //   ui.notifications?.info("Issue deleting tag");
        //   return;
        // }
        const performDelete = await new Promise((resolve) => {
            Dialog.confirm({
                title: "Delete Log",
                yes: () => resolve(true),
                no: () => resolve(false),
                content: `Remove log: ${log}?`,
            });
        });
        if (!performDelete)
            return;
        div.slideUp(200, () => {
            requestAnimationFrame(async () => {
                //actor.removeCrew(li.data("crewId"));
                logs.splice(idx, 1);
                await this.actor.update({
                    data: {
                        log: logs,
                    },
                });
            });
        });
    }
    async _onDelLogAll(event) {
        event.preventDefault();
        event.stopPropagation();
        const logs = this.actor.data.data.log;
        // if (!tag) {
        //   ui.notifications?.info("Issue deleting tag");
        //   return;
        // }
        const performDelete = await new Promise((resolve) => {
            Dialog.confirm({
                title: "Delete Log",
                yes: () => resolve(true),
                no: () => resolve(false),
                content: `Remove all logs for this faction (cannot be undone)?`,
            });
        });
        if (!performDelete)
            return;
        logs.length = 0;
        await this.actor.update({
            data: {
                log: logs,
            },
        });
    }
    async _onDelTag(event) {
        event.preventDefault();
        event.stopPropagation();
        const div = $(event.currentTarget).parents(".tagdiv");
        const p = $(event.currentTarget).parents();
        const idx = div.data("idx");
        const tags = this.actor.data.data.tags;
        const tag = tags[idx];
        // if (!tag) {
        //   ui.notifications?.info("Issue deleting tag");
        //   return;
        // }
        const performDelete = await new Promise((resolve) => {
            Dialog.confirm({
                title: "Delete Tag",
                yes: () => resolve(true),
                no: () => resolve(false),
                content: `Remove tag ${tag.name}?`,
            });
        });
        if (!performDelete)
            return;
        div.slideUp(200, () => {
            requestAnimationFrame(async () => {
                //actor.removeCrew(li.data("crewId"));
                tags.splice(idx, 1);
                await this.actor.update({
                    data: {
                        tags: tags,
                    },
                });
            });
        });
    }
    async _onAddCustomTag(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        const dialogTemplate = `
    <div class="flex flex-col -m-2 p-2 pb-4 space-y-2">
      <h1> Add Tag </h1>
      <div class="flex flex-col">
        <div class="flex flexrow p-2 m-2">
          Tag Name:
          <input type='text' id="tagname" name='tagname' class="bg-gray-100 border border-gray-700 rounded-md p-2"></input>

        </div>
        <div class="flex flexrow p-2  m-2">
          Tag Desc:
          <textarea id="tagdesc" name="tagdesc" rows="4" cols="50" 
          class="bg-gray-100 border border-gray-700 rounded-md p-2 m-2"></textarea>
        </div>
        <div class="flex flexrow p-2 m-2">
          Tag Effect: 
          <textarea id="tageffect" name="tageffect" rows="4" cols="50" 
          class="bg-gray-100 border border-gray-700 rounded-md p-2 m-1"></textarea>
        </div>

      </div>
    </div>
    `;
        (_a = this.popUpDialog) === null || _a === void 0 ? void 0 : _a.close();
        this.popUpDialog = new ValidatedDialog({
            title: "Add Custom Tag",
            content: dialogTemplate,
            buttons: {
                addTag: {
                    label: "Add Custom Tag",
                    callback: async (html) => {
                        const name = html.find("#tagname")[0].value;
                        const desc = html.find("#tagdesc")[0].value;
                        const effect = html.find("#tageffect")[0]
                            .value;
                        this.actor.addCustomTag(name, desc, effect);
                    },
                },
                close: {
                    label: "Close",
                },
            },
            default: "addTag",
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
    async _onAddTag(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        let tagOptions = "";
        let tagDesc = "";
        for (const tag of FACTION_TAGS) {
            tagOptions += `<option value='${tag.name}'>${tag.name}</option>`;
            tagDesc += `<div> <b>${tag.name}</b></div><div>${tag.desc}</div><div><i>Effect:</i> ${tag.effect}</div>`;
        }
        const dialogTemplate = `
    <div class="flex flex-col -m-2 p-2 pb-4 space-y-2">
      <h1> Add Tag </h1>
      <div class="flex flexrow">
        Tag: <select id="tag"          
        class="px-1.5 border border-gray-800 bg-gray-400 bg-opacity-75 placeholder-blue-800 placeholder-opacity-75 rounded-md">
        ${tagOptions}
        </select>
      </div>
      ${tagDesc}
    </div>
    `;
        (_a = this.popUpDialog) === null || _a === void 0 ? void 0 : _a.close();
        this.popUpDialog = new ValidatedDialog({
            title: "Add Tag",
            content: dialogTemplate,
            buttons: {
                addTag: {
                    label: "Add Tag",
                    callback: async (html) => {
                        const tag = html.find("#tag")[0].value;
                        this.actor.addTag(tag);
                    },
                },
                close: {
                    label: "Close",
                },
            },
            default: "addTag",
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
    async _onStartTurn(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        this.actor.startTurn();
        // Now ask about action
        const dialogData = {
            actions: FACTION_ACTIONS,
        };
        const template = "systems/swnr/templates/dialogs/faction-action.html";
        const html = renderTemplate(template, dialogData);
        const _form = async (html) => {
            const form = html[0].querySelector("form");
            const action = form.querySelector('[name="action"]')
                .value;
            for (const a of FACTION_ACTIONS) {
                if (action == a.name) {
                    const title = `Faction ${this.actor.name} action: ${action}`;
                    const msg = `${a.desc}`;
                    const longDesc = a.longDesc != undefined ? a.longDesc : null;
                    let rollString = null;
                    if (a.roll) {
                        const roll = new Roll(a.roll, this.actor.data.data);
                        rollString = await roll.render();
                    }
                    this.actor.logMessage(title, msg, longDesc, rollString);
                }
            }
        };
        (_a = this.popUpDialog) === null || _a === void 0 ? void 0 : _a.close();
        this.popUpDialog = new ValidatedDialog({
            title: "Take Action",
            content: await html,
            default: "setgoal",
            buttons: {
                setgoal: {
                    label: "Take Action",
                    callback: _form,
                },
            },
        }, {
            classes: ["swnr"],
        });
        this.popUpDialog.render(true);
    }
    async _onSetGoal(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        const goalArray = FACTION_GOALS;
        const dialogData = {
            goalArray,
        };
        const template = "systems/swnr/templates/dialogs/faction-goal.html";
        const html = renderTemplate(template, dialogData);
        const _goalForm = async (html) => {
            var _a;
            const form = html[0].querySelector("form");
            const goal = form.querySelector('[name="goal"]')
                .value;
            const goalType = (form.querySelector('[name="goalType"]')).value;
            if (goal && goal.length == 0 && goalType != "abandon") {
                (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.info("No goal selected. Ignoring");
            }
            else {
                for (const g of FACTION_GOALS) {
                    if (g.name == goal) {
                        await this.actor.update({
                            data: {
                                factionGoal: g.name,
                                factionGoalDesc: g.desc,
                            },
                        });
                        let goalTypeMessage = "<b>Goal completed</b>.<br> Reminder: A faction that successfully accomplishes a goal gains experience points equal to the goal`s difficulty. This experience may be saved, or spent at the beginning of any turn to increase the Force, Cunning, or Wealth ratings of a faction. Optionally, the GM might allow a faction to buy a new tag if their deeds justify it.";
                        if (goalType == "abandon") {
                            goalTypeMessage =
                                "<b>Goal abandoned.</b><br> Reminder: If a faction chooses to abandon a goal, the demoralizing effect of it and the waste of preparations costs them that turn’s FacCred income, and they cannot perform any other action that turn.";
                        }
                        const title = `Faction ${this.actor.name} changed their goal to ${g.name}.`;
                        const content = `${goalTypeMessage}`;
                        await this.actor.logMessage(title, content);
                        return;
                    }
                }
            }
        };
        (_a = this.popUpDialog) === null || _a === void 0 ? void 0 : _a.close();
        this.popUpDialog = new ValidatedDialog({
            title: "Set Goal",
            content: await html,
            default: "setgoal",
            buttons: {
                setgoal: {
                    label: "Set Goal",
                    callback: _goalForm,
                },
            },
        }, {
            classes: ["swnr"],
        });
        this.popUpDialog.render(true);
    }
    async _onAssetRepair(event) {
        var _a, _b;
        event.preventDefault();
        event.stopPropagation();
        const wrapper = $(event.currentTarget).parents(".item");
        const asset = this.actor.getEmbeddedDocument("Item", wrapper.data("itemId"));
        if (!asset) {
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error("Cannot find asset.");
            return;
        }
        (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.info("on set _onAssetRepair " + asset.name);
    }
    async _onBaseAdd(event) {
        event.preventDefault();
        event.stopPropagation();
        new Dialog({
            title: "Add New Base",
            content: `
          Adding a new base from Expand Influence Action.<br>
          Select HP (up to Faction max HP). One FacCred per HP.
          <form>
            <div class="form-group">
              <label>Base HP</label>
              <input type='text' name='inputField'></input>
            </div>
          </form>`,
            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: `Exapnd Influence - New Base`,
                },
            },
            default: "yes",
            close: (html) => {
                var _a, _b;
                const form = html[0].querySelector("form");
                const hp = (_a = form.querySelector('[name="inputField"]')) === null || _a === void 0 ? void 0 : _a.value;
                if (hp && hp != "") {
                    const nHp = Number(hp);
                    if (nHp) {
                        const assetType = $(event.currentTarget).data("assetType");
                        const givenName = $(event.currentTarget).data("assetName");
                        const itemName = givenName
                            ? `Base of Inf. ${givenName}`
                            : "New Base of Inf";
                        const imgPath = this.getAssetImage(assetType);
                        this.actor.addBase(nHp, assetType, itemName, imgPath);
                    }
                    else {
                        (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error(hp + " is not a number");
                    }
                }
            },
        }).render(true);
    }
    async _onAssetUnusable(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        const wrapper = $(event.currentTarget).parents(".item");
        const asset = this.actor.getEmbeddedDocument("Item", wrapper.data("itemId"));
        if (!asset) {
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error("Cannot find asset.");
            return;
        }
        const new_status = !(asset === null || asset === void 0 ? void 0 : asset.data.data.unusable);
        if (asset instanceof Item)
            await (asset === null || asset === void 0 ? void 0 : asset.update({
                data: {
                    unusable: new_status,
                },
            }));
    }
    async _onAssetStealthed(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        const wrapper = $(event.currentTarget).parents(".item");
        const asset = this.actor.getEmbeddedDocument("Item", wrapper.data("itemId"));
        if (!asset) {
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error("Cannot find asset.");
            return;
        }
        const new_status = !(asset === null || asset === void 0 ? void 0 : asset.data.data.stealthed);
        if (asset instanceof Item)
            await (asset === null || asset === void 0 ? void 0 : asset.update({
                data: {
                    stealthed: new_status,
                },
            }));
    }
    async _onRatingUp(type) {
        return this.actor.ratingUp(type);
    }
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".asset-create").on("click", this._onAssetCreate.bind(this));
        html.find(".faction-turn").on("click", this._onStartTurn.bind(this));
        html.find(".faction-tag-add").on("click", this._onAddTag.bind(this));
        html
            .find(".faction-tag-add-custom")
            .on("click", this._onAddCustomTag.bind(this));
        html.find(".faction-tag-delete").on("click", this._onDelTag.bind(this));
        html.find(".faction-log-delete").on("click", this._onDelLog.bind(this));
        html.find(".faction-log-add").on("click", this._onAddLog.bind(this));
        html
            .find(".faction-log-delete-all")
            .on("click", this._onDelLogAll.bind(this));
        html.find(".force-up").on("click", this._onRatingUp.bind(this, "force"));
        html
            .find(".cunning-up")
            .on("click", this._onRatingUp.bind(this, "cunning"));
        html.find(".wealth-up").on("click", this._onRatingUp.bind(this, "wealth"));
        html.find(".set-goal").on("click", this._onSetGoal.bind(this));
        html.find(".item-fix").on("click", this._onAssetRepair.bind(this));
        html
            .find(".asset-toggle-unusable")
            .on("click", this._onAssetUnusable.bind(this));
        html
            .find(".asset-toggle-stealthed")
            .on("click", this._onAssetStealthed.bind(this));
        html.find(".add-base").on("click", this._onBaseAdd.bind(this));
        // html.find(".").on("click", this._on.bind(this));
    }
}
Hooks.on("dropActorSheetData", (actor, actorSheet, data) => {
    var _a;
    if (data.type == "JournalEntry") {
        if (actor.type == "faction") {
            if (!data["id"] || typeof data["id"] !== "string") {
                (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error("Error with getting journal id");
                return;
            }
            const faction = actor;
            faction.setHomeWorld(data["id"]);
        }
    }
});
export const sheet = FactionActorSheet;
export const types = ["faction"];

//# sourceMappingURL=faction-sheet.js.map
