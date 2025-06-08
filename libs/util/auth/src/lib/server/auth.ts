import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { createNewProfile } from "@self-learning/achievements";
import { database } from "@self-learning/database";
import { randomBytes } from "crypto";
import { addDays } from "date-fns";
import { NextAuthOptions } from "next-auth";
import { Adapter, AdapterAccount } from "next-auth/adapters";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import KeycloakProvider from "next-auth/providers/keycloak";
import { loginCallbacks } from "./auth-callbacks-server";
import { authCallbacks, getIdpSelflearnAdminRole } from "./create-user-session";
import { createInitialNotificationSettings } from "@self-learning/ui/notifications";

export const MAIL_DOMAIN = "@uni-hildesheim.de";
export const OIDC_SCOPES = "openid profile email roles profile_studium";

function mailToUsername(mail: string): string {
	if (mail.toLowerCase().includes(MAIL_DOMAIN)) {
		mail = mail.toLowerCase().replace(MAIL_DOMAIN, "");
	}
	return mail;
}
export const testingExportMailToUsername = mailToUsername;

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

		// Promote User to admin if specified by KeyCloak
		if (getIdpSelflearnAdminRole(account.access_token)) {
			await database.user.update({
				where: {
					id: user.id
				},
				data: {
					role: "ADMIN"
				}
			});
		}

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
			}),
			database.gamificationProfile.upsert({
				where: {
					userId: account.userId
				},
				create: {
					userId: account.userId,
					username: user.name ?? user.id,
					lastLogin: new Date()
				},
				update: {}
			})
		]);
	}
};

function getProviders(): Provider[] {
	const providers = [
		KeycloakProvider({
			name: process.env.KEYCLOAK_PROVIDER_NAME ?? "Keycloak",
			issuer: process.env.KEYCLOAK_ISSUER_URL,
			clientId: process.env.KEYCLOAK_CLIENT_ID,
			clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
			authorization: { params: { scope: OIDC_SCOPES } },
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.preferred_username ?? mailToUsername(profile.email),
					email: profile.email,
					image: profile.picture,
					displayName: profile.name,
					features: []
				};
			}
		})
	];

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

					return user;
				}
			}) as any
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
			const username = user.name?.trim();
			if (!username) return;
			database.$transaction(async tx => {
				await createNewProfile(username, tx);

				await createInitialNotificationSettings(user, tx);
			});
		}
	}
};
