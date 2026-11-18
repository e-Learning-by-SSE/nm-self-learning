import { ResourceKind } from "@self-learning/types";

export function resourceKindTranslationKey(kind: ResourceKind): string {
	return `Resource_Kind_${kind[0].toUpperCase()}${kind.slice(1)}`;
}
