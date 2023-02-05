import { SWNRWeapon } from "../items/weapon.js";
import { BaseActorSheet } from "../actor-base-sheet.js";
export class NPCActorSheet extends BaseActorSheet {
    get actor() {
        if (super.actor.type !== "npc")
            throw Error;
        return super.actor;
    }
    _injectHTML(html) {
        html
            .find(".window-content")
            .addClass(["cq", "overflow-y-scroll", "relative"]);
        super._injectHTML(html);
    }
    async getData(options) {
        let data = super.getData(options);
        if (data instanceof Promise)
            data = await data;
        return mergeObject(data, {
            itemTypes: this.actor.itemTypes,
            abilities: this.actor.items.filter((i) => ["power", "focus"].indexOf(i.data.type) !== -1),
            equipment: this.actor.items.filter((i) => ["armor", "item", "weapon"].indexOf(i.data.type) !== -1),
        });
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["swnr", "sheet", "actor", "npc"],
            template: "systems/swnr/templates/actors/npc-sheet.html",
            width: 750,
            height: 600,
        });
    }
    activateListeners(html) {
        super.activateListeners(html);
        html
            .find(".weapon.item .item-name")
            .on("click", this._onItemDamage.bind(this));
        html.find(".reaction").on("click", this._onReaction.bind(this));
        html.find(".morale").on("click", this._onMorale.bind(this));
        html.find(".skill").on("click", this._onSkill.bind(this));
        html.find(".saving-throw").on("click", this._onSavingThrow.bind(this));
        html.find(".hit-dice-roll").on("click", this._onHitDice.bind(this));
        html
            .find('[name="data.health.max"]')
            .on("input", this._onHPMaxChange.bind(this));
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
    async _onItemDamage(event) {
        event.preventDefault();
        event.stopPropagation();
        const id = event.currentTarget.parentElement.dataset.itemId;
        const weapon = this.actor.getEmbeddedDocument("Item", id);
        if (!weapon) {
            console.error(`The item ID ${id} does not exist.`);
            return;
        }
        else if (!(weapon instanceof SWNRWeapon)) {
            console.error(`The item named ${weapon.name} is not a weapon.`);
            return;
        }
        return weapon.roll(event.shiftKey);
    }
    async _onReaction(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        function defineResult(text, range) {
            return {
                text: game.i18n.localize("swnr.npc.reaction." + text),
                type: 0,
                range,
                flags: { swnr: { type: text.toLocaleLowerCase() } },
                weight: 1 + range[1] - range[0],
                _id: text.toLocaleLowerCase().padEnd(16, "0"),
            };
        }
        const tableResults = [
            defineResult("hostile", [2, 2]),
            defineResult("negative", [3, 5]),
            defineResult("neutral", [6, 8]),
            defineResult("positive", [9, 11]),
            defineResult("friendly", [12, 12]),
        ];
        const rollTable = (await RollTable.create({
            name: "NPC Reaction",
            description: " ",
            formula: "2d6",
            results: tableResults,
        }, { temporary: true }));
        const { results } = await rollTable.draw();
        await this.actor.update({
            "data.reaction": (_a = results[0].id) === null || _a === void 0 ? void 0 : _a.split("0")[0],
        });
        // force re-render
        this.render();
    }
    async _onHPMaxChange(event) {
        event.preventDefault();
        //console.log("Changing NPC HP Max" ,  this, this.actor);
        await this.actor.update({ "data.health_max_modified": 1 });
    }
    // Set the max/value health based on D8 hit dice
    async _onHitDice(event) {
        event.preventDefault();
        event.stopPropagation();
        this.actor.rollHitDice(true);
        // Set the modified to not roll on drag
        await this.actor.update({ "data.health_max_modified": 1 });
    }
    async _onMorale(event) {
        var _a, _b;
        event.preventDefault();
        event.stopPropagation();
        const roll = new Roll("2d6");
        await roll.roll({ async: true });
        const flavor = +((_b = (_a = roll.terms[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0) > this.actor.data.data.moralScore
            ? game.i18n.localize("swnr.npc.morale.failure")
            : game.i18n.localize("swnr.npc.morale.success");
        roll.toMessage({ flavor, speaker: { actor: this.actor.id } });
    }
    async _onSavingThrow(event) {
        event.stopPropagation();
        event.preventDefault();
        this.actor.rollSave("");
    }
    async _onSkill(event) {
        event.preventDefault();
        event.stopPropagation();
        const trained = event.currentTarget.dataset.skillType === "trained";
        const skill = trained ? this.actor.data.data.skillBonus : 0;
        const roll = new Roll("2d6 + @skill", { skill });
        await roll.roll({ async: true });
        const flavor = game.i18n.format(trained
            ? game.i18n.localize("swnr.npc.skill.trained")
            : game.i18n.localize("swnr.npc.skill.untrained"), { actor: this.actor.name });
        roll.toMessage({ flavor, speaker: { actor: this.actor.id } });
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
}
export const sheet = NPCActorSheet;
export const types = ["npc"];

//# sourceMappingURL=npc-sheet.js.map
