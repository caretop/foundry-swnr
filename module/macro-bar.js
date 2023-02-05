import { getDefaultImage } from "./utils.js";
// Avoiding adding an import for data type data
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function createSWNRMacro(data, slot) {
    var _a, _b, _c;
    if (game == null)
        return; // Quiet TS
    if (data.type !== "Item")
        return;
    if (!("data" in data))
        return (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.warn("You can only create macro buttons for owned Items");
    const item = data.data;
    const id = data.data._id;
    console.log("creating macro ", id, data);
    // Create the macro command
    const command = `game.swnr.rollItemMacro("${id}","${item.name}");`;
    let macro = (_b = game.macros) === null || _b === void 0 ? void 0 : _b.contents.find((m) => m.id === id && m.data.command === command);
    if (!macro) {
        const default_img = getDefaultImage(item.type);
        const image = default_img ? default_img : item.img;
        macro = await Macro.create({
            name: item.name,
            type: "script",
            img: image,
            command: command,
            flags: { "swnr.itemMacro": true },
        });
    }
    if (macro == null) {
        console.log("Was not able to create or find macro");
        return;
    }
    (_c = game.user) === null || _c === void 0 ? void 0 : _c.assignHotbarMacro(macro, slot);
}
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemId
 * @return {Promise}
 */
export async function rollItemMacro(itemId, itemName) {
    var _a, _b, _c, _d, _e;
    //if (game == null )  return;
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) {
        actor = (_a = game.actors) === null || _a === void 0 ? void 0 : _a.tokens[speaker.token];
        if (!actor && speaker.actor)
            actor = (_b = game.actors) === null || _b === void 0 ? void 0 : _b.get(speaker.actor);
        if (!actor)
            (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.error("Could not find actor for macro roll item. Select token");
        const item = actor ? actor.items.find((i) => i.id === itemId) : null;
        if (!item)
            (_d = ui.notifications) === null || _d === void 0 ? void 0 : _d.warn(`${actor.name} does not have the item ${itemName} you created the macro with`);
        // Trigger the item roll
        return item.roll();
    }
    else {
        (_e = ui.notifications) === null || _e === void 0 ? void 0 : _e.error("Select token for macro roll item");
    }
}

//# sourceMappingURL=macro-bar.js.map
