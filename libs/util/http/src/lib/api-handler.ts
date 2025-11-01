import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import {
	AlreadyExists,
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
		if (error instanceof ZodError) {
			return withApiError(res, ValidationFailed(error.issues as any));
		}

		if (error instanceof ApiError) {
			return withApiError(res, error);
		}

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				return withApiError(res, AlreadyExists("A unique constraint failed.", error.meta));
			}
		}

		console.error(`[${new Date().toLocaleString()}]: Uncaught error in apiHandler:`);
		console.error(error);

		return withApiError(res, InternalServerError());
	}
}
