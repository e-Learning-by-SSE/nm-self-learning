import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { database } from "@self-learning/database";
import { randomBytes } from "crypto";
import { addDays } from "date-fns";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import KeycloakProvider from "next-auth/providers/keycloak";

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
			profile(profile) {
				let username = profile.preferred_username ?? profile.email;
				if (username.toLowerCase().includes("@uni-hildesheim.de")) {
					username = username.toLowerCase().replace("@uni-hildesheim.de", "");
				}

				return {
					id: profile.sub,
					name: username, // Must be an unique identifier
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
		async session({ session, user }) {
			const username = session.user?.name ?? user.name;

			if (!username) throw new Error("Username is not defined.");

			const userFromDb = await database.user.findUniqueOrThrow({
				where: { name: username },
				select: {
					role: true,
					image: true,
					author: { select: { username: true } }
				}
			});

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
