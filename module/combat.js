export class SWNRCombatant extends Combatant {
    /** @override */
    _getInitiativeFormula() {
        var _a, _b, _c;
        const actor = this.actor;
        if (actor && game.system.data.initiative) {
            const init = game.system.data.initiative;
            if (actor.type == "character" && ((_a = actor.data.data.tweak) === null || _a === void 0 ? void 0 : _a.advInit)) {
                return `{${game.system.data.initiative},${game.system.data.initiative}}kh`;
            }
            if (actor.type == "ship") {
                if (actor.data.data.roles.bridge != "") {
                    const pilot = (_b = game.actors) === null || _b === void 0 ? void 0 : _b.get(actor.data.data.roles.bridge);
                    if (pilot && pilot.type == "character") {
                        const mod = pilot.data.data.stats.int.mod >= pilot.data.data.stats.dex.mod
                            ? pilot.data.data.stats.int.mod
                            : pilot.data.data.stats.dex.mod;
                        return `1d8+${mod}`;
                    }
                }
                return "1d8";
            }
            return init;
        }
        else {
            (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.info("Error getting init roll or actor. Falling back on 1d8");
            return "1d8";
        }
    }
}

//# sourceMappingURL=combat.js.map
