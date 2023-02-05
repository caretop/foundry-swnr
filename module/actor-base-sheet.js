import { getDefaultImage } from "./utils.js";
import { ValidatedDialog } from "./ValidatedDialog.js";
export class BaseActorSheet extends ActorSheet {
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".item-edit").on("click", this._onItemEdit.bind(this));
        html.find(".item-delete").on("click", this._onItemDelete.bind(this));
        html.find(".item-reload").on("click", this._onItemReload.bind(this));
        html.find(".item-show").on("click", this._onItemShow.bind(this));
        html
            .find(".item-toggle-broken")
            .on("click", this._onItemBreakToggle.bind(this));
        html
            .find(".item-toggle-destroy")
            .on("click", this._onItemDestroyToggle.bind(this));
        html
            .find(".item-toggle-jury")
            .on("click", this._onItemJuryToggle.bind(this));
        html.find(".item-click").on("click", this._onItemClick.bind(this));
        html.find(".item-create").on("click", this._onItemCreate.bind(this));
        html.find(".item-search").on("click", this._onItemSearch.bind(this));
    }
    // Clickable title/name or icon. Invoke Item.roll()
    _onItemClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const itemId = event.currentTarget.parentElement.dataset.itemId;
        const item = this.actor.getEmbeddedDocument("Item", itemId);
        //const wrapper = $(event.currentTarget).parents(".item");
        //const item = this.actor.getEmbeddedDocument("Item", wrapper.data("itemId"));
        if (!item)
            return;
        item.roll(event.shiftKey);
    }
    async populateItemList(itemType, candiateItems) {
        var _a, _b;
        for (const e of game.packs) {
            if (e.metadata.private == false &&
                ((((_a = game === null || game === void 0 ? void 0 : game.release) === null || _a === void 0 ? void 0 : _a.generation) >= 10 && e.metadata.type === "Item") ||
                    (((_b = game === null || game === void 0 ? void 0 : game.release) === null || _b === void 0 ? void 0 : _b.generation) < 10 && e.metadata.entity === "Item"))) {
                const items = (await e.getDocuments()).filter((i) => i.type == itemType);
                if (items.length) {
                    for (const ci of items.map((item) => item.toObject())) {
                        candiateItems[ci.name] = ci;
                    }
                }
            }
        }
    }
    async _onItemSearch(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        const mappings = {
            armor: "armor",
            item: "all-items",
            cyberware: "cyberware",
            focus: "foci",
        };
        const candiateItems = {};
        const itemType = $(event.currentTarget).data("itemType");
        const givenName = $(event.currentTarget).data("itemName");
        if (mappings[itemType]) {
            const skillPack = game.packs.get(`swnr.${mappings[itemType]}`);
            if (skillPack) {
                const convert = await skillPack.getDocuments();
                for (const item of convert.map((i) => i.toObject())) {
                    candiateItems[item.name] = item;
                }
            }
        }
        else {
            await this.populateItemList(itemType, candiateItems);
        }
        if (Object.keys(candiateItems).length) {
            let itemOptions = "";
            const keys = Object.keys(candiateItems);
            const sortedNames = keys.sort();
            for (const label of sortedNames) {
                const cand = candiateItems[label];
                itemOptions += `<option value='${label}'>${cand.name}</option>`;
            }
            const dialogTemplate = `
      <div class="flex flex-col -m-2 p-2 pb-4 space-y-2">
        <h1> Select ${givenName} to Add </h1>
        <div class="flex flexrow">
          <select id="itemList"
          class="px-1.5 border border-gray-800 bg-gray-400 bg-opacity-75 placeholder-blue-800 placeholder-opacity-75 rounded-md">
          ${itemOptions}
          </select>
        </div>
      </div>
      `;
            const popUpDialog = new ValidatedDialog({
                title: `Add ${givenName}`,
                content: dialogTemplate,
                buttons: {
                    addSkills: {
                        label: `Add ${givenName}`,
                        callback: async (html) => {
                            const itemNameToAdd = (html.find("#itemList")[0]).value;
                            const toAdd = await candiateItems[itemNameToAdd];
                            await this.actor.createEmbeddedDocuments("Item", [toAdd], {});
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
        else {
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.info("Could not find any items in the compendium");
        }
    }
    _onItemCreate(event) {
        event.preventDefault();
        event.stopPropagation();
        const itemType = $(event.currentTarget).data("itemType");
        const givenName = $(event.currentTarget).data("itemName");
        const itemName = givenName ? `New ${givenName}` : "New Item";
        const imgPath = getDefaultImage(itemType);
        if (itemType) {
            this.actor.createEmbeddedDocuments("Item", [
                {
                    name: itemName,
                    type: itemType,
                    img: imgPath,
                },
            ], {});
        }
    }
    async _onItemReload(event) {
        var _a, _b;
        event.preventDefault();
        event.stopPropagation();
        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.getEmbeddedDocument("Item", li.data("itemId"));
        if (!item)
            return;
        const ammo_max = (_a = item.data.data.ammo) === null || _a === void 0 ? void 0 : _a.max;
        if (ammo_max != null) {
            if (item.data.data.ammo.value < ammo_max) {
                await item.update({ "data.ammo.value": ammo_max });
                const content = `<p> Reloaded ${item.name} </p>`;
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    content: content,
                });
            }
            else {
                (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.info("Trying to reload a full item");
            }
        }
        else {
            console.log("Unable to find ammo in item ", item.data.data);
        }
    }
    async _onItemBreakToggle(event) {
        event.preventDefault();
        event.stopPropagation();
        const wrapper = $(event.currentTarget).parents(".item");
        const item = this.actor.getEmbeddedDocument("Item", wrapper.data("itemId"));
        const new_break_status = !(item === null || item === void 0 ? void 0 : item.data.data.broken);
        if (item instanceof Item)
            await (item === null || item === void 0 ? void 0 : item.update({
                "data.broken": new_break_status,
                "data.destroyed": false,
                "data.juryRigged": false,
            }));
    }
    async _onItemDestroyToggle(event) {
        event.preventDefault();
        event.stopPropagation();
        const wrapper = $(event.currentTarget).parents(".item");
        const item = this.actor.getEmbeddedDocument("Item", wrapper.data("itemId"));
        const new_destroy_status = !(item === null || item === void 0 ? void 0 : item.data.data.destroyed);
        if (item instanceof Item)
            await (item === null || item === void 0 ? void 0 : item.update({
                "data.destroyed": new_destroy_status,
                "data.broken": false,
                "data.juryRigged": false,
            }));
    }
    async _onItemJuryToggle(event) {
        event.preventDefault();
        event.stopPropagation();
        const wrapper = $(event.currentTarget).parents(".item");
        const item = this.actor.getEmbeddedDocument("Item", wrapper.data("itemId"));
        const new_jury_status = !(item === null || item === void 0 ? void 0 : item.data.data.juryRigged);
        if (item instanceof Item)
            await (item === null || item === void 0 ? void 0 : item.update({
                "data.destroyed": false,
                "data.broken": false,
                "data.juryRigged": new_jury_status,
            }));
    }
    _onItemEdit(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        const wrapper = $(event.currentTarget).parents(".item");
        const item = this.actor.getEmbeddedDocument("Item", wrapper.data("itemId"));
        if (item instanceof Item)
            (_a = item.sheet) === null || _a === void 0 ? void 0 : _a.render(true);
    }
    // Clickable title/name or icon. Invoke Item.roll()
    _onItemShow(event) {
        event.preventDefault();
        event.stopPropagation();
        const wrapper = $(event.currentTarget).parents(".item");
        const itemId = wrapper.data("itemId");
        const item = this.actor.getEmbeddedDocument("Item", itemId);
        if (!item)
            return;
        if (item instanceof Item)
            item.showDesc();
    }
    async _onItemDelete(event) {
        event.preventDefault();
        event.stopPropagation();
        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.getEmbeddedDocument("Item", li.data("itemId"));
        if (!item)
            return;
        if (event.shiftKey == false) {
            const performDelete = await new Promise((resolve) => {
                Dialog.confirm({
                    title: game.i18n.format("swnr.deleteTitle", { name: item.name }),
                    yes: () => resolve(true),
                    no: () => resolve(false),
                    content: game.i18n.format("swnr.deleteContent", {
                        name: item.name,
                        actor: this.actor.name,
                    }),
                });
            });
            if (!performDelete)
                return;
        }
        li.slideUp(200, () => {
            requestAnimationFrame(() => {
                this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
            });
        });
    }
}

//# sourceMappingURL=actor-base-sheet.js.map
