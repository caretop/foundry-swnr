export class BaseSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["swnr", "sheet", "item"],
            width: 520,
            height: 480,
            tabs: [],
        });
    }
    _injectHTML(html) {
        html
            .find(".window-content")
            .addClass(["cq", "overflow-y-scroll", "relative"]);
        super._injectHTML(html);
    }
    /**
     * @override
     */
    get template() {
        return `systems/swnr/templates/items/${this.item.data.type}-sheet.html`;
    }
    async getData() {
        let data = super.getData();
        if (data instanceof Promise)
            data = await data;
        data.actor = this.actor;
        return data;
    }
}
export const sheet = BaseSheet;
export const types = [];

//# sourceMappingURL=base-sheet.js.map
