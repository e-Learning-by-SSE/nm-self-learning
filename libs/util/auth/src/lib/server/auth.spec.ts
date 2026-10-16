import {
	createOidcProvider,
	createOidcProviders,
	DEFAULT_OIDC_PROVIDER_ID,
	MAIL_DOMAIN,
	OIDC_SCOPES,
	testingExportMailToUsername
} from "./auth";

const mailToUsername = testingExportMailToUsername;
describe("mailToUsername", () => {
	it("input mail -> should return username", () => {
		const mail = `test${MAIL_DOMAIN}`;
		const username = mailToUsername(mail);
		expect(username).toBe("test");
	});

	// negative test case where no mail is provided
	it("input username -> should return username", () => {
		const mail = "test";
		const username = mailToUsername(mail);
		expect(username).toBe("test");
	});
});

describe("createOidcProvider", () => {
	it("uses only standard OIDC scopes by default", () => {
		expect(OIDC_SCOPES).toBe("openid profile email");
		expect(OIDC_SCOPES).not.toContain("roles");
		expect(OIDC_SCOPES).not.toContain("profile_studium");
	});

	it("uses oidc as the default persisted account provider ID", () => {
		expect(DEFAULT_OIDC_PROVIDER_ID).toBe("oidc");
	});

	it("uses OIDC discovery and removes a trailing slash from the issuer", () => {
		const provider = createOidcProvider({
			id: "oidc",
			name: "Test OIDC",
			issuer: "https://idp.example.org/",
			clientId: "client-id",
			clientSecret: "client-secret"
		});

		expect(provider.wellKnown).toBe("https://idp.example.org/.well-known/openid-configuration");
		expect(provider.authorization).toEqual({ params: { scope: OIDC_SCOPES } });
		expect(provider.checks).toEqual(["pkce", "state"]);
		expect(provider.idToken).toBe(true);
		expect(provider.userinfo).toEqual(
			expect.objectContaining({ request: expect.any(Function) })
		);
	});

	it("maps a standard OIDC profile to a local user", async () => {
		const provider = createOidcProvider({
			id: "oidc",
			name: "Test OIDC",
			issuer: "https://idp.example.org",
			clientId: "client-id",
			clientSecret: "client-secret"
		});

		const user = await provider.profile(
			{
				sub: "subject-1",
				preferred_username: "student",
				email: `student${MAIL_DOMAIN}`,
				name: "Test Student"
			},
			{}
		);

		expect(user).toEqual({
			id: "subject-1",
			name: "student",
			email: `student${MAIL_DOMAIN}`,
			image: undefined,
			displayName: "Test Student"
		});
	});

	it("does not require an email claim", async () => {
		const provider = createOidcProvider({
			id: "oidc",
			name: "Test OIDC",
			issuer: "https://idp.example.org",
			clientId: "client-id",
			clientSecret: "client-secret"
		});

		const user = await provider.profile({ sub: "subject-without-email" }, {});

		expect(user).toEqual({
			id: "subject-without-email",
			name: "subject-without-email",
			email: undefined,
			image: undefined,
			displayName: "subject-without-email"
		});
	});
});

describe("createOidcProviders", () => {
	const first = {
		ISSUER_URL: "https://first.example.org/",
		CLIENT_ID: "first-client",
		CLIENT_SECRET: "first-secret",
		PROVIDER_NAME: "First SSO"
	};
	const second = {
		...first,
		ISSUER_URL: "https://second.example.org",
		CLIENT_ID: "second-client",
		CLIENT_SECRET: "second-secret",
		PROVIDER_NAME: "Second SSO"
	};

	it("creates multiple independent providers", () => {
		const providers = createOidcProviders({
			OIDC_CLIENTS: JSON.stringify([first, second]),
			OIDC_SCOPES: "openid email"
		});
		expect(providers).toHaveLength(2);
		expect(providers[0]).toMatchObject({
			name: first.PROVIDER_NAME,
			clientId: first.CLIENT_ID,
			clientSecret: first.CLIENT_SECRET,
			wellKnown: "https://first.example.org/.well-known/openid-configuration",
			authorization: { params: { scope: "openid email" } }
		});
		expect(providers[1]).toMatchObject({
			name: second.PROVIDER_NAME,
			clientId: second.CLIENT_ID,
			clientSecret: second.CLIENT_SECRET,
			wellKnown: "https://second.example.org/.well-known/openid-configuration"
		});
		expect(providers[0].id).not.toBe(providers[1].id);
	});

	it("keeps generated IDs stable when reordered, renamed or secrets rotated", () => {
		const original = createOidcProviders({ OIDC_CLIENTS: JSON.stringify([first, second]) });
		const changed = createOidcProviders({
			OIDC_CLIENTS: JSON.stringify([
				second,
				{
					...first,
					ISSUER_URL: first.ISSUER_URL.replace(/\/$/, ""),
					PROVIDER_NAME: "Renamed",
					CLIENT_SECRET: "rotated"
				}
			])
		});
		expect(changed.map(provider => provider.id)).toEqual([original[1].id, original[0].id]);
	});

	it("accepts an explicit ID for existing account links", () => {
		expect(
			createOidcProviders({
				OIDC_CLIENTS: JSON.stringify([{ ...first, PROVIDER_ID: "oidc" }])
			})[0].id
		).toBe("oidc");
	});

	it("allows disabling OIDC with an empty or absent array", () => {
		for (const value of ["[]", "", "  ", undefined]) {
			expect(createOidcProviders({ OIDC_CLIENTS: value })).toEqual([]);
		}
	});

	it.each(["OIDC", "KEYCLOAK"])("ignores obsolete %s single-provider settings", prefix => {
		expect(
			createOidcProviders({
				[`${prefix}_ISSUER_URL`]: first.ISSUER_URL,
				[`${prefix}_CLIENT_ID`]: first.CLIENT_ID,
				[`${prefix}_CLIENT_SECRET`]: first.CLIENT_SECRET,
				[`${prefix}_PROVIDER_NAME`]: first.PROVIDER_NAME
			})
		).toEqual([]);
	});

	it.each(["not json", "{}", "null", "[null]", "[42]"])(
		"rejects malformed configuration: %s",
		value => {
			expect(() => createOidcProviders({ OIDC_CLIENTS: value })).toThrow(/OIDC_CLIENTS/);
		}
	);

	it.each(["ISSUER_URL", "CLIENT_ID", "CLIENT_SECRET", "PROVIDER_NAME"])("requires %s", key => {
		for (const value of [undefined, "", " ", 123]) {
			expect(() =>
				createOidcProviders({
					OIDC_CLIENTS: JSON.stringify([{ ...first, [key]: value }])
				})
			).toThrow(`OIDC_CLIENTS[0].${key}`);
		}
	});

	it("rejects duplicate generated and explicit IDs", () => {
		for (const clients of [
			[first, first],
			[
				{ ...first, PROVIDER_ID: "same" },
				{ ...second, PROVIDER_ID: "same" }
			]
		]) {
			expect(() => createOidcProviders({ OIDC_CLIENTS: JSON.stringify(clients) })).toThrow(
				/duplicate/
			);
		}
	});

	it.each(["credentials", "bad/id", " "])("rejects invalid or reserved ID: %s", id => {
		expect(() =>
			createOidcProviders({
				OIDC_CLIENTS: JSON.stringify([{ ...first, PROVIDER_ID: id }])
			})
		).toThrow(/PROVIDER_ID/);
	});
});
