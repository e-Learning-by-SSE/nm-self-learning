import { createOpenApiNextHandler } from "trpc-openapi";
import { appRouter, createTrpcContext } from "@self-learning/api";
import { TRPCError } from "@trpc/server";

// This handler will process all REST API requests under /api/rest/*
export default createOpenApiNextHandler({
	router: appRouter,
	createContext: createTrpcContext,
	onError({ error }) {
		// onError({ error, type, path, input, ctx }) {
		// console.error("Error:", {
		// 	error,
		// 	type,
		// 	path,
		// 	input,
		// 	ctx: ctx ? "has context" : "no context"
		// });

		// Return HTTP error code based on TRPC error
		if (error instanceof TRPCError) {
			switch (error.code) {
				case "NOT_FOUND":
					return {
						statusCode: 404,
						message: error.message
					};
				case "UNAUTHORIZED":
					return {
						statusCode: 401,
						message: error.message
					};
				case "FORBIDDEN":
					return {
						statusCode: 403,
						message: error.message
					};
				case "BAD_REQUEST":
					return {
						statusCode: 400,
						message: error.message
					};
			}
		}

		// Default to 500 for unknown errors
		return {
			statusCode: 500,
			message: "Internal server error"
		};
	},
	responseMeta: () => {
		// { data, errors }
		// Response Headers
		return {
			headers: {
				"Cache-Control": "no-cache",
				"Content-Type": "application/json"
			}
		};
	}
});
