export declare class SWNRBaseItem<Type extends Item["type"] = Item["type"]> extends Item {
    data: Item["data"] & {
        _source: {
            type: Type;
        };
        type: Type;
    };
    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    roll(_shiftKey?: boolean): Promise<void>;
    showDesc(): Promise<void>;
}
