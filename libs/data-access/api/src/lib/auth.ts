import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { database } from "@self-learning/database";
import { randomBytes } from "crypto";
import { addDays } from "date-fns";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import KeycloakProvider from "next-auth/providers/keycloak";
import jwt_decode from "jwt-decode";

type KeyCloakClaims = {
	realm_access?: {
		roles?: string[];
	};
};

enum Role {
	USER,
	ADMIN,
	UNDEFINED
}

export const MAIL_DOMAIN = "@uni-hildesheim.de";
export const OIDC_SCOPES = "openid profile email roles profile_studium";
export const ADMIN_ROLE = "selflearn_admin";

function hasAdminRole(access_token: string | undefined): Role {
	// realm_access.roles is optional claim -> Check if claim exists
	if (access_token) {
		const claims = jwt_decode(access_token) as KeyCloakClaims;
		const access_roles = claims["realm_access"];

		if (access_roles) {
			const roles = access_roles["roles"] as string[];

			// Admin role of Self-Learning is defined as selflearn_admin in KeyCloak
			if (roles?.includes(ADMIN_ROLE)) {
				return Role.ADMIN;
			} else {
				return Role.USER;
			}
		}
	}

	return Role.UNDEFINED;
}

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
	async linkAccount(account): Promise<void> {
		const user = await database.user.findUniqueOrThrow({
			where: { id: account.userId }
		});

		console.log("[Auth]: Creating new account", {
			userId: user.id,
			name: user.name,
			provider: account.provider
		});

		// Promote User to admin if specified by KeyCloak
		if (hasAdminRole(account.access_token)) {
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
			})
		]);
	}
};

function getProviders(): Provider[] {
	const providers = [
		KeycloakProvider({
			issuer: process.env.KEYCLOAK_ISSUER_URL as string,
			clientId: process.env.KEYCLOAK_CLIENT_ID as string,
			clientSecret: process.env.KEYCLOAK_CLIENT_SECRET as string,
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
	callbacks: {
		jwt({ token, account }) {
			// Store OIDC role inside JWT token
			const role = hasAdminRole(account?.access_token);
			if (role == Role.ADMIN) {
				token.isAdmin = true;
			} else if (role == Role.USER) {
				token.isAdmin = false;
			}

			return token;
		},
		async session({ session, user, token }) {
			const username = session.user?.name ?? user.name;

			if (!username) throw new Error("Username is not defined.");

			let userFromDb = await database.user.findUniqueOrThrow({
				where: { name: username },
				select: {
					role: true,
					image: true,
					author: { select: { username: true } }
				}
			});

			if (userFromDb.role === "ADMIN" && token["isAdmin"] === false) {
				// DB: User is Admin, Auth-Server (Uni): User is no (longer) Admin -> Demote
				userFromDb = await database.user.update({
					where: { name: username },
					data: { role: "USER" },
					select: {
						role: true,
						image: true,
						author: { select: { username: true } }
					}
				});
			} else if (userFromDb.role !== "ADMIN" && token["isAdmin"] === true) {
				// DB: User is no Admin, Auth-Server (Uni): User is Admin -> Promote
				userFromDb = await database.user.update({
					where: { name: username },
					data: { role: "ADMIN" },
					select: {
						role: true,
						image: true,
						author: { select: { username: true } }
					}
				});
			}

			session.user = {
				name: username,
				role: userFromDb.role,
				isAuthor: !!userFromDb.author,
				avatarUrl: userFromDb.image
			};

			return session;
		}
	},
	session: {
		strategy: "jwt"
	},
	providers: getProviders()
};
