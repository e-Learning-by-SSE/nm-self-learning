import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { createNewProfile } from "@self-learning/achievements";
import { database } from "@self-learning/database";
import { createInitialNotificationSettings } from "@self-learning/ui/notifications";
import { createHash, randomBytes } from "crypto";
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
	preferEmailAsUsername?: boolean;
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
	preferEmailAsUsername = false,
	scope = OIDC_SCOPES
}: OidcProviderConfig): OAuthConfig<OidcProfile> {
	const normalizedIssuer = issuer.replace(/\/+$/, "");

	return {
		id,
		name,
		type: "oauth",
		issuer: normalizedIssuer,
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
			let username: string;
			if (preferEmailAsUsername) {
				username = profile.email ? profile.email : profile.sub;
				if (!username) {
					throw new Error(`OIDC provider "${name}" must return an email address`);
				}
			} else {
				username =
					profile.preferred_username ??
					(profile.email ? mailToUsername(profile.email) : profile.sub);
			}

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
				role: getIdpSelflearnAdminRole(account.access_token, account.id_token) ?? user.role,
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

/** Configure OIDC providers exclusively through the OIDC_CLIENTS JSON array. */
export function createOidcProviders(
	env: Partial<NodeJS.ProcessEnv> = process.env
): OAuthConfig<OidcProfile>[] {
	if (!env.OIDC_CLIENTS?.trim()) return [];

	let clients: unknown;
	try {
		clients = JSON.parse(env.OIDC_CLIENTS);
	} catch {
		throw new Error("OIDC_CLIENTS must be a valid JSON array");
	}
	if (!Array.isArray(clients)) {
		throw new Error("OIDC_CLIENTS must be a JSON array");
	}

	const ids = new Set<string>();
	return clients.map((client: unknown, index) => {
		const label = `OIDC_CLIENTS[${index}]`;
		if (!client || typeof client !== "object" || Array.isArray(client)) {
			throw new Error(`${label} must be an object`);
		}
		const config = client as Record<string, unknown>;
		const requiredString = (key: string): string => {
			const value = config[key];
			if (typeof value !== "string" || !value.trim()) {
				throw new Error(`${label}.${key} must be a non-empty string`);
			}
			return value;
		};
		const issuer = requiredString("ISSUER_URL").replace(/\/+$/, "");
		const clientId = requiredString("CLIENT_ID");
		const clientSecret = requiredString("CLIENT_SECRET");
		const name = requiredString("PROVIDER_NAME");
		const scopes = config["SCOPES"];
		if (scopes !== undefined && (typeof scopes !== "string" || !scopes.trim())) {
			throw new Error(`${label}.SCOPES must be a non-empty string when provided`);
		}
		// Stable across array reordering, display-name changes and secret rotation.
		const id =
			config["PROVIDER_ID"] === undefined
				? `oidc-${createHash("sha256")
						.update(JSON.stringify([issuer, clientId]))
						.digest("hex")}`
				: requiredString("PROVIDER_ID");
		if (!/^[a-zA-Z0-9_-]+$/.test(id) || id === "credentials") {
			throw new Error(`${label}.PROVIDER_ID must be a URL-safe ID other than credentials`);
		}
		if (ids.has(id)) {
			throw new Error(`${label} has a duplicate provider ID`);
		}
		ids.add(id);
		return createOidcProvider({
			id,
			name,
			issuer,
			clientId,
			clientSecret,
			preferEmailAsUsername: index > 0,
			scope: typeof scopes === "string" ? scopes : env.OIDC_SCOPES || OIDC_SCOPES
		});
	});
}

function getProviders(): Provider[] {
	const providers: Provider[] = createOidcProviders();

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
	callbacks: {
		...authCallbacks,

		async signIn({ user, account, profile }) {
			if (
				account?.provider === DEFAULT_OIDC_PROVIDER_ID &&
				profile &&
				"preferred_username" in profile &&
				typeof profile.preferred_username === "string"
			) {
				const username = profile.preferred_username;

				// Check whether the new OIDC account already exists
				const currentAccount = await database.account.findUnique({
					where: {
						provider_providerAccountId: {
							provider: account.provider,
							providerAccountId: account.providerAccountId
						}
					}
				});

				// Only migrate if the new OIDC account does not exist
				if (!currentAccount) {
					const existingUser = await database.user.findUnique({
						where: { name: username },
						include: { accounts: true }
					});

					if (existingUser) {
						const existingAccount = existingUser.accounts.find(
							a => a.provider === "keycloak" || a.provider === "oidc"
						);

						if (existingAccount) {
							await database.account.update({
								where: { id: existingAccount.id },
								data: {
									provider: account.provider,
									providerAccountId: account.providerAccountId,
									type: account.type,
									access_token: account.access_token,
									refresh_token: account.refresh_token,
									expires_at: account.expires_at,
									token_type: account.token_type,
									scope: account.scope,
									id_token: account.id_token,
									session_state: account.session_state
								}
							});
						}
					}
				}
			}

			return authCallbacks.signIn ? authCallbacks.signIn({ user, account, profile }) : true;
		}
	},
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
