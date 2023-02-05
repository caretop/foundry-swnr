import { SWNRBaseActor } from "../base-actor";
import { SWNRShipDefense } from "../items/shipDefense";
import { SWNRShipFitting } from "../items/shipFitting";
import { SWNRShipWeapon } from "../items/shipWeapon";
import { HULL_DATA } from "./vehicle-hull-base";
import { SWNRBaseItem } from "../base-item";

export type SysToFail = "drive" | "wpn" | "def" | "fit";

export class SWNRShipActor extends SWNRBaseActor<"ship"> {
  ENGINE_ID = "SPIKE_DRIVE";

  getRollData(): this["data"]["data"] {
    this.data._source.data;
    const data = super.getRollData();
    // data.itemTypes = <SWNRCharacterData["itemTypes"]>this.itemTypes;
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  moveDates(n: number): void {
    if (game.modules?.get("foundryvtt-simple-calendar")?.active) {
      for (let x = 0; x < n; x++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        SimpleCalendar.api.changeDate({ day: 1 });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const c = SimpleCalendar.api.getCurrentCalendar();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line prettier/prettier
        const entries = SimpleCalendar.api.getNotesForDay(c.currentDate.year, c.currentDate.month, c.currentDate.day);
        if (entries && entries.length > 0) {
          for (const e of entries) {
            if (e.data.content.indexOf("due") >= 0) {
              ui.notifications?.info(`Reminder: ${e.data.content}`);
            }
          }
        }
      }
    }
  }

  async setScheduledDate(
    d: Date,
    type: "payment" | "maintenance"
  ): Promise<void> {
    if (game.modules?.get("foundryvtt-simple-calendar")?.active) {
      const title = `${type} due`;
      const content = `${type} due for ${this.name}`;
      const simpleDate = {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate() - 1,
        hour: 0,
        minute: 0,
        seconds: 0,
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await SimpleCalendar.api.addNote(
        title,
        content,
        simpleDate,
        simpleDate,
        true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        SimpleCalendar.api.NoteRepeat.Never,
        ["ship"]
      );
    }
  }

  prepareDerivedData(): void {
    const data = this.data.data;
    const shipClass = data.shipClass;
    let shipMass = data.mass.max;
    let shipPower = data.power.max;
    let shipHardpoint = data.hardpoints.max;

    let multiplier = 1;
    if (shipClass == "frigate") {
      multiplier = 2;
    } else if (shipClass == "cruiser") {
      multiplier = 3;
    } else if (shipClass == "capital") {
      multiplier = 4;
    }

    const shipInventory = <
      SWNRBaseItem<"shipDefense" | "shipWeapon" | "shipFitting">[]
    >this.items.filter(
      (i) =>
        i.type === "shipDefense" ||
        i.type === "shipWeapon" ||
        i.type === "shipFitting"
    );

    for (let i = 0; i < shipInventory.length; i++) {
      const item = shipInventory[i];
      let itemMass = item.data.data.mass;
      let itemPower = item.data.data.power;
      if (item.data.data.massMultiplier) {
        itemMass *= multiplier;
      }
      if (item.data.data.powerMultiplier) {
        itemPower *= multiplier;
      }
      shipMass -= itemMass;
      shipPower -= itemPower;
      if (item.type == "shipWeapon") {
        const itemHardpoint = item.data.data["hardpoint"];
        if (itemHardpoint) {
          shipHardpoint -= itemHardpoint;
        }
      }
    }
    data.power.value = shipPower;
    data.mass.value = shipMass;
    data.hardpoints.value = shipHardpoint;
  }

  async applyDefaulStats(hullType: string): Promise<void> {
    if (HULL_DATA[hullType]) {
      await this.update(HULL_DATA[hullType]);
    } else {
      console.log("hull type not found " + hullType);
    }
  }

  async useDaysOfLifeSupport(nDays: number): Promise<void> {
    if (this.data.data.crew.current > 0) {
      let newLifeDays = this.data.data.lifeSupportDays.value;
      newLifeDays -= this.data.data.crew.current * nDays;
      await this.update({
        "data.lifeSupportDays.value": newLifeDays,
      });
      if (newLifeDays <= 0) {
        ui.notifications?.error("Out of life support!!!");
      }
    }
  }

  async rollSensor(
    actorName: string | null,
    targetMod: number,
    observerMod: number,
    skillMod: number,
    statMod: number,
    dice: string,
    rollingAs: "observer" | "target" | "single",
    rollMode: "roll" | "gmroll" | "blindroll"
  ): Promise<void> {
    const template = "systems/swnr/templates/chat/sensor-roll.html";
    let mod = observerMod;
    let opposedMod = targetMod;
    let typeDesc = "Observer";
    let otherDesc = "Target";
    if (rollingAs == "target") {
      mod = targetMod;
      opposedMod = observerMod;
      typeDesc = "Target";
      otherDesc = "Observer";
    }
    const rollData = {
      dice,
      skillMod,
      statMod,
      mod,
    };
    const skillRollStr = `${dice} + @skillMod + @statMod + @mod`;
    const skillRoll = new Roll(skillRollStr, rollData);
    await skillRoll.roll({ async: true });

    const poolRolls: Roll[] = [skillRoll];

    let opposedRoll: null | Roll = null;
    let opposedRollStr: null | string = null;

    if (rollingAs != "single") {
      opposedRoll = new Roll(`2d6 + @opposedMod`, { opposedMod });
      await opposedRoll.roll({ async: true });
      poolRolls.push(opposedRoll);
      opposedRollStr = await opposedRoll.render();
    }
    const dialogData = {
      skillRoll: await skillRoll.render(),
      skillRollStr,
      opposedRoll: opposedRollStr,
      rollingAs,
      actorName,
      typeDesc,
      otherDesc,
    };
    const diceData = Roll.fromTerms([PoolTerm.fromRolls(poolRolls)]);
    const chatContent = await renderTemplate(template, dialogData);

    let gm_ids: string[] | null = ChatMessage.getWhisperRecipients("GM")
      .filter((i) => i)
      .map((i) => i.id)
      .filter((i): i is string => i !== null);
    let blind = false;

    if (rollMode == "roll") {
      gm_ids = null;
    } else if (rollMode == "blindroll") {
      blind = true;
    }
    const chatData = {
      speaker: { alias: actorName },
      roll: JSON.stringify(diceData),
      content: chatContent,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      whisper: gm_ids,
      blind,
    };

    getDocumentClass("ChatMessage").applyRollMode(chatData, rollMode);
    getDocumentClass("ChatMessage").create(chatData);
  }

  async rollSpike(
    pilotId: string,
    pilotName: string | null,
    skillMod: number,
    statMod: number,
    mod: number,
    dice: string,
    difficulty: number,
    travelDays: number
  ): Promise<void> {
    const template = "systems/swnr/templates/chat/spike-roll.html";
    const rollData = {
      dice,
      skillMod,
      statMod,
      mod,
    };
    const skillRollStr = `${dice} + @skillMod + @statMod + @mod`;
    const skillRoll = new Roll(skillRollStr, rollData);
    await skillRoll.roll({ async: true });

    const pass =
      skillRoll.total && skillRoll.total >= difficulty ? true : false;
    const failRoll: string | null = null;
    let failText: string | null = null;
    if (!pass) {
      const failRoll = new Roll("3d6");
      await failRoll.roll({ async: true });
      switch (failRoll.total) {
        case 3:
          // eslint-disable-next-line no-case-declarations
          const fRoll = new Roll("1d6");
          await fRoll.roll({ async: true });
          failText = game.i18n.localize("swnr.chat.spike.fail3");
          failText += `<br> Rolled: ${fRoll.total}`;
          // Break all systems and drive
          break;
        case 4:
        case 5:
          failText = game.i18n.localize("swnr.chat.spike.fail4-5");
          // 50% each breaks. if engine breaks 1d6 hexes away and fail3
          break;
        case 6:
        case 7:
        case 8:
          failText = game.i18n.localize("swnr.chat.spike.fail6-8");
          // one random breaks. if engine breaks 1d6 hexes away and fail3
          break;
        case 9:
        case 10:
        case 11:
        case 12:
          failText = game.i18n.localize("swnr.chat.spike.fail9-12");
          break;
        case 13:
        case 14:
        case 15:
          travelDays = 0;
          failText = game.i18n.localize("swnr.chat.spike.fail13-15");
          break;
        case 16:
        case 17:
          travelDays *= 2;
          failText = game.i18n.localize("swnr.chat.spike.fail16-17");
          break;
        case 18:
          failText = game.i18n.localize("swnr.chat.spike.fail18");
          break;
      }
    }

    const dialogData = {
      skillRoll: await skillRoll.render(),
      skillRollStr,
      travelDays,
      pass,
      failRoll,
      failText,
      pilotName,
    };
    const rollMode = game.settings.get("core", "rollMode");
    const poolRolls = [skillRoll];
    if (failRoll) {
      poolRolls.push(failRoll);
    }
    const diceData = Roll.fromTerms([PoolTerm.fromRolls(poolRolls)]);
    const chatContent = await renderTemplate(template, dialogData);
    const chatData = {
      speaker: { alias: pilotName },
      roll: JSON.stringify(diceData),
      content: chatContent,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    };

    getDocumentClass("ChatMessage").applyRollMode(chatData, rollMode);
    getDocumentClass("ChatMessage").create(chatData);

    this.useDaysOfLifeSupport(travelDays);
    if (travelDays > 0) {
      let fuel = this.data.data.fuel.value;
      fuel -= 1;
      await this.update({ "data.fuel.value": fuel });
      if (fuel <= 0) {
        ui.notifications?.info("Out of fuel...");
      }
      this.moveDates(travelDays);
    }
  }

  async calcCost(maintenance: boolean): Promise<void> {
    const hull = this.data.data.shipHullType;
    const shipClass = this.data.data.shipClass;
    this.data.data.maintenanceCost;
    const shipData = HULL_DATA[hull];
    if (shipData) {
      let baseCost = shipData.data.cost;
      let multiplier = 1;
      if (shipClass == "frigate") {
        multiplier = 10;
      } else if (shipClass == "cruiser") {
        multiplier = 25;
      } else if (shipClass == "capital") {
        multiplier = 100;
      }

      const shipInventory = <
        SWNRBaseItem<"shipDefense" | "shipWeapon" | "shipFitting">[]
      >this.items.filter(
        (i) =>
          i.type === "shipDefense" ||
          i.type === "shipWeapon" ||
          i.type === "shipFitting"
      );

      const shipHasSystemDrive = shipInventory.find(
        (elem) => elem.name == "System Drive"
      );
      if (shipHasSystemDrive) {
        baseCost *= 0.9;
      }

      for (let i = 0; i < shipInventory.length; i++) {
        const item = shipInventory[i];
        const itemCost = item.data.data.costMultiplier
          ? item.data.data.cost * multiplier
          : item.data.data.cost;
        baseCost += itemCost;
      }

      const updateJSON = { cost: baseCost };
      if (maintenance) {
        updateJSON["maintenanceCost"] = baseCost * 0.05;
      }
      await this.update({ data: updateJSON });
    }
  }

  rollCrisis(): void {
    //TODO localize. Allow for rolls.
    const crisisArray = [
      "<b>Armor Loss:</b><i>(Continuing)</i><br> The hit melted an important patch of ship  armor, cracked an internal support, or exposed a      sensitive system. Until resolved, the ship’s Armor      rating is halved, rounded down.",
      "<b>Cargo Loss:</b><i>(Acute)</i><br> The hit has gored open a cargo bay, threatening to dump the hold or expose delicate contents to ruinous damage. If not resolved by the end of the next round, lose d10*10% of the ship’s cargo.",
      "<b>Crew Lost:</b><i>(Acute)</i><br> Brave crew risk their lives to keep damaged systems operating. Describe the danger they face. If the Crisis is not resolved by the end of the next round, 10% of the ship’s maximum crew are incapacitated, not counting any Extended Life Support fittings. Half these crewmen are dead or permanently disabled, and the other half return to duty in a week. Extended Medbay fittings halve the number of dead and crippled. If the ship has run out of NPC crew when it takes this Crisis, a random PC must roll a Physical save; on a success, they lose half their hit points, while on a failure, they are mortally wounded. If not stabilized by the end of the ship’s turn through some PC taking a Deal With A Crisis action to heal them, they will die.",
      "<b>Engine Lock:</b><i>(Continuing)</i><br> The ship’s engine has been jammed or control circuits have gone non-responsive. Until resolved, no bridge actions can be taken, though the pilot can still perform general actions.",
      "<b>Fuel Bleed:</b><i>(Acute)</i><br> The ship’s fuel tanks have been holed or emergency vents have been force-triggered by battle damage. If not resolved by the end of the next round, the ship will jettison all fuel except the minimal amount needed for in-system operation.",
      "<b>Haywire Systems:</b><i>(Continuing)</i><br> Critical command links have been damaged or disordered by the hit. Until resolved, the ship starts each round at -2 Command Points. Multiple such Crises can stack this penalty, crippling a ship until the Crises are resolved.",
      "<b>Hull Breach:</b><i>(Acute)</i><br> The hull has been damaged in a way that is currently non-critical but is about to tear open an important compartment or crumple on vital systems. If not resolved by the end of the next round, the ship will take damage: 1d10 for fighter-class hulls, 2d10 for frigates, 3d10 for cruisers, and 4d10 for capital hulls, all ignoring Armor.",
      "<b>System Damage:</b><i>(Continuing)</i><br> One of the ship’s systems has been cooked by the hit. The GM randomly picks a weapon, fitting, or engine; that system is disabled as if hit with a targeted shot, with drives suffering a 1 point drive level decrease. Disabled systems hit by this Crisis or drives reduced below drive-0 are destroyed and cannot be repaired during combat.",
      "<b>Target Decalibration:</b><i>(Continuing)</i><br> The gunnery computers are hopelessly confused and cannot lock the ship’s weaponry on a target until this Crisis is resolved.",
      "<b>VIP Imperiled:</b><i>(Acute)</i><br> Shipboard damage threatens a random PC or important NPC. That victim must immediately roll a Physical saving throw; on a success, they lose half their hit points, and on a failure they are mortally wounded. NPC crew can make a free attempt to stabilize the downed VIP using their usual NPC skill bonus. If the NPC fails, and no PC takes a Deal With a Crisis action to successfully stabilize them by the end of the ship’s turn, they die.",
    ];
    const coin = this._getRandomInt(crisisArray.length);
    const content = `<h3>Crisis</h3>${crisisArray[coin]}<br><i>10 base difficulty check</i>`;
    const chatData = {
      content: content,
    };
    ChatMessage.create(chatData);
  }

  _getRandomInt(exclusiveMax: number): number {
    return Math.floor(Math.random() * exclusiveMax);
  }

  async _breakItem(
    id: string,
    forceDestroy: boolean
  ): Promise<[Record<string, unknown> | null, string]> {
    //console.log("breaking ", id);
    if (!id || id == "") {
      //console.log("Nothing to break");
      throw new TypeError();
    }
    if (id == this.ENGINE_ID) {
      let curSpike = this.data.data.spikeDrive.value;
      if (forceDestroy) {
        curSpike = 0;
      } else {
        curSpike -= 1;
      }
      await this.update({ "data.spikeDrive.value": curSpike });
      if (curSpike == 0) {
        return [null, "Engine Destroyed"];
      } else {
        return [null, "Engine Damaged"];
      }
    } else {
      const item = <SWNRShipDefense | SWNRShipFitting | SWNRShipWeapon>(
        this.getEmbeddedDocument("Item", id)
      );
      //console.log(item);
      if (
        forceDestroy ||
        item?.data.data.broken ||
        item?.data.data.juryRigged
      ) {
        let msg = `${item.name} Destroyed`;
        if (item?.data.data.juryRigged) {
          msg += " (item was jury-rigged)";
        }
        const eitem = {
          _id: id,
          data: { destroyed: true, broken: false, juryRigged: false },
        };
        return [eitem, msg];
      } else {
        const msg = `${item.name} Disabled`;
        const eitem = {
          _id: id,
          data: { destroyed: false, broken: true, juryRigged: false },
        };
        return [eitem, msg];
      }
    }
  }

  async rollSystemFailure(
    sysToInclude: SysToFail[],
    whatToRoll: string
  ): Promise<void> {
    const candidateIds: string[] = [];
    let idx = sysToInclude.indexOf("drive");
    if (idx > -1) {
      if (this.data.data.spikeDrive.value > 0) {
        candidateIds.push(this.ENGINE_ID);
      }
      sysToInclude.splice(idx, 1);
    }
    //Get wpns if marked
    idx = sysToInclude.indexOf("wpn");
    if (idx > -1) {
      for (const i of this.itemTypes.shipWeapon) {
        if (i.id && !i.data.data["destroyed"]) {
          candidateIds.push(i.id);
        }
      }
      sysToInclude.splice(idx, 1);
    }
    //Get def if marked
    idx = sysToInclude.indexOf("def");
    if (idx > -1) {
      for (const i of this.itemTypes.shipDefense) {
        if (i.id && !i.data.data["destroyed"]) {
          candidateIds.push(i.id);
        }
      }
      sysToInclude.splice(idx, 1);
    }
    //Get fit if marked
    idx = sysToInclude.indexOf("fit");
    if (idx > -1) {
      for (const i of this.itemTypes.shipFitting) {
        if (i.id && !i.data.data["destroyed"]) {
          candidateIds.push(i.id);
        }
      }
      sysToInclude.splice(idx, 1);
    }
    // Should be nothing left
    if (sysToInclude.length > 0) {
      ui.notifications?.error("Sys to fail not evaluated: " + sysToInclude);
    }
    const msg: string[] = [];
    const eitems: Record<string, unknown>[] = [];
    if (whatToRoll == "dest-all") {
      for (const itemId of candidateIds) {
        const [eitem, m] = await this._breakItem(itemId, true);
        msg.push(m);
        if (eitem) {
          eitems.push(eitem);
        }
      }
    } else if (whatToRoll == "break-all") {
      for (const itemId of candidateIds) {
        const [eitem, m] = await this._breakItem(itemId, false);
        msg.push(m);
        if (eitem) {
          eitems.push(eitem);
        }
      }
    } else if (whatToRoll == "all-50") {
      for (const itemId of candidateIds) {
        const coin = this._getRandomInt(2);
        if (coin == 0) {
          const [eitem, m] = await this._breakItem(itemId, false);
          msg.push(m);
          if (eitem) {
            eitems.push(eitem);
          }
        }
      }
    } else if (whatToRoll == "break-1") {
      if (candidateIds.length > 0) {
        const coin = this._getRandomInt(candidateIds.length);
        const [eitem, m] = await this._breakItem(candidateIds[coin], false);
        msg.push(m);
        if (eitem) {
          eitems.push(eitem);
        }
      }
    } else {
      ui.notifications?.error(
        "Sys to fail not evaluated. What to include " + whatToRoll
      );
      return;
    }
    msg.filter((i) => i != "");
    let content = "<h3>Nothing to fail</h3>";
    if (msg.length > 0) {
      if (eitems.length > 0) {
        await this.updateEmbeddedDocuments("Item", eitems);
      }
      content = "<h3>Systems Failure:</h3>";
      for (let i = 0; i < msg.length; i++) {
        if (msg[i]) {
          content += `<p>${msg[i]}</p>`;
        }
      }
    }
    const chatData = {
      content: content,
    };
    ChatMessage.create(chatData);
  }

  async addCrew(actorId: string): Promise<void> {
    const actor = game.actors?.get(actorId);
    if (actor) {
      const crewMembers = this.data.data.crewMembers;
      //Only add crew once
      if (crewMembers.indexOf(actorId) == -1) {
        let crew = this.data.data.crew.current;
        crew += 1;
        crewMembers.push(actorId);
        await this.update({
          "data.crew.current": crew,
          "data.crewMembers": crewMembers,
        });
      }
    } else {
      ui.notifications?.error("Actor added no longer exists");
    }
  }

  async removeCrew(actorId: string): Promise<void> {
    const crewMembers = this.data.data.crewMembers;
    //Only remove if there
    const idx = crewMembers.indexOf(actorId);
    if (idx == -1) {
      ui.notifications?.error("Crew member not found");
    } else {
      crewMembers.splice(idx, 1);
      let crew = this.data.data.crew.current;
      crew -= 1;
      if (this.data.data.roles) {
        const roles = this.data.data.roles;
        if (roles.captain == actorId) {
          roles.captain = "";
        }
        if (roles.comms == actorId) {
          roles.comms = "";
        }
        if (roles.engineering == actorId) {
          roles.engineering = "";
        }
        if (roles.gunnery == actorId) {
          roles.gunnery = "";
        }
        if (roles.bridge == actorId) {
          roles.bridge = "";
        }
        await this.update({
          "data.crew.current": crew,
          "data.crewMembers": crewMembers,
          "data.roles": roles,
        });
      } else {
        await this.update({
          "data.crew.current": crew,
          "data.crewMembers": crewMembers,
        });
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async _preCreate(actorDataConstructorData, options, user): Promise<void> {
    await super._preCreate(actorDataConstructorData, options, user);
    if (
      actorDataConstructorData.type &&
      this.data._source.img == "icons/svg/mystery-man.svg"
    ) {
      const shipImg = "systems/swnr/assets/icons/starfighter.png";
      this.data._source.img = shipImg;
    }
  }
}

export const document = SWNRShipActor;
export const name = "ship";
