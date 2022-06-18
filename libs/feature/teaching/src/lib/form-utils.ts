/**
 * Matches keys with the following structure:
 *
 * `key[index][property]`
 *
 * This structure is often used in form input `name` to represent arrays
 *
 * @returns `null` if input does not match.
 *
 * @example
 * // HTML
 * <input type="text" name="people[0][name]" />
 *
 * // Usage
 * matchKey("people[0][name]");
 * // { key: "people", index: 0, property: "name" }
 */
export function matchKey(keyFromForm: string) {
	const match = keyFromForm.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
	return match ? { key: match[1], index: Number(match[2]), property: match[3] } : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformFormData(values: Record<string, any>) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const transformed: Record<string, any> = {};

	Object.entries(values).forEach(([key, value]) => {
		const match = matchKey(key);
		if (match) {
			if (!transformed[match.key]) transformed[match.key] = [];
			if (!transformed[match.key][match.index]) transformed[match.key][match.index] = {};
			transformed[match.key][match.index][match.property] = value;
		} else {
			transformed[key] = value;
		}
	});

	return transformed;
}

export function inputName(key: string, property: string, index: number) {
	return `${key}[${index}][${property}]`;
}
