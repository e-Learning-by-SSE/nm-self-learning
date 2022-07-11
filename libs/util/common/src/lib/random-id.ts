/**
 * Generates a random id using `Math.random().toString(32).slice(4)`.
 *
 * @example const id = getRandomId(); // "v37vidr9g"
 *
 */
export function getRandomId() {
	return Math.random().toString(32).slice(4);
}
