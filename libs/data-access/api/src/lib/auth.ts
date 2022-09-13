import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { database } from "@self-learning/database";
import { randomBytes } from "crypto";
import { addDays } from "date-fns";
import { NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
	theme: { colorScheme: "light" },
	adapter: PrismaAdapter(database),
	session: {
		strategy: "jwt"
	},
	providers: [
		Auth0Provider({
			clientId: process.env.AUTH0_CLIENT_ID as string,
			clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
			issuer: process.env.AUTH0_ISSUER_BASE_URL as string
		}),
		GitHubProvider({
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string
		}),
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

				const account = await database.account.findUniqueOrThrow({
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
								displayName: username,
								username: username
							}
						}
					}
				});

				console.log(`[auth]: Created new user: ${username}`);

				return user;
			}
		})
	]
};
