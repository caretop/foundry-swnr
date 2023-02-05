export declare class BaseActorSheet<T extends ActorSheet.Data> extends ActorSheet<ActorSheet.Options, T> {
    popUpDialog?: Dialog;
    activateListeners(html: JQuery): void;
    _onItemClick(event: JQuery.ClickEvent): void;
    populateItemList(itemType: string, candiateItems: {
        [name: string]: Item;
    }): Promise<void>;
    _onItemSearch(event: JQuery.ClickEvent): Promise<void>;
    _onItemCreate(event: JQuery.ClickEvent): void;
    _onItemReload(event: JQuery.ClickEvent): Promise<void>;
    _onItemBreakToggle(event: JQuery.ClickEvent): Promise<void>;
    _onItemDestroyToggle(event: JQuery.ClickEvent): Promise<void>;
    _onItemJuryToggle(event: JQuery.ClickEvent): Promise<void>;
    _onItemEdit(event: JQuery.ClickEvent): void;
    _onItemShow(event: JQuery.ClickEvent): void;
    _onItemDelete(event: JQuery.ClickEvent): Promise<void>;
}
