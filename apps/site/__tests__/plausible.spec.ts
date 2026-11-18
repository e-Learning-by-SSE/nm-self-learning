/** @jest-environment node */
import { createMocks } from "node-mocks-http";
import { Readable } from "node:stream";
import { NextApiRequest, NextApiResponse } from "next";
import configHandler from "../pages/api/plausible/config";
import proxyHandler from "../pages/api/plausible/[...path]";

describe("runtime Plausible configuration", () => {
	const originalFetch = global.fetch;
	afterEach(() => {
		delete process.env.PLAUSIBLE_OWN_DOMAIN;
		delete process.env.PLAUSIBLE_CUSTOM_INSTANCE;
		global.fetch = originalFetch;
	});

	it("reads the current domain without caching it", () => {
		process.env.PLAUSIBLE_OWN_DOMAIN = "first.example";
		const first = createMocks<NextApiRequest, NextApiResponse>({ method: "GET" });
		configHandler(first.req, first.res);
		process.env.PLAUSIBLE_OWN_DOMAIN = "second.example";
		const second = createMocks<NextApiRequest, NextApiResponse>({ method: "GET" });
		configHandler(second.req, second.res);
		expect(first.res._getJSONData()).toEqual({ domain: "first.example" });
		expect(second.res._getJSONData()).toEqual({ domain: "second.example" });
		expect(second.res.getHeader("Cache-Control")).toBe("no-store");
	});

	it("routes scripts to the configured server with the correct script name", async () => {
		const fetchMock = jest
			.fn()
			.mockImplementation(() => Promise.resolve(new Response("script")));
		global.fetch = fetchMock;
		const first = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: { path: ["js", "script.js"] }
		});
		await proxyHandler(first.req, first.res);
		process.env.PLAUSIBLE_CUSTOM_INSTANCE = "http://internal:8000";
		const second = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: { path: ["js", "script.local.js"] }
		});
		await proxyHandler(second.req, second.res);
		expect(fetchMock.mock.calls[0][0]).toBe("https://plausible.io/js/script.js");
		expect(fetchMock.mock.calls[1][0]).toBe("http://internal:8000/js/plausible.local.js");
		expect(second.res.statusCode).toBe(200);
	});

	it("returns a gateway error if the upstream is unavailable", async () => {
		global.fetch = jest.fn().mockRejectedValue(new Error("unavailable"));
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: { path: ["js", "script.js"] }
		});
		await proxyHandler(req, res);
		expect(res.statusCode).toBe(502);
	});

	it("forwards event bodies and request headers", async () => {
		process.env.PLAUSIBLE_CUSTOM_INSTANCE = "http://internal:8000";
		const fetchMock = jest.fn().mockResolvedValue(new Response("ok", { status: 202 }));
		global.fetch = fetchMock;
		const { res } = createMocks<NextApiRequest, NextApiResponse>();
		const req = Object.assign(Readable.from([Buffer.from('{"name":"pageview"}')]), {
			method: "POST",
			query: { path: ["api", "event"] },
			headers: { "content-type": "application/json", "user-agent": "test-browser" },
			socket: { remoteAddress: "192.0.2.1" }
		}) as unknown as NextApiRequest;
		await proxyHandler(req, res);
		const [url, options] = fetchMock.mock.calls[0];
		expect(url).toBe("http://internal:8000/api/event");
		expect(Buffer.from(options.body).toString()).toBe('{"name":"pageview"}');
		expect(options.headers.get("user-agent")).toBe("test-browser");
		expect(options.headers.get("x-forwarded-for")).toBe("192.0.2.1");
		expect(res.statusCode).toBe(202);
	});

	it("rejects paths and methods outside the proxy contract", async () => {
		const invalid = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: { path: ["other"] }
		});
		await proxyHandler(invalid.req, invalid.res);
		expect(invalid.res.statusCode).toBe(404);
		const wrongMethod = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: { path: ["api", "event"] }
		});
		await proxyHandler(wrongMethod.req, wrongMethod.res);
		expect(wrongMethod.res.statusCode).toBe(405);
	});
});
