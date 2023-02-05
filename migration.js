const VERSION_KEY = "systemMigrationVersion";
let newVersion = "0.0";
Hooks.on("init", () => (newVersion = game.system.data.version));
const _allMigrations = new Array();
class MigrationError extends Error {
    constructor(migration, capturedErrors) {
        super(`Migration failed, ${capturedErrors.length} exceptions thrown for type ${migration.type.name}, version "${migration.version}", sort ${migration.sort}`);
        this.migration = migration;
        this.capturedErrors = capturedErrors;
    }
}
function getCurrentVersion() {
    const version = game.settings.get("swnr", VERSION_KEY);
    if (version !== "")
        return version;
    setCurrentVersion();
    return newVersion;
}
async function setCurrentVersion() {
    var _a;
    if ((_a = game.user) === null || _a === void 0 ? void 0 : _a.isGM)
        await game.settings.set("swnr", VERSION_KEY, newVersion);
}
export default async function checkAndRunMigrations() {
    var _a, _b, _c, _d, _e;
    await loadMigrations();
    const migrations = orderedMigrations().filter((m) => isNewerVersion(m.version, getCurrentVersion()));
    if (migrations.length === 0)
        return await setCurrentVersion();
    const oldVersion = await getCurrentVersion();
    if (!((_a = game.user) === null || _a === void 0 ? void 0 : _a.isGM))
        return (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.error(game.i18n.format(game.i18n.localize("swnr.migration.needsGM"), {
            count: migrations.length,
            oldVersion,
            newVersion,
        }));
    (_c = ui.notifications) === null || _c === void 0 ? void 0 : _c.warn(game.i18n.format(game.i18n.localize("swnr.migration.start"), {
        oldVersion,
        newVersion,
    }));
    for await (const migration of migrations) {
        const errors = await applyMigration(migration);
        if (errors.length > 0) {
            const error = new MigrationError(migration, errors);
            (_d = ui.notifications) === null || _d === void 0 ? void 0 : _d.error(error.message);
            console.error(error);
        }
    }
    await setCurrentVersion();
    (_e = ui.notifications) === null || _e === void 0 ? void 0 : _e.info(game.i18n.format(game.i18n.localize("swnr.migration.done"), { newVersion }));
}
export async function loadMigrations() {
    const files = await (await fetch("systems/swnr/migrations.json")).json();
    await Promise.all(files.map((f) => import(f)));
}
export function registerMigration(type, version, sort, func) {
    if (!type ||
        !Object.prototype.isPrototypeOf.call(foundry.abstract.Document, type))
        throw new TypeError(`${type.name} is not a Document of some sort!`);
    _allMigrations.push({ type, version, sort, func });
}
export function orderedMigrations() {
    return _allMigrations.sort((left, right) => {
        //Version sort, lowest first
        if (left.version !== right.version)
            return isNewerVersion(left.version, right.version) ? 1 : -1;
        //Sort No. order, lowest first
        if (left.sort !== right.sort)
            return left.sort - right.sort;
        //Prototype sort, if parent, sorted first.
        if (left.type !== right.type) {
            if (Object.prototype.isPrototypeOf.call(left.type, right.type))
                return -1;
            if (Object.prototype.isPrototypeOf.call(right.type, left.type))
                return 1;
        }
        return 0;
    });
}
async function applyMigration(migration) {
    const collections = Object.values(game).filter(
    // Block compendiums for now.
    (v) => v instanceof Collection && v.constructor !== Collection);
    const errors = [];
    for await (const type of collections) {
        for await (const document of type.values()) {
            try {
                await applyMigrationTo(document, undefined, migration);
            }
            catch (e) {
                errors.push({
                    type: type.constructor.name,
                    document: document.constructor.name,
                    error: e,
                });
            }
        }
    }
    return errors;
}
function isClientDocument(arg) {
    return arg instanceof ClientDocumentMixin;
}
async function applyMigrationTo(target, updateData = { _id: target.id }, migration) {
    var _a;
    if (target instanceof migration.type) {
        migration.func(target, updateData);
    }
    const constructor = Object.getPrototypeOf(target);
    const embeddedEntities = (_a = constructor.metadata.embedded) !== null && _a !== void 0 ? _a : {};
    for await (const [cName] of Object.entries(embeddedEntities)) {
        const updates = [];
        const collection = target.getEmbeddedCollection(cName);
        for await (const embedded of collection) {
            if (!isClientDocument(embedded))
                continue;
            const eUpdate = await applyMigrationTo(embedded, undefined, migration);
            if (Object.keys(eUpdate).length > 1)
                updates.push(eUpdate);
        }
        target.updateEmbeddedDocuments(cName, updates);
    }
    return updateData;
}

//# sourceMappingURL=migration.js.map
