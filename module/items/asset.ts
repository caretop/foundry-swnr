import { SWNRFactionActor } from "../actors/faction";
import { ValidatedDialog } from "../ValidatedDialog";
import { AssetType } from "../item-types";
import { SWNRBaseItem } from "./../base-item";

type AttackRolls = [Roll, Roll] | null;

export class SWNRFactionAsset extends SWNRBaseItem<"asset"> {
  popUpDialog?: Dialog;

  async getAttackRolls(isOffense: boolean): Promise<AttackRolls> {
    const data = this.data.data;
    let hitBonus = 0;
    const damage = isOffense ? data.attackDamage : data.counter;
    if (!damage && isOffense) {
      ui.notifications?.info("No damage to roll for asset");
      return null;
    }
    const attackType = isOffense ? data.attackSource : data.assetType;
    if (!this.actor) {
      ui.notifications?.error("Asset must be associated with a faction");
      return null;
    }
    if (this.actor.type != "faction") {
      ui.notifications?.error("Asset must be associated with a faction");
      return null;
    }
    const actor: SWNRFactionActor = this.actor;
    if (attackType) {
      if (attackType === "cunning") {
        hitBonus = actor.data.data.cunningRating;
      } else if (attackType === "force") {
        hitBonus = actor.data.data.forceRating;
      } else if (attackType === "wealth") {
        hitBonus = actor.data.data.wealthRating;
      }
    }
    const rollData = {
      hitBonus,
    };
    const hitRollStr = "1d10 + @hitBonus";
    const hitRoll = await new Roll(hitRollStr, rollData).roll({ async: true });
    let damageDice = isOffense ? data.attackDamage : data.counter;
    if (!damageDice) {
      damageDice = "0";
    }
    const damageRoll = await new Roll(damageDice, rollData).roll({
      async: true,
    });
    return [hitRoll, damageRoll];
  }

  async _attack(isOffense: boolean): Promise<void> {
    const attackRolls: AttackRolls = await this.getAttackRolls(isOffense);
    if (!attackRolls) {
      return;
    }
    const diceData = Roll.fromTerms([
      PoolTerm.fromRolls([attackRolls[0], attackRolls[1]]),
    ]);
    const attackKey = isOffense
      ? "swnr.sheet.faction.attack-roll"
      : "swnr.sheet.faction.counter-roll";

    const dialogData = {
      desc: this.data.data.description,
      name: `${this.actor?.name} - ${this.name}`,
      hitRoll: await attackRolls[0].render(),
      damageRoll: await attackRolls[1].render(),
      attackKey: game.i18n.localize(attackKey),
      attackSpecial: this.data.data.attackSpecial,
    };
    const template = "systems/swnr/templates/chat/asset-attack.html";
    const chatContent = await renderTemplate(template, dialogData);

    if (this.actor?.type == "faction") {
      const actor: SWNRFactionActor = this.actor;
      actor.logMessage("Attack Roll", chatContent, null, null);
    } else {
      const chatData = {
        roll: JSON.stringify(diceData),
        content: chatContent,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      };
      getDocumentClass("ChatMessage").applyRollMode(chatData, "gmroll");
      getDocumentClass("ChatMessage").create(chatData);
    }
  }

  // Search other factions for attack targets with targetType
  async _search(targetType: AssetType | ""): Promise<void> {
    if (!targetType) {
      ui.notifications?.info(
        "Attacking asset has no target type (cunning/wealth/force)"
      );
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherActiveFactions: any[] | undefined = game.actors?.filter(
      (i) =>
        i.type === "faction" &&
        i.data.data.active == true &&
        this.actor?.id != i.id
    );
    if (!otherActiveFactions || otherActiveFactions.length == 0) {
      ui.notifications?.info("No other active factions found");
      return;
    }
    // id - > [faction, array of targets]
    const targetFactions: Record<
      string,
      [SWNRFactionActor, SWNRBaseItem<"asset">[]]
    > = {};
    // id -> name
    const factionIdNames: Record<string, string | null> = {};
    for (const f of otherActiveFactions) {
      const fA = <SWNRFactionActor>f;
      if (targetType === "cunning") {
        if (fA.id && fA.data.data.cunningAssets.length > 0) {
          targetFactions[fA.id] = [fA, fA.data.data.cunningAssets];
          factionIdNames[fA.id] = fA.name;
        }
      } else if (targetType === "force") {
        if (fA.id && fA.data.data.forceAssets.length > 0) {
          targetFactions[fA.id] = [fA, fA.data.data.forceAssets];
          factionIdNames[fA.id] = fA.name;
        }
      } else if (targetType === "wealth") {
        if (fA.id && fA.data.data.wealthAssets.length > 0) {
          targetFactions[fA.id] = [fA, fA.data.data.wealthAssets];
          factionIdNames[fA.id] = fA.name;
        }
      }
    }
    if (Object.keys(targetFactions).length == 0) {
      ui.notifications?.info(
        `${otherActiveFactions.length} other active factions found, but no ${targetType} assets were found`
      );
      return;
    }
    const dialogData = {
      faction: this.actor,
      attackingAsset: this,
      targetFactionsIdNames: factionIdNames,
      targets: targetFactions,
    };
    const template = "systems/swnr/templates/dialogs/select-asset-target.html";
    const html = renderTemplate(template, dialogData);

    const _rollForm = async (html: HTMLFormElement) => {
      const form = <HTMLFormElement>html[0].querySelector("form");

      const attackedFactionId = (<HTMLInputElement>(
        form.querySelector('[name="targetFaction"]')
      ))?.value;
      const attackedFaction = game.actors?.get(attackedFactionId);
      if (!attackedFaction) {
        ui.notifications?.info("Attack faction not selected or not found");
        return;
      }
      const assetFormName = `[name="asset-${attackedFactionId}"]`;
      const attackedAssetId = (<HTMLInputElement>(
        form.querySelector(assetFormName)
      ))?.value;
      const attackedAsset = attackedFaction?.getEmbeddedDocument(
        "Item",
        attackedAssetId
      ) as SWNRFactionAsset;
      if (!attackedAsset) {
        ui.notifications?.info("Attacked asset not selected or not found");
        return;
      }
      const attackRolls: AttackRolls = await this.getAttackRolls(true);
      const defenseRolls: AttackRolls = await attackedAsset.getAttackRolls(
        false
      );
      if (!attackRolls || !defenseRolls) {
        ui.notifications?.error("Unable to roll for asset");
        return;
      }
      const hitRoll: Roll = attackRolls[0];
      const defRoll: Roll = defenseRolls[0];
      if (
        !hitRoll ||
        hitRoll == undefined ||
        !hitRoll.total ||
        !defRoll.total
      ) {
        return;
      }
      let attackDamage: string | undefined | null = null;
      let defDamage: string | undefined | null = null;
      let attackDesc = "";
      if (hitRoll.total > defRoll.total) {
        //attacker hits
        attackDamage = await attackRolls[1].render();
        attackDesc = "Attacker Hits";
      } else if (hitRoll.total < defRoll.total) {
        //defender hits
        defDamage = await defenseRolls[1].render();
        attackDesc = "Defender Hits Counter ";
      } else {
        //both hit
        attackDamage = await attackRolls[1].render();
        defDamage = await defenseRolls[1].render();
        attackDesc = "Tie! Both do damage.<br>";
      }
      const name = `${this.actor?.name} - ${this.name} attacking ${attackedAsset.name} (${attackedFaction.name})`;
      const dialogData = {
        desc: this.data.data.description,
        name,
        hitRoll: await hitRoll.render(),
        defRoll: await defRoll.render(),
        attackDamage: attackDamage,
        defDamage: defDamage,
        attackDesc: attackDesc,
        attackKey: game.i18n.localize("attackKey"),
        defenseSpecial: attackedAsset.data.data.attackSpecial,
        attackSpecial: this.data.data.attackSpecial,
      };
      const template = "systems/swnr/templates/chat/asset-attack-def.html";
      const chatContent = await renderTemplate(template, dialogData);
      if (this.actor?.type == "faction") {
        this.actor.logMessage(name, chatContent);
      } else {
        const chatData = {
          content: chatContent,
          type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
        };
        getDocumentClass("ChatMessage").applyRollMode(chatData, "gmroll");
        getDocumentClass("ChatMessage").create(chatData);
      }
    };

    this.popUpDialog?.close();
    this.popUpDialog = new ValidatedDialog(
      {
        title: `Select asset to attack for ${this.name}`,
        content: await html,
        default: "roll",
        buttons: {
          roll: {
            label: game.i18n.localize("swnr.sheet.faction.attack"),
            callback: _rollForm,
          },
        },
      },
      {
        classes: ["swnr"],
      }
    );
    this.popUpDialog.render(true);
  }

  async _logAction(): Promise<void> {
    // Basic template rendering data
    let content = `<h3> ${this.name} </h3>`;
    if ("description" in this.data.data) {
      content += `<span class="flavor-text"> ${this.data.data.description}</span>`;
    } else {
      content += "<span class='flavor-text'> No Description</span>";
    }
    if (this.actor?.type == "faction") {
      const actor: SWNRFactionActor = this.actor;
      actor.logMessage("Attack Roll", content);
    } else {
      const gm_ids: string[] = ChatMessage.getWhisperRecipients("GM")
        .filter((i) => i)
        .map((i) => i.id)
        .filter((i): i is string => i !== null);

      ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: content, //${item.data.description}
        type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
        whisper: gm_ids,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async roll(_shiftKey = false): Promise<void> {
    const data = this.data.data;
    if (data.unusable) {
      ui.notifications?.error("Asset is unusable");
      return;
    }
    if ((data.attackDamage && data.attackDamage !== "") || data.counter) {
      const d = new Dialog(
        {
          title: "Attack with Asset",
          content:
            "<p>Do you want to roll an attack(default), counter, search for an asset to attack, or use asset/chat description?</p>",
          buttons: {
            attack: {
              icon: '<i class="fas fa-check"></i>',
              label: "Attack",
              callback: () => this._attack(true),
            },
            counter: {
              icon: '<i class="fas fa-check"></i>',
              label: "Counter",
              callback: () => this._attack(false),
            },
            search: {
              icon: '<i class="fas fa-check"></i>',
              label: "Search active factions for an asset to attack",
              callback: () => this._search(data.attackTarget),
            },
            action: {
              icon: '<i class="fas fa-check"></i>',
              label: "Use Action",
              callback: () => this._logAction(),
            },
          },
          default: "attack",
        },
        {
          classes: ["swnr"],
        }
      );
      d.render(true);
    } else {
      this._logAction();
    }
  }
}

export const document = SWNRFactionAsset;
export const name = "asset";
