export function stringOrNull(str: string | null | undefined) {
	return str && str.length > 0 ? str : null;
}
