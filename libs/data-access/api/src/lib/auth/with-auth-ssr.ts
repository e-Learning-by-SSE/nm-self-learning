import { GetServerSidePropsContext, PreviewData } from "next";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { ParsedUrlQuery } from "querystring";
import { UserFromSession } from "../trpc/context";
import { authOptions } from "./auth";

export async function getAuthenticatedUser(
	ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
): Promise<UserFromSession | undefined> {
	const session = await getSession(ctx);
	if (!session) return;
	if (!session.user) return;
	return session.user;
}

/**
 * Higher-order function to wrap a `getServerSideProps` function with authentication.
 *
 * This function checks if a user is authenticated before allowing access to the wrapped `getServerSideProps` function.
 * If the user is not authenticated, they are redirected to the sign-in page with the current URL as the callback URL.
 *
 * @param gssp - The `getServerSideProps` function to wrap. It receives the context and the authenticated user as arguments.
 * @returns A new `getServerSideProps` function that includes authentication.
 *
 * @example
 * ```typescript
 * const getServerSideProps: GetServerSideProps = withAuth(async (context, user) => {
 *   // Your server-side logic here, with access to the authenticated user
 *
 * 	const data = await getData(user.name); // user is defined here
 *   return {
 *     props: {
 *       data,
 *     },
 *   };
 * });
 *
 * export default function Page({ user }) {
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 */
export function withAuth(
	gssp: (
		context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
		user: UserFromSession
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	) => Promise<any>
) {
	return async (context: GetServerSidePropsContext) => {
		const session = await getServerSession(context.req, context.res, authOptions);
		const sessionUser = session?.user;

		if (!session || !sessionUser) {
			const callbackUrl = encodeURIComponent(context.resolvedUrl);
			return {
				redirect: {
					destination: `/api/auth/signin?callbackUrl=${callbackUrl}`,
					permanent: false
				}
			};
		}

		return await gssp(context, sessionUser);
	};
}
