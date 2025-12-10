"use client";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback } from "react";
import { CenteredSection } from "./containers/centered-section";
import { useLoginRedirect } from "@self-learning/util/auth";

/**
 * Wrapper for `useSession` from `next-auth` that redirects the user to the login page if they are not authenticated.
 * If this is running in a demo instance, users will be redirected to the demo login page, otherwise to the Keycloak login page.
 */
export function useRequiredSession() {
	const { loginRedirect } = useLoginRedirect();
	const session = useSession({
		required: true,
		onUnauthenticated: loginRedirect
	});
	return session;
}

export function AuthorGuard({
	children,
	error
}: {
	/** Custom error message to provide additional information, i.e., `<>Only authors can access this site.</>` */
	error?: React.ReactNode;
	/** The content to render if the user is an author. */
	children?: React.ReactNode;
}) {
	const session = useRequiredSession();

	if (!session.data?.user.isAuthor) {
		return <Unauthorized>{error}</Unauthorized>;
	}

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
}

/**
 * Wraps the given `children` and only displays them, if the user has the `ADMIN` role.
 *
 * @example
 * function AdminPage() {
 * 	return (
 * 		<AdminGuard error={<>You are not an admin.</>}>
 * 			<div>Content...</div>
 * 		</AdminGuard>
 * 		);
 * }
 */
export function AdminGuard({
	children,
	error
}: {
	/** Custom error message to provide additional information, i.e., `<>Only admins can access this site.</>` */
	error?: React.ReactNode;
	/** The content to render if the user is an admin. */
	children?: React.ReactNode;
}) {
	const session = useRequiredSession();

	if (session.data?.user.role !== "ADMIN") {
		return <Unauthorized>{error}</Unauthorized>;
	}

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
}

/**
 * Wraps the given `children` and only displays them, if the user has the `condition` evaluates to `true`.
 * Otherwise, it displays the given `error` inside of the `Unauthorized` component.
 * @example
 * function ProtectedPage() {
 * 	return (
 * 		<AuthorizedGuard
 * 			condition={Math.random() > 0.5}
 * 			error={<>You are too unlucky!</>}>
 * 				<div>Only lucky people can see this...</div>
 * 		</AuthorizedGuard>
 * 	);
 * }
 */
export function AuthorizedGuard({
	children,
	error,
	condition
}: {
	condition: boolean;
	error?: React.ReactNode;
	children?: React.ReactNode;
}) {
	if (condition) {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return <>{children}</>;
	}

	return <Unauthorized>{error}</Unauthorized>;
}

export function Unauthorized({ children }: { children?: React.ReactNode }) {
	return (
		<CenteredSection>
			<div className="flex flex-col gap-8">
				<h1 className="text-5xl">Nicht autorisiert</h1>
				<span className="text-c-text-muted">
					Diese Seite ist nur für Benutzer mit entsprechenden Rechten erreichbar.
				</span>

				{children && <div className="text-c-text-muted">{children}</div>}

				<Link href="/" className="btn-primary w-fit">
					<ArrowLeftIcon className="icon" />
					<span>Zurück zur Startseite</span>
				</Link>
			</div>
		</CenteredSection>
	);
}

export function useAuthentication() {
	const { loginRedirect } = useLoginRedirect();
	const session = useSession({ required: false });
	const isAuthenticated = session.data?.user != null;

	const withAuth = useCallback(
		(closure: () => void) => {
			if (isAuthenticated) {
				closure();
			} else {
				loginRedirect();
			}
		},
		[isAuthenticated, loginRedirect]
	);

	return { withAuth, isAuthenticated };
}

/**
 * Checks if a user has editing permission on a educational resource:
 * - Admins have full access
 * - Authors have access if they are in the list of permitted authors
 *
 * @example
 * Redirect Non privileged authors
 * ```typescript
 * if (!hasAuthorPermission({ user, permittedAuthors: lesson.authors.map(a => a.username) })) {
 *     redirectTo("/403");
 * }
 * ```
 */
export function hasAuthorPermission({
	user,
	permittedAuthors
}: {
	user: { role: "ADMIN" | "USER"; isAuthor: boolean; name: string };
	permittedAuthors: string[];
}) {
	return user.role === "ADMIN" || (user.isAuthor && permittedAuthors.includes(user.name));
}
