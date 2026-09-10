import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { createNewProfile } from "@self-learning/achievements";
import { database } from "@self-learning/database";
import { createInitialNotificationSettings } from "@self-learning/ui/notifications";
import { randomBytes } from "crypto";
import { addDays } from "date-fns";
import { jwtDecode } from "jwt-decode";
import { NextAuthOptions } from "next-auth";
import { Adapter, AdapterAccount } from "next-auth/adapters";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import { OAuthConfig } from "next-auth/providers/oauth";
import { loginCallbacks } from "./auth-callbacks-server";
import { authCallbacks, getIdpSelflearnAdminRole } from "./create-user-session";

export const MAIL_DOMAIN = "@uni-hildesheim.de";
export const OIDC_SCOPES = "openid profile email";
export const DEFAULT_OIDC_PROVIDER_ID = "oidc";

type OidcProfile = {
	sub: string;
	preferred_username?: string;
	email?: string;
	picture?: string;
	name?: string;
};

type OidcProviderConfig = {
	id: string;
	name: string;
	issuer: string;
	clientId: string;
	clientSecret: string;
	scope?: string;
};

function mailToUsername(mail: string): string {
	if (mail.toLowerCase().includes(MAIL_DOMAIN)) {
		mail = mail.toLowerCase().replace(MAIL_DOMAIN, "");
	}
	return mail;
}
export const testingExportMailToUsername = mailToUsername;

export function createOidcProvider({
	id,
	name,
	issuer,
	clientId,
	clientSecret,
	scope = OIDC_SCOPES
}: OidcProviderConfig): OAuthConfig<OidcProfile> {
	const normalizedIssuer = issuer.replace(/\/+$/, "");

	return {
		id,
		name,
		type: "oauth",
		wellKnown: `${normalizedIssuer}/.well-known/openid-configuration`,
		clientId,
		clientSecret,
		authorization: { params: { scope } },
		checks: ["pkce", "state"],
		idToken: true,
		userinfo: {
			async request({ client, tokens }) {
				const idToken = tokens.id_token;
				if (typeof idToken !== "string") {
					throw new Error("OIDC provider did not return an ID token");
				}

				const idTokenClaims = jwtDecode<OidcProfile>(idToken);
				if (!tokens.access_token || !client.issuer.metadata.userinfo_endpoint) {
					return idTokenClaims;
				}

				const userinfo = (await client.userinfo(tokens.access_token)) as OidcProfile;
				return { ...idTokenClaims, ...userinfo };
			}
		},
		profile(profile) {
			const username =
				profile.preferred_username ??
				(profile.email ? mailToUsername(profile.email) : profile.sub);

			return {
				id: profile.sub,
				name: username,
				email: profile.email,
				image: profile.picture,
				displayName: profile.name ?? username
			};
		}
	};
}

const customPrismaAdapter: Adapter = {
	...PrismaAdapter(database),

	// We overwrite the linkAccount method, because some auth providers may send additional properties
	// that do not exist in the Account model.
	async linkAccount(account: AdapterAccount): Promise<void> {
		const user = await database.user.findUniqueOrThrow({
			where: { id: account.userId }
		});

		console.log("[Auth]: Creating new account", {
			userId: user.id,
			name: user.name,
			provider: account.provider
		});

		await database.user.update({
			where: { id: user.id },
			data: {
				// Use IdP roles when supplied. Generic OIDC providers may omit
				// realm_access, in which case the existing local role is preserved.
				role: getIdpSelflearnAdminRole(account.access_token) ?? user.role,
				emailVerified: new Date() // OIDC always has verified emails
			}
		});

		await database.$transaction([
			database.account.create({
				data: {
					type: account.type,
					provider: account.provider,
					providerAccountId: account.providerAccountId,
					userId: account.userId,
					refresh_token: account.refresh_token,
					access_token: account.access_token,
					expires_at: account.expires_at,
					token_type: account.token_type,
					scope: account.scope,
					id_token: account.id_token,
					session_state: account.session_state
				}
			}),
			// Create Student account by default
			database.student.create({
				data: {
					userId: account.userId,
					username: user.name ?? user.id
				}
			})
		]);
	}
};

function getProviders(): Provider[] {
	const genericOidcValues = [
		process.env.OIDC_ISSUER_URL,
		process.env.OIDC_CLIENT_ID,
		process.env.OIDC_CLIENT_SECRET
	];
	const useGenericOidcConfig = genericOidcValues.some(Boolean);
	const issuer = useGenericOidcConfig
		? process.env.OIDC_ISSUER_URL
		: process.env.KEYCLOAK_ISSUER_URL;
	const clientId = useGenericOidcConfig
		? process.env.OIDC_CLIENT_ID
		: process.env.KEYCLOAK_CLIENT_ID;
	const clientSecret = useGenericOidcConfig
		? process.env.OIDC_CLIENT_SECRET
		: process.env.KEYCLOAK_CLIENT_SECRET;
	const oidcValues = [issuer, clientId, clientSecret];

	if (oidcValues.some(Boolean) && !oidcValues.every(Boolean)) {
		throw new Error(
			`Incomplete ${
				useGenericOidcConfig ? "OIDC" : "legacy Keycloak"
			} configuration: issuer, client ID and client secret are all required`
		);
	}

	const providers: Provider[] = [];
	if (issuer && clientId && clientSecret) {
		providers.push(
			createOidcProvider({
				id: process.env.OIDC_PROVIDER_ID || DEFAULT_OIDC_PROVIDER_ID,
				name:
					process.env.OIDC_PROVIDER_NAME ||
					process.env.KEYCLOAK_PROVIDER_NAME ||
					"OpenID Connect",
				issuer,
				clientId,
				clientSecret,
				scope: process.env.OIDC_SCOPES || OIDC_SCOPES
			})
		);
	}

	// Allow login with pre-configured demo accounts in demo mode (see seed.ts)
	if (process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true") {
		providers.push(
			CredentialsProvider({
				name: "Demo-Account",
				credentials: {
					username: { label: "Username", type: "text" }
				},
				async authorize(credentials) {
					const username = credentials?.username;

					if (typeof username !== "string" || username.length == 0) {
						return null;
					}

					const account = await database.account.findUnique({
						where: {
							provider_providerAccountId: {
								providerAccountId: username,
								provider: "demo"
							}
						},
						select: {
							user: true
						}
					});

					if (account) {
						return account.user;
					}

					const user = await database.user.create({
						data: {
							name: username,
							displayName: username,
							sessions: {
								create: [
									{
										sessionToken: randomBytes(12).toString("hex"),
										expires: addDays(Date.now(), 30)
									}
								]
							},
							accounts: {
								create: [
									{
										provider: "demo",
										providerAccountId: username,
										type: "demo-account",
										access_token: randomBytes(12).toString("hex")
									}
								]
							},
							student: {
								create: {
									username: username
								}
							}
						}
					});
					// since the createUser event is currently only called for OIDC providers,
					// we call it manually here to ensure the user profile is created
					await onCreateUser({ name: username, id: user.id });
					return user;
				}
			})
		);
	}
	return providers;
}

export const authOptions: NextAuthOptions = {
	theme: { colorScheme: "light" },
	adapter: customPrismaAdapter,
	callbacks: authCallbacks,
	session: {
		strategy: "jwt"
	},
	providers: getProviders(),
	events: {
		signIn: async ({ user, account, isNewUser, profile }) => {
			for (const call of loginCallbacks) {
				await call({ user, account, profile, isNewUser });
			}
		},
		createUser: async ({ user }) => {
			// this is called on new users (only OIDC)
			if (!user.name) return;
			onCreateUser({ name: user.name, id: user.id });
		}
	}
};

function onCreateUser(user: { name: string; id: string }) {
	const { id, name } = user;
	return database.$transaction(async tx => {
		await createNewProfile(name, tx);

		await tx.features.create({
			data: {
				userId: id,
				username: name
			}
		});

		await createInitialNotificationSettings(user, tx);
	});
}
