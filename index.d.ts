import { UserRole } from "@prisma/client";
import "hast";

declare global {
	declare namespace NodeJS {
		interface ProcessEnv {
			readonly NODE_ENV: "development" | "production" | "test";
			NEXT_PUBLIC_SITE_BASE_URL: string;
			NEXT_PUBLIC_IS_DEMO_INSTANCE: string | undefined;
			SITE_SYSTEM_MSG: string | undefined;
			NEXT_PUBLIC_BASE_PATH: string | undefined;
			NEXT_PUBLIC_ONLINE_HELP_BASE_URL: string | undefined;
			NEXT_PUBLIC_ONLINE_HELP_LANGUAGES: string | undefined;
			NEXT_TRAILING_SLASH: boolean | undefined;
			NEXT_PUBLIC_MATOMO_ULR: string | undefined;
			NEXT_PUBLIC_MATOMO_SITE_ID: string | undefined;
			NEXT_PUBLIC_TRANSCRIPTION_SERVICE_URL: string | undefined;
			NEXT_PUBLIC_TRANSCRIPTION_MIGRATE_EXISTING_VIDEO_CONTENT: string | undefined;
			DATABASE_URL: string;
			STORAGE_ENDPOINT: string;
			STORAGE_PORT: string;
			STORAGE_USE_SSL: string;
			STORAGE_ACCESS_KEY: string;
			STORAGE_SECRET_KEY: string;
			STORAGE_BUCKET_NAME: string;
			STORAGE_SERVER_PUBLIC_URL?: string;
			PISTON_URL: string;
			OIDC_CLIENTS: string | undefined;
			OIDC_SCOPES: string | undefined;
			NEXTAUTH_URL?: string;
			NEXTAUTH_SECRET?: string;
			APP_VERSION: string;
			SCHEDULER_SECRET: string | undefined;
			RESEND_API_KEY: string | undefined;
			WORKER_SERVICE_URL: string | undefined;
			WORKER_SERVICE_WS_URL: string | undefined;
			WORKER_SERVICE_SECRET: string | undefined;
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
			memberships: number[];
			featureFlags: {
				learningDiary: boolean;
				learningStatistics: boolean;
				experimental: boolean;
			};
			defaultGroupId?: number;
		};
	}
}

// Augment HAST types
// Used in markdown/invalid-language-filter.ts
declare module "hast" {
	interface Properties {
		className?: string | string[];
		alt?: string;
	}
}
