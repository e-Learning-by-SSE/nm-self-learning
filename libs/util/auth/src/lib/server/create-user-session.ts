import { UserRole } from "@prisma/client";
import { database } from "@self-learning/database";
import { jwtDecode } from "jwt-decode";
import { CallbacksOptions, Session } from "next-auth";

export function getIdpSelflearnAdminRole(access_token: string | undefined): UserRole | undefined {
	// realm_access.roles is optional claim -> Check if claim exists
	if (!access_token) return;

	const claims = jwtDecode(access_token) satisfies KeyCloakClaims;
	const access_roles = claims["realm_access"];
	if (!access_roles) return;

	// Admin role of Self-Learning is defined as selflearn_admin in KeyCloak
	const roles = access_roles["roles"] as string[];
	return incomingToLocalRole(roles ?? []);
}

export function incomingToLocalRole(tokenRoles: string[]): UserRole {
	if (tokenRoles.includes(ADMIN_ROLE)) {
		return UserRole.ADMIN;
	} else {
		return UserRole.USER;
	}
}

type KeyCloakClaims = {
	realm_access?: {
		roles?: string[];
	};
};

const ADMIN_ROLE = "selflearn_admin";

// should not contain sensitive data. User can access but not change this data.
type TokenType = Session["user"];

export async function createToken(name: string, incomingRole: UserRole): Promise<TokenType> {
	const userFromDb = await database.user.findUniqueOrThrow({
		where: { name },
		select: {
			id: true,
			role: true,
			image: true,
			author: { select: { username: true } },
			enabledFeatureLearningDiary: true,
			enabledLearningStatistics: true,
			experimentalFeatures: true,
			acceptedExperimentTerms: true
		}
	});
	const updateUser = (role: UserRole) => {
		return database.user.update({
			where: { name },
			data: { role },
			select: {
				role: true
			}
		});
	};

	let userRole = userFromDb.role;
	// Remote permissions wins over local permissions
	if (userFromDb.role === "ADMIN" && incomingRole !== "ADMIN") {
		// Local Admin, remote not -> Demote to User
		const updated = await updateUser(incomingRole);
		userRole = updated.role;
	} else if (userFromDb.role !== "ADMIN" && incomingRole === "ADMIN") {
		// Local User, remote Admin -> Promote to Admin
		const updated = await updateUser("ADMIN");
		userRole = updated.role;
	}

	const features: Session["user"]["features"] = [];
	if (userFromDb.enabledLearningStatistics) {
		features.push("learningStatistics");
	}
	if (userFromDb.enabledFeatureLearningDiary) {
		features.push("learningDiary");
	}
	if (userFromDb.acceptedExperimentTerms && userFromDb.experimentalFeatures) {
		features.push("experimentalFeatures");
	}

	return {
		id: userFromDb.id,
		name: name,
		role: userRole,
		isAuthor: !!userFromDb.author,
		avatarUrl: userFromDb.image,
		enabledLearningStatistics: userFromDb.enabledLearningStatistics,
		enabledFeatureLearningDiary: userFromDb.enabledFeatureLearningDiary,
		features
	};
}

export const authCallbacks: Partial<CallbacksOptions> = {
	jwt: async ({ token, user, account }) => {
		if (!user?.name) return token; // user not logged in

		const { name } = user;
		let incomingRole: UserRole | undefined;
		if (!account?.access_token && process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE) {
			// In demo instance, we don't have an access token => demo accounts
			const { role } = await database.user.findUniqueOrThrow({
				where: { name },
				select: { role: true }
			});
			incomingRole = role;
		} else if (account?.access_token) {
			incomingRole = getIdpSelflearnAdminRole(account.access_token);
		}
		const ownToken = await createToken(name, incomingRole ?? "USER");

		Object.assign(token, ownToken);
		return token;
	},
	session({ session, token }) {
		// is created after the JWT callback and is run each time the session is accessed.
		// try to avoid adding heavy logic here, as it could run on every request.
		const tokenTyped = token as TokenType;
		session.user = {
			...session.user,
			...tokenTyped
		};
		return session;
	}
};
