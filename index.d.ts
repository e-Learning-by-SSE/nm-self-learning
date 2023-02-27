import NextAuth from "next-auth";

declare var process: {
	env: {
		NODE_ENV: "development" | "production";
		NEXT_PUBLIC_IS_DEMO_INSTANCE: string | undefined;
		NEXT_PUBLIC_BASE_PATH: string | undefined,
		NEXT_TRAILING_SLASH: Boolean | undefined,
		DATABASE_URL: string;
		MINIO_ENDPOINT: string;
		MINIO_PORT: string;
		MINIO_USE_SSL: string;
		MINIO_ACCESS_KEY: string;
		MINIO_SECRET_KEY: string;
		MINIO_PUBLIC_URL?: string;
		MINIO_BUCKET_NAME: string;
		PISTON_URL: string;
		KEYCLOAK_ISSUER_URL: string;
		KEYCLOAK_CLIENT_ID: string;
		NEXTAUTH_URL: string;
		NEXTAUTH_SECRET: string;
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
			isAuthor: boolean;
			avatarUrl?: string | null;
		};
	}
}
