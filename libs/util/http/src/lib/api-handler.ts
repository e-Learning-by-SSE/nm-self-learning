import { NextApiRequest, NextApiResponse } from "next";
import { ValidationError } from "yup";
import {
	ApiError,
	InternalServerError,
	MethodNotAllowed,
	ValidationFailed,
	withApiError
} from "./error";

/**
 * Wraps a {@link NextApiHandler} with a try-catch.
 */
export async function apiHandler(
	req: NextApiRequest,
	res: NextApiResponse,
	method: "POST" | "PUT" | "GET" | "PATCH" | "DELETE",
	handler: () => Promise<void> | void
) {
	try {
		if (req.method !== method) {
			throw MethodNotAllowed(req.method);
		}

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
