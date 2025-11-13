import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare global {
	declare namespace NodeJS {
		interface ProcessEnv {
			readonly NODE_ENV: "development" | "production" | "test";
			NEXT_PUBLIC_SITE_BASE_URL: string;
			NEXT_PUBLIC_IS_DEMO_INSTANCE: string | undefined;
			NEXT_PUBLIC_BASE_PATH: string | undefined;
			NEXT_TRAILING_SLASH: boolean | undefined;
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
			KEYCLOAK_CLIENT_SECRET: string;
			KEYCLOAK_PROVIDER_NAME: string | undefined;
			NEXTAUTH_URL?: string;
			NEXTAUTH_SECRET?: string;
			APP_VERSION: string;
			SCHEDULER_SECRET: string | undefined;
			RESEND_API_KEY: string | undefined;
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
			role: UserRole;
			isAuthor: boolean;
			avatarUrl?: string | null;
			featureFlags: {
				learningDiary: boolean;
				learningStatistics: boolean;
				experimental: boolean;
			};
		};
	}
}
