/**
 * This function is used to filter out falsy values from an array.
 * It's a type-safe alternative to filter(Boolean), which TypeScript can't infer the type of.
 *
 * Example usage: array.filter(isTruthy).map(...)
 *
 * @param value - The value to check.
 * @returns True if the value is truthy, false otherwise.
 */
export function isTruthy<T>(value?: T | undefined | null | false): value is T {
	return !!value;
}
