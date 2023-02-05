import { ClientDocumentMixin as ClientDocumentMixinType } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/clientDocumentMixin";
export declare type VersionString = `${number}.${number}${"" | number}${"" | `-${string}`}`;
declare type Constructor<T> = Function & {
    prototype: T;
};
export declare type UpdateData = {
    _id: string;
    [index: string]: unknown;
};
export declare type MigrationFunction<T> = (document: T, pastUpdates: UpdateData) => UpdateData;
declare type MigrationData<T extends BaseClientDocCons> = {
    type: Constructor<T>;
    version: VersionString;
    sort: number;
    func: MigrationFunction<InstanceType<T>>;
};
declare type BaseClientDocCons = ConstructorOf<foundry.abstract.Document<any, any>>;
declare type ClientDocumentConstructor<T extends BaseClientDocCons = BaseClientDocCons> = Pick<T, keyof T> & Pick<typeof ClientDocumentMixin, keyof typeof ClientDocumentMixin> & {
    new (...args: ConstructorParameters<T>): InstanceType<T> & ClientDocumentMixinType<InstanceType<T>>;
};
export default function checkAndRunMigrations(): Promise<void>;
export declare function loadMigrations(): Promise<void>;
export declare function registerMigration<Document extends ClientDocumentConstructor>(type: Document, version: VersionString, sort: number, func: MigrationFunction<InstanceType<Document>>): void;
export declare function orderedMigrations(): readonly MigrationData<ClientDocumentConstructor>[];
export {};
