import { introspectToken } from "./introspect-oidc-token";

jest.mock("@self-learning/util/auth/server", () => ({
	authOptions: {
		providers: [
			{ type: "credentials" },
			{
				type: "oauth",
				issuer: "https://first.example",
				wellKnown: "https://first.example/discovery",
				clientId: "first",
				clientSecret: "secret1"
			},
			{
				type: "oauth",
				issuer: "https://second.example",
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
	const jwtWithIssuer = (issuer: string) =>
		`header.${Buffer.from(JSON.stringify({ iss: issuer })).toString("base64url")}.signature`;

	it("sends the token only to the provider matching its issuer", async () => {
		// Setup
		fetchMock
			.mockResolvedValueOnce(
				response({ introspection_endpoint: "https://second.example/introspect" })
			)
			.mockResolvedValueOnce(response({ active: true, preferred_username: "student" }));
		const token = jwtWithIssuer("https://second.example/");

		// Exercise
		const claims = await introspectToken(token);

		// Verify
		expect(claims).toEqual({
			active: true,
			preferred_username: "student"
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock).toHaveBeenNthCalledWith(1, "https://second.example/discovery");
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"https://second.example/introspect",
			expect.objectContaining({
				body: new URLSearchParams({
					token,
					client_id: "second",
					client_secret: "secret2"
				})
			})
		);
	});

	it("does not send a token to another provider if its issuer is unavailable", async () => {
		// Setup
		fetchMock.mockRejectedValueOnce(new Error("unavailable"));

		// Exercise
		const result = introspectToken(jwtWithIssuer("https://first.example"));

		// Verify
		await expect(result).rejects.toThrow(
			"OIDC token introspection request failed"
		);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("rejects tokens without a usable configured issuer before making requests", async () => {
		// Setup
		const opaqueToken = "opaque-token";
		const unknownIssuerToken = jwtWithIssuer("https://unknown.example");

		// Exercise
		const results = await Promise.allSettled([
			introspectToken(opaqueToken),
			introspectToken(unknownIssuerToken)
		]);

		// Verify
		expect(results[0]).toMatchObject({
			status: "rejected",
			reason: expect.objectContaining({ message: expect.stringContaining("JWT with an issuer") })
		});
		expect(results[1]).toMatchObject({
			status: "rejected",
			reason: expect.objectContaining({
				message: expect.stringContaining("No configured OIDC provider matches")
			})
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("rejects inactive tokens from their matching provider", async () => {
		// Setup
		fetchMock
			.mockResolvedValueOnce(
				response({ introspection_endpoint: "https://first.example/introspect" })
			)
			.mockResolvedValueOnce(response({ active: false }));

		// Exercise
		const result = introspectToken(jwtWithIssuer("https://first.example"));

		// Verify
		await expect(result).rejects.toThrow("provider did not accept");
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
