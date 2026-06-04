"use client";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback } from "react";
import { CenteredSection } from "./containers/centered-section";
import { useLoginRedirect } from "@self-learning/util/auth";
import { IconTextButton, LoadingBox } from "@self-learning/ui/common";
import { greaterAccessLevel, greaterOrEqAccessLevel, GroupAccess } from "@self-learning/types";
import { AccessLevel, GroupRole } from "@prisma/client";
import { useRouter } from "next/router";

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

export function MemberGuard({
	children,
	groupId,
	groupRole = GroupRole.MEMBER // TODO
}: {
	groupRole: GroupRole;
	groupId?: number;
	children?: React.ReactNode;
}) {
	const error = `Um darauf zugreifen zu können, müssen Sie Mitglied einer Gruppe sein.`;
	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";
	// const isAuthor = session.data?.user.isAuthor;
	const userGroups = new Set(session.data?.user.memberships);
	// TODO now I sacrifize expiresAt & groupRole to make it simple; const now = new Date();

	if (session.status === "loading" || groupId === undefined) {
		return <LoadingBox />;
	}

	const hasAccess = isAdmin || userGroups.has(groupId);
	return <AuthorizedGuard condition={hasAccess} children={children} error={error} />;
}

export function testResourceGuard(
	accessLevel: AccessLevel,
	allowedGroups: GroupAccess[],
	userGroups: Set<number>
) {
	const perm = allowedGroups
		.filter(g => userGroups.has(g.groupId))
		.reduce((best: GroupAccess | null, g) => {
			if (!best || greaterAccessLevel(g.accessLevel, best.accessLevel)) {
				// if better - return g
				return g;
			}
			return best;
		}, null);
	return !!perm && greaterOrEqAccessLevel(perm.accessLevel, accessLevel);
}

export function ResourceGuard({
	children,
	accessLevel,
	// resource, TODO fallback to load data from server?
	allowedGroups, // if undefined - always allow
	mode
}: {
	accessLevel: AccessLevel;
	// resource: ResourceInput;
	allowedGroups?: GroupAccess[];
	children?: React.ReactNode;
	mode: "hide" | "fallback";
}) {
	const error = `Um darauf zugreifen zu können, müssen Sie Mitglied einer Gruppe mit der Berechtigung '${accessLevel}' für die Ressource sein.`;
	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";
	const userGroups = new Set(session.data?.user.memberships);
	// TODO now I sacrifize expiresAt to make it simple; const now = new Date();

	if (session.status === "loading" || allowedGroups === undefined || userGroups === undefined) {
		return mode === "fallback" ? <LoadingBox /> : null;
	}

	const hasAccess = isAdmin || testResourceGuard(accessLevel, allowedGroups, userGroups);
	if (hasAccess) {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return <>{children}</>;
	}

	return mode === "fallback" ? <Unauthorized>{error}</Unauthorized> : null;

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
				<span className="text-c-text-muted">
					Diese Seite ist nur für Benutzer mit entsprechenden Rechten erreichbar.
				</span>

				{children && <div className="text-c-text-muted">{children}</div>}

				<Link href="/" className="btn-primary w-fit">
					<ArrowLeftIcon className="icon" />
					<span>Zurück zur Startseite</span>
				</Link>

				<IconTextButton
					text="Zurück zur vorherigen Seite"
					icon={<ArrowLeftIcon className="icon h-5" />}
					className="w-fit btn-secondary"
					onClick={() => router.back()}
				/>
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
