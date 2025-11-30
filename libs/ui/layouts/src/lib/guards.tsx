"use client";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CenteredSection } from "./containers/centered-section";
import { redirectToLogin } from "./redirect-to-login";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { IconButton, LoadingBox } from "@self-learning/ui/common";
import { greaterAccessLevel, greaterOrEqAccessLevel, GroupAccess } from "@self-learning/types";
import { AccessLevel, GroupRole } from "@prisma/client";

/**
 * Wrapper for `useSession` from `next-auth` that redirects the user to the login page if they are not authenticated.
 * If this is running in a demo instance, users will be redirected to the demo login page, otherwise to the Keycloak login page.
 */
export function useRequiredSession() {
	const session = useSession({
		required: true,
		onUnauthenticated: redirectToLogin
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

export function MemberGuard({
	children,
	groupId,
	groupRole = GroupRole.MEMBER // TODO
}: {
	groupRole: GroupRole;
	groupId: number;
	children?: React.ReactNode;
}) {
	const error = `Um darauf zugreifen zu können, müssen Sie Mitglied einer Gruppe sein.`;
	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";
	// const isAuthor = session.data?.user.isAuthor;
	const userGroups = new Set(session.data?.user.memberships);
	// TODO now I sacrifize expiresAt & groupRole to make it simple; const now = new Date();

	if (session.status === "loading") {
		return <LoadingBox />;
	}

	const hasAccess = isAdmin || userGroups.has(groupId);
	return <AuthorizedGuard condition={hasAccess} children={children} error={error} />;
}

export function ResourceGuard({
	children,
	accessLevel,
	// resource, TODO fallback to load data from server?
	allowedGroups, // if undefined - always allow
	isLoading
}: {
	accessLevel: AccessLevel;
	// resource: ResourceInput;
	allowedGroups?: GroupAccess[];
	children?: React.ReactNode;
	isLoading?: boolean;
}) {
	const error = `Um darauf zugreifen zu können, müssen Sie Mitglied einer Gruppe mit der Berechtigung '${accessLevel}' für die Ressource sein.`;
	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";
	// const isAuthor = session.data?.user.isAuthor;
	const userGroups = new Set(session.data?.user.memberships);
	// TODO now I sacrifize expiresAt to make it simple; const now = new Date();

	if (isLoading || session.status === "loading") {
		return <LoadingBox />;
	}

	let hasAccess = !allowedGroups || isAdmin; // if allowedGroups undefined - always allow
	// go through group cache
	if (!hasAccess && allowedGroups) {
		const perm = allowedGroups
			.filter(g => userGroups.has(g.groupId))
			.reduce((best: GroupAccess | null, g) => {
				if (!best || greaterAccessLevel(g.accessLevel, best.accessLevel)) {
					// if better - return g
					return g;
				}
				return best;
			}, null);
		hasAccess = !!perm && greaterOrEqAccessLevel(perm.accessLevel, accessLevel);
	}
	return <AuthorizedGuard condition={hasAccess} children={children} error={error} />;

	// const { data: hasEditAccess, isLoading } =
	// 		trpc.permission.hasResourceAccess.useQuery(
	// 			{
	// 				lessonId: initialLesson?.lessonId!,
	// 				accessLevel: "EDIT"
	// 			},
	// 			{
	// 				enabled: !isNew && !isAdmin && isAuthor,
	// 			}
	// 		);
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
	const router = useRouter();
	return (
		<CenteredSection>
			<div className="flex flex-col gap-8">
				<h1 className="text-5xl">Nicht autorisiert</h1>
				<span className="text-light">
					Diese Seite ist nur für Benutzer mit entsprechenden Rechten erreichbar.
				</span>

				{children && <div className="text-light">{children}</div>}

				<Link href="/" className="btn-primary w-fit">
					<ArrowLeftIcon className="icon" />
					<span>Zurück zur Startseite</span>
				</Link>

				<IconButton
					text="Zurück zur vorherigen Seite"
					icon={<ArrowLeftIcon className="icon h-5" />}
					variant="secondary"
					className="w-fit"
					onClick={() => router.back()}
				/>
			</div>
		</CenteredSection>
	);
}

export function useAuthentication() {
	const router = useRouter();
	const callbackUrl = encodeURIComponent(router.asPath);
	const redirectLogin = useCallback(() => {
		router.push(`/api/auth/signin?callbackUrl=${callbackUrl}`);
	}, [router, callbackUrl]);
	const session = useSession({ required: false });
	const isAuthenticated = session.data?.user != null;

	const withAuth = useCallback(
		(closure: () => void) => {
			if (isAuthenticated) {
				closure();
			} else {
				redirectLogin();
			}
		},
		[isAuthenticated, redirectLogin]
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
