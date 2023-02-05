import { SWNRBaseItem } from "./../base-item.js";
export class SWNRPower extends SWNRBaseItem {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async roll(_shiftKey = false) {
        var _a, _b;
        if (!this.actor) {
            const message = `Called power.roll on item without an actor.`;
            (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.error(message);
            new Error(message);
            return;
        }
        const powerRoll = new Roll(this.data.data.roll ? this.data.data.roll : "0");
        await powerRoll.roll({ async: true });
        const dialogData = {
            actor: this.actor.data,
            power: this,
            powerRoll: await powerRoll.render(),
        };
        const rollMode = game.settings.get("core", "rollMode");
        const template = "systems/swnr/templates/chat/power-roll.html";
        const chatContent = await renderTemplate(template, dialogData);
        const chatData = {
            speaker: ChatMessage.getSpeaker({ actor: (_b = this.actor) !== null && _b !== void 0 ? _b : undefined }),
            content: chatContent,
            roll: JSON.stringify(powerRoll),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        };
        getDocumentClass("ChatMessage").applyRollMode(chatData, rollMode);
        getDocumentClass("ChatMessage").create(chatData);
    }
}
export const document = SWNRPower;
export const name = "power";

//# sourceMappingURL=power.js.map
