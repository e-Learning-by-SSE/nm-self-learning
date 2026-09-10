import {
	createOidcProvider,
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

		expect(provider.wellKnown).toBe(
			"https://idp.example.org/.well-known/openid-configuration"
		);
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
