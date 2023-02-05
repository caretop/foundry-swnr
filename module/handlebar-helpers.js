export default function registerHelpers() {
    Handlebars.registerHelper("debug", function () {
        return JSON.stringify(this, null, 2);
    });
    Handlebars.registerHelper("stringify", function (obj) {
        return JSON.stringify(obj, null, 2);
    });
    Handlebars.registerHelper("concat", function (a, b) {
        return a + b;
    });
    Handlebars.registerHelper("trim", function (obj, n) {
        if (!obj)
            return "";
        if (obj.length <= n)
            return obj;
        return obj.substring(0, n) + "...";
    });
    Handlebars.registerHelper("wouldTrim", function (obj, n) {
        if (!obj)
            return false;
        if (obj.length <= n)
            return false;
        return true;
    });
    Handlebars.registerHelper("firstLetter", function (obj) {
        if (!obj)
            return "";
        return obj.substring(0, 1).toUpperCase();
    });
    Handlebars.registerHelper("zeroWidthBreaker", (message) => {
        return new Handlebars.SafeString(message.replace(/[:/]/g, (match) => Handlebars.Utils.escapeExpression(match) + "&#8203;"));
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Handlebars.registerHelper("halfway", (array, index) => {
        if (Math.ceil(array.length / 2) === index) {
            return true;
        }
        return false;
    });
    Handlebars.registerHelper("mod2", (index) => {
        return index % 2 == 0;
    });
    Handlebars.registerHelper("getPCStatModForWeapon", (actor, weapon, forDamage = false) => {
        var _a, _b;
        const skillID = weapon.data.data.skill;
        let skillItem = actor.getEmbeddedDocument("Item", skillID);
        if (!skillItem || skillItem.data.type !== "skill") {
            skillItem = undefined;
        }
        //console.log({ skillID, skillItem });
        const skillBonus = forDamage && weapon.data.data.skillBoostsDamage
            ? (_a = skillItem === null || skillItem === void 0 ? void 0 : skillItem.data.data.rank) !== null && _a !== void 0 ? _a : -1
            : 0;
        const untrainedPenalty = skillBonus === -1 ? -1 : 0;
        const stats = actor.data.data.stats;
        const statsToCheck = [stats[weapon.data.data.stat].mod];
        if (weapon.data.data.secondStat !== "none")
            statsToCheck.push(((_b = stats[weapon.data.data.secondStat]) === null || _b === void 0 ? void 0 : _b.mod) || 0);
        return Math.max(...statsToCheck) + skillBonus + untrainedPenalty;
    });
}

//# sourceMappingURL=handlebar-helpers.js.map
