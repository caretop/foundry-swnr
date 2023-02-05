export declare class SWNRBaseActor<Type extends Actor["type"] = Actor["type"]> extends Actor {
    data: Actor["data"] & {
        _source: {
            type: Type;
        };
        type: Type;
    };
    rollSave(save: string): Promise<void>;
}
