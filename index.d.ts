declare var process: {
	env: {
		NODE_ENV: "development" | "production";
		DATABASE_URL: string;
		CMS_GRAPHQL_URL: string;
		NEXT_PUBLIC_API_URL: string;
		STRAPI_WEBHOOK_TOKEN: string;
		STRAPI_HOST: string;
		STRAPI_PORT: string;
		STRAPI_APP_KEYS: string;
		STRAPI_JWT_SECRET: string;
		STRAPI_API_TOKEN_SALT: string;
		AUTH0_SECRET: string;
		AUTH0_BASE_URL: string;
		AUTH0_ISSUER_BASE_URL: string;
		AUTH0_CLIENT_ID: string;
		AUTH0_CLIENT_SECRET: string;
		GITHUB_CLIENT_ID: string;
		GITHUB_CLIENT_SECRET: string;
		NEXTAUTH_URL: string;
		NEXTAUTH_SECRET: string;
		ALGOLIA_APPLICATION_ID: string;
		ALGOLIA_ADMIN_API_KEY: string;
		NEXT_PUBLIC_ALGOLIA_APPLICATION_ID: string;
		NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY: string;
	};
};

/**
 * Type alias that excludes `null` and `undefined` from the return type of an async function.
 *
 * @example
 * async function tryGetCourse(): Promise<CourseObject | null | undefined> { ... }
 * type Course = ResolvedValue<typeof tryGetCourse>; // CourseObject
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare type ResolvedValue<Fn extends (...args: any) => unknown> = Exclude<
	Awaited<ReturnType<Fn>>,
	null | undefined
>;

/**
 * Type alias that excludes `null` and `undefined` from the given type.
 *
 * @example
 * const value: string | undefined = getStringOrUndefined();
 * const str: string = Defined<typeof value>;
 *
 * @example
 * // Next.js - getServerSideProps
 *	const course = await getCourseBySlug(slug);
 *
 *	return {
 *		props: {
 *			course: course as Defined<typeof course>
 *		},
 *		notFound: !course
 *	};
 */
type Defined<T> = Exclude<T, undefined | null>;
