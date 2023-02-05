import { SWNRCharacterActor } from "./actors/character";
import { SWNRWeapon } from "./items/weapon";

export default function registerHelpers(): void {
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
    if (!obj) return "";
    if (obj.length <= n) return obj;
    return obj.substring(0, n) + "...";
  });

  Handlebars.registerHelper("wouldTrim", function (obj, n) {
    if (!obj) return false;
    if (obj.length <= n) return false;
    return true;
  });

  Handlebars.registerHelper("firstLetter", function (obj) {
    if (!obj) return "";
    return obj.substring(0, 1).toUpperCase();
  });
  Handlebars.registerHelper("zeroWidthBreaker", (message: string) => {
    return new Handlebars.SafeString(
      message.replace(
        /[:/]/g,
        (match) => Handlebars.Utils.escapeExpression(match) + "&#8203;"
      )
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Handlebars.registerHelper("halfway", (array: any[], index: number) => {
    if (Math.ceil(array.length / 2) === index) {
      return true;
    }
    return false;
  });

  Handlebars.registerHelper("mod2", (index: number) => {
    return index % 2 == 0;
  });

  Handlebars.registerHelper(
    "getPCStatModForWeapon",
    (
      actor: SWNRCharacterActor,
      weapon: SWNRWeapon,
      forDamage = false
    ): number => {
      const skillID = weapon.data.data.skill;
      let skillItem = actor.getEmbeddedDocument("Item", skillID) as
        | (Item & { data: { type: "skill" } })
        | undefined;
      if (!skillItem || skillItem.data.type !== "skill") {
        skillItem = undefined;
      }
      //console.log({ skillID, skillItem });
      const skillBonus: number =
        forDamage && weapon.data.data.skillBoostsDamage
          ? skillItem?.data.data.rank ?? -1
          : 0;
      const untrainedPenalty = skillBonus === -1 ? -1 : 0;
      const stats = actor.data.data.stats;
      const statsToCheck = [stats[weapon.data.data.stat].mod];
      if (weapon.data.data.secondStat !== "none")
        statsToCheck.push(stats[weapon.data.data.secondStat]?.mod || 0);
      return Math.max(...statsToCheck) + skillBonus + untrainedPenalty;
    }
  );
}
