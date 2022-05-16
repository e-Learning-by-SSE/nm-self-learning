import type { ValidateOptions } from "yup/lib/types";

export const validationConfig: ValidateOptions = {
	stripUnknown: true,
	strict: true,
	abortEarly: false
};

/**
 * Calls `JSON.parse(value)`. If this operation fails, returns the original value.
 * Can be used in combination with validation libraries to generate an appropriate error message
 * instead of causing a Server Error (status 500) due to the failed `JSON.parse` invocation.
 *
 * @example
 * export const handler: NextApiHandler = async (req, res) => {
 * 	try {
 * 		bodySchema.validateSync(tryParseJson(req.body), validationConfig);
 * 	} catch(error) {
 * 		// Return a nice error message
 * 	}
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tryParseJson(value: unknown): any {
	try {
		return JSON.parse(value as string);
	} catch (error) {
		return value;
	}
}
