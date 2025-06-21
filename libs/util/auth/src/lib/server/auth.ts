import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { createNewProfile } from "@self-learning/achievements";
import { database } from "@self-learning/database";
import { createInitialNotificationSettings } from "@self-learning/ui/notifications";
import { randomBytes } from "crypto";
import { addDays } from "date-fns";
import { NextAuthOptions } from "next-auth";
import { Adapter, AdapterAccount } from "next-auth/adapters";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import KeycloakProvider from "next-auth/providers/keycloak";
import { loginCallbacks } from "./auth-callbacks-server";
import { authCallbacks, getIdpSelflearnAdminRole } from "./create-user-session";

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

		await database.user.update({
			where: { id: user.id },
			data: {
				// Promote User to admin if specified by KeyCloak
				role: getIdpSelflearnAdminRole(account.access_token) ?? "USER",
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
					displayName: profile.name
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
					// since the createUser event is currently only called for OIDC providers,
					// we call it manually here to ensure the user profile is created
					await onCreateUser({ name: username, id: user.id });
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
				userId: user.id,
				username: name
			}
		});

		await createInitialNotificationSettings(user, tx);
	});
}
