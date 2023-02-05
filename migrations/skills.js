import { registerMigration } from "../migration.js";
import { SWNRBaseItem } from "../module/base-item.js";
registerMigration(SWNRBaseItem, "0.4.0", 0, (item, pastUpdates) => {
    if (item.data.type === "skill" && item.data.data.source === "psychic")
        pastUpdates["data.source"] = "Psionic";
    return pastUpdates;
});

//# sourceMappingURL=skills.js.map
