import { introspectToken } from "./introspect-oidc-token";

jest.mock("@self-learning/util/auth/server", () => ({
	authOptions: {
		providers: [
			{ type: "credentials" },
			{
				type: "oauth",
				wellKnown: "https://first.example/discovery",
				clientId: "first",
				clientSecret: "secret1"
			},
			{
				type: "oauth",
				wellKnown: "https://second.example/discovery",
				clientId: "second",
				clientSecret: "secret2"
			}
		]
	}
}));

describe("introspectToken", () => {
	const originalFetch = global.fetch;
	const fetchMock = jest.fn();
	beforeEach(() => {
		fetchMock.mockReset();
		global.fetch = fetchMock;
	});
	afterAll(() => {
		global.fetch = originalFetch;
	});
	const response = (data: unknown) => ({ ok: true, json: async () => data });

	it("uses discovery and the credentials of the provider that accepts the token", async () => {
		fetchMock
			.mockResolvedValueOnce(
				response({ introspection_endpoint: "https://first.example/introspect" })
			)
			.mockResolvedValueOnce(response({ active: false }))
			.mockResolvedValueOnce(
				response({ introspection_endpoint: "https://second.example/introspect" })
			)
			.mockResolvedValueOnce(response({ active: true, preferred_username: "student" }));
		expect(await introspectToken("token")).toEqual({
			active: true,
			preferred_username: "student"
		});
		expect(fetchMock).toHaveBeenNthCalledWith(
			4,
			"https://second.example/introspect",
			expect.objectContaining({
				body: new URLSearchParams({
					token: "token",
					client_id: "second",
					client_secret: "secret2"
				})
			})
		);
	});

	it("continues if a provider is unavailable", async () => {
		fetchMock
			.mockRejectedValueOnce(new Error("unavailable"))
			.mockResolvedValueOnce(
				response({ introspection_endpoint: "https://second.example/introspect" })
			)
			.mockResolvedValueOnce(response({ active: true }));
		expect(await introspectToken("token")).toEqual({ active: true });
	});

	it("rejects tokens if no provider offers introspection or accepts them", async () => {
		fetchMock.mockResolvedValue(response({}));
		await expect(introspectToken("token")).rejects.toThrow(
			"No configured OIDC provider accepted"
		);
	});
});
