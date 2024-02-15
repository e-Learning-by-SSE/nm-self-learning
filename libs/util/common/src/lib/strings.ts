export function stringOrNull(str: string | null | undefined) {
	return str && str.length > 0 ? str : null;
}

export const isString = (value: unknown): value is string => typeof value === "string";
