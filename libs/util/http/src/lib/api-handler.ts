import { NextApiRequest, NextApiResponse } from "next";
import { ValidationError } from "yup";
import { ApiError, InternalServerError, ValidationFailed, withApiError } from "./error";

/**
 * Wraps a {@link NextApiHandler} with a try-catch.
 */
export async function apiHandler(
	req: NextApiRequest,
	res: NextApiResponse,
	handler: () => Promise<void> | void
) {
	try {
		return await handler();
	} catch (error) {
		if (error instanceof ValidationError) {
			return withApiError(res, ValidationFailed(error.errors));
		}

		if (error instanceof ApiError) {
			return withApiError(res, error);
		}

		console.error(`[${new Date().toLocaleString()}]: Uncaught error in apiHandler:`);
		console.error(error);

		return withApiError(res, InternalServerError());
	}
}
