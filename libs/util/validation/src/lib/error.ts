import type { NextApiResponse } from "next";

type Error = {
	statusCode: number;
	name: string;
	message: string;
	params?: Record<string, unknown>;
};

type ValidationError = {
	statusCode: 400;
	name: "ValidationError";
	errors: string[];
};

type MethodNotAllowedError = {
	statusCode: 405;
	name: "MethodNotAllowed";
	method?: string;
};

type ErrorTypes = Error | ValidationError | MethodNotAllowedError;

export class ApiError {
	constructor(readonly error: ErrorTypes) {}
}

/** Adds the given `error` to a {@link NextApiResponse}. */
export function withApiError(res: NextApiResponse, error: ApiError) {
	return res.status(error.error.statusCode).json({
		error: error.error
	});
}

export function AlreadyExists(message: string, params?: Record<string, unknown>) {
	return new ApiError({
		statusCode: 409,
		name: "AlreadyExists",
		message,
		params
	});
}

export function ValidationFailed(errors: string[]) {
	return new ApiError({
		statusCode: 400,
		name: "ValidationError",
		errors
	});
}

export function MethodNotAllowed(method?: string) {
	return new ApiError({
		statusCode: 405,
		name: "MethodNotAllowed",
		method
	});
}
