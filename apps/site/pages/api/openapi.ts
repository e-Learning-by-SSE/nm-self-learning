import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter, API_URL } from "@self-learning/api";
import { type NextApiRequest, type NextApiResponse } from "next";

function getBaseUrl() {
	if (typeof window !== "undefined") return window.location.protocol;

	// Assume localhost while developing
	return `http://localhost:${process.env["PORT"] ?? 4200}`;
}

export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: "REST API of SelfLearn",
	version: process.env.APP_VERSION || "Version not available",
	description: `OpenAPI Specification available at: <a href="${getBaseUrl()}/api/openapi">${getBaseUrl()}/api/openapi</a>`,
	baseUrl: API_URL,
	docsUrl: "/api-docs"
});

export default function handler(_: NextApiRequest, res: NextApiResponse) {
	res.status(200).send(openApiDocument);
}
