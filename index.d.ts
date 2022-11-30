import NextAuth from "next-auth";

declare var process: {
	env: {
		NODE_ENV: "development" | "production";
		DATABASE_URL: string;
		MINIO_ENDPOINT: string;
		MINIO_PORT: string;
		MINIO_USE_SSL: string;
		MINIO_ACCESS_KEY: string;
		MINIO_SECRET_KEY: string;
		MINIO_PUBLIC_URL?: string;
		MINIO_BUCKET_NAME: string;
		PISTON_URL: string;
		AUTH0_SECRET: string;
		AUTH0_BASE_URL: string;
		AUTH0_ISSUER_BASE_URL: string;
		AUTH0_CLIENT_ID: string;
		AUTH0_CLIENT_SECRET: string;
		GITHUB_CLIENT_ID: string;
		GITHUB_CLIENT_SECRET: string;
		KEYCLOAK_ISSUER_URL: string;
		KEYCLOAK_CLIENT_ID: string;
		NEXTAUTH_URL: string;
		NEXTAUTH_SECRET: string;
		ALGOLIA_APPLICATION_ID: string;
		ALGOLIA_ADMIN_API_KEY: string;
		NEXT_PUBLIC_ALGOLIA_APPLICATION_ID: string;
		NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY: string;
	};
};

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			name: string;
			role: "USER" | "ADMIN";
			avatarUrl?: string | null;
			author?: { slug: string } | null;
		};
	}
}
