import { UserRole } from "@prisma/client";
import { getIdpSelflearnAdminRole } from "./create-user-session";

function tokenWithClaims(claims: object): string {
	return [
		Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url"),
		Buffer.from(JSON.stringify(claims)).toString("base64url"),
		"signature"
	].join(".");
}

describe("getIdpSelflearnAdminRole", () => {
	it("returns undefined when no access token is provided", () => {
		expect(getIdpSelflearnAdminRole(undefined)).toBeUndefined();
	});

	it("returns undefined when realm_access is not provided", () => {
		expect(getIdpSelflearnAdminRole(tokenWithClaims({ sub: "student" }))).toBeUndefined();
	});

	it("promotes a user when realm_access contains selflearn_admin", () => {
		const token = tokenWithClaims({
			realm_access: { roles: ["student", "selflearn_admin"] }
		});

		expect(getIdpSelflearnAdminRole(token)).toBe(UserRole.ADMIN);
	});

	it("keeps a user role when realm_access does not contain selflearn_admin", () => {
		const token = tokenWithClaims({ realm_access: { roles: ["student"] } });

		expect(getIdpSelflearnAdminRole(token)).toBeUndefined();
	});

	it("ignores opaque or malformed access tokens", () => {
		expect(getIdpSelflearnAdminRole("opaque-access-token")).toBeUndefined();
	});
});
