/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextHandler, restApiHandler, UserFromSession } from "@self-learning/api";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodIssue } from "zod";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

import { createRequest, createResponse } from "node-mocks-http";
import { EventEmitter } from "events";

type CallArgs = {
	method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
	path: string; // e.g. "/say-hello/James"
	query?: Record<string, any>; // ?greeting=Hello
	body?: unknown;
	headers?: Record<string, string>;
	user?: any; // your UserFromSession
};

/**
 * Simulates a request to test REST API endpoints.
 * @param req Specifies the request (HTTP method, path, query parameters, and body).
 * @returns HTTP code and response body.
 */
export async function callOpenApi({
	method,
	path,
	query = {},
	body,
	headers = {},
	user
}: CallArgs) {
	const base = "/api/rest"; // <— important
	const pathNoSlash = path.replace(/^\/+/, ""); // "courses" | "courses/123"
	const trpcSegments = pathNoSlash.split("/"); // ["courses"] | ["courses","123"]

	const qs = new URLSearchParams(
		Object.entries(query).flatMap(([k, v]) =>
			Array.isArray(v) ? v.map(vv => [k, String(vv)]) : [[k, String(v)]]
		)
	).toString();

	const url = qs ? `${base}/${pathNoSlash}?${qs}` : `${base}/${pathNoSlash}`;

	const req = createRequest<NextApiRequest>({
		method,
		url,
		headers,
		// Next would have: req.query.trpc = ["openapi", ...segments]
		query: { ...query, trpc: trpcSegments }
	});

	// For body on non-GET
	if (method !== "GET" && body !== undefined) {
		// node-mocks-http will expose as req.body
		// createOpenApiNextHandler reads it via Next parser
		(req as any).body = body;
	}

	// If your context needs the session user via createContext({ req, res })
	const contextHandler: ContextHandler | undefined = user ? async () => ({ user }) : undefined;

	const res = createResponse<NextApiResponse>({
		eventEmitter: EventEmitter
	});

	// Your adapter returns a Next.js style handler
	const handler = restApiHandler(contextHandler);

	await handler(req, res);

	const json = (() => {
		try {
			return res._getJSONData();
		} catch {
			const data = res._getData();
			return data && typeof data === "string" ? JSON.parse(data) : data;
		}
	})();

	return {
		statusCode: res.statusCode,
		headers: res.getHeaders(),
		body: json,
		rawBody: res._getData()
	};
}
