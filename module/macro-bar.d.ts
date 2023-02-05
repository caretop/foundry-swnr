export declare function createSWNRMacro(data: any, slot: number): Promise<void>;
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemId
 * @return {Promise}
 */
export declare function rollItemMacro(itemId: string, itemName: string): Promise<void>;
