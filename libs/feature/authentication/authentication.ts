import { useSession } from "next-auth/react";

export function isUserAuthenticatedInSession() {
	const userStatus = useSession().status;
	if (userStatus === "authenticated") {
		return true;
	}
	return false;
}
