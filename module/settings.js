export const registerSettings = function () {
    // Register any custom system settings here
    /**
     * Track the system version upon which point a migration was last applied
     */
    game.settings.register("swnr", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: "0.0",
    });
    game.settings.register("swnr", "useHomebrewLuckSave", {
        name: "swnr.settings.useHomebrewLuckSave",
        hint: "swnr.settings.useHomebrewLuckSaveHint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("swnr", "useRollNPCHD", {
        name: "swnr.settings.useRollNPCHD",
        hint: "swnr.settings.useRollNPCHDHint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("swnr", "addShockMessage", {
        name: "swnr.settings.addShockMessage",
        hint: "swnr.settings.addShockMessageHint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("swnr", "showTempAttrMod", {
        name: "swnr.settings.showTempAttrMod",
        hint: "swnr.settings.showTempAttrModHint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("swnr", "attrRoll", {
        name: "swnr.settings.attrRoll",
        hint: "swnr.settings.attrRollHint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "none": game.i18n.localize("swnr.settings.attrRollNo"),
            "d20": game.i18n.localize("swnr.settings.attrRolld20"),
            "2d6": game.i18n.localize("swnr.settings.attrRoll2d6"),
            "d20under": game.i18n.localize("swnr.settings.attrRollUnder"),
            "d20underEqual": game.i18n.localize("swnr.settings.attrRollUnderEqual"),
        },
        default: "none",
        onChange: value => {
        }
    });
};

//# sourceMappingURL=settings.js.map
