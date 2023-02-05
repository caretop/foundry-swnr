import { SWNRBaseActor } from "./base-actor";
import { SWNRBaseItem } from "./base-item";
export default function proxy<Type extends typeof SWNRBaseItem | typeof SWNRBaseActor>(entities: Record<string, Type>, baseClass: ReturnType<typeof ClientDocumentMixin>): unknown;
