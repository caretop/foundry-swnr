export class SWNRBaseActor extends Actor {
    async rollSave(save) {
        const roll = new Roll("1d20");
        await roll.roll({ async: true });
        const flavor = `Rolling Save`;
        roll.toMessage({ flavor, speaker: { actor: this.id } });
    }
}

//# sourceMappingURL=base-actor.js.map
