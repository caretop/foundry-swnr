export const preloadTemplates = async function () {
    const list = await fetch("systems/swnr/templates.json");
    const files = await list.json();
    await loadTemplates(files.filter((t) => t.includes("fragment")));
};

//# sourceMappingURL=preloadTemplates.js.map
