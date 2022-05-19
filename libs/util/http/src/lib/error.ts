import { StatusCodes } from "http-status-codes";
import type { NextApiResponse } from "next";

type Error = {
	statusCode: number;
	name: string;
	message: string;
	params?: Record<string, unknown>;
};

type ValidationError = {
	statusCode: StatusCodes.BAD_REQUEST;
	name: "ValidationError";
	errors: string[];
};

type MethodNotAllowedError = {
	statusCode: StatusCodes.METHOD_NOT_ALLOWED;
	name: "MethodNotAllowed";
	method?: string;
};

type InternalServerErrorType = {
	statusCode: StatusCodes.INTERNAL_SERVER_ERROR;
	name: "InternalServerError";
	message?: string;
};

type NotFoundError = {
	statusCode: StatusCodes.NOT_FOUND;
	name: "NotFound";
	params: Record<string, unknown>;
};

type ErrorTypes =
	| Error
	| ValidationError
	| MethodNotAllowedError
	| NotFoundError
	| InternalServerErrorType;

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

export function NotFound(params: Record<string, unknown>) {
	return new ApiError({
		statusCode: 404,
		name: "NotFound",
		params
	});
}

export function MethodNotAllowed(method?: string) {
	return new ApiError({
		statusCode: 405,
		name: "MethodNotAllowed",
		method
	});
}

export function Forbidden(message?: string) {
	return new ApiError({
		statusCode: StatusCodes.FORBIDDEN,
		name: "Forbidden",
		message: message ?? "Unauthorized request."
	});
}

export function InternalServerError(message?: string) {
	return new ApiError({
		statusCode: 500,
		name: "InternalServerError",
		message: message ?? "Something went wrong."
	});
}
