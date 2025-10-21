import NextAuth from "next-auth";

// https://stackoverflow.com/questions/45194598/using-process-env-in-typescript
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly NODE_ENV: "development" | "production" | "test";
			NEXT_PUBLIC_IS_DEMO_INSTANCE: string | undefined;
			NEXT_PUBLIC_BASE_PATH: string | undefined;
			NEXT_TRAILING_SLASH: Boolean | undefined;
			NEXT_PUBLIC_MATOMO_ULR: string | undefined;
			NEXT_PUBLIC_MATOMO_SITE_ID: string | undefined;
			DATABASE_URL: string;
			MINIO_ENDPOINT: string;
			MINIO_PORT: string;
			MINIO_USE_SSL: string;
			MINIO_ACCESS_KEY: string;
			MINIO_SECRET_KEY: string;
			MINIO_BUCKET_NAME: string;
			PISTON_URL: string;
			KEYCLOAK_ISSUER_URL: string;
			KEYCLOAK_CLIENT_ID: string;
			KEYCLOAK_PROVIDER_NAME: string | undefined;
			NEXTAUTH_URL?: string;
			NEXTAUTH_SECRET?: string;
			APP_VERSION: string | undefined;
		}
	}
}

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			id: string;
			name: string;
			role: "USER" | "ADMIN";
			isAuthor: boolean;
			avatarUrl?: string | null;
			enabledLearningStatistics: boolean;
			enabledFeatureLearningDiary: boolean;
		};
	}
}
