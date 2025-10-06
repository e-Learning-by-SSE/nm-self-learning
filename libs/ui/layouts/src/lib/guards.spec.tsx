import { hasAuthorPermission } from "./guards";

describe("hasAuthorPermission", () => {
	it("should return true for admin users", () => {
		const user = { role: "ADMIN" as const, isAuthor: false, name: "adminUser" };
		const permittedAuthors: string[] = [];
		const result = hasAuthorPermission({ user, permittedAuthors });
		expect(result).toBe(true);
	});

	it("should return true for authors in the permitted list", () => {
		const user = { role: "USER" as const, isAuthor: true, name: "authorUser" };
		const permittedAuthors = ["authorUser"];
		const result = hasAuthorPermission({ user, permittedAuthors });
		expect(result).toBe(true);
	});

	it("should return false for authors not in the permitted list", () => {
		const user = { role: "USER" as const, isAuthor: true, name: "authorUser" };
		const permittedAuthors = ["otherAuthor"];
		const result = hasAuthorPermission({ user, permittedAuthors });
		expect(result).toBe(false);
	});

	it("should return false for non-author users", () => {
		const user = { role: "USER" as const, isAuthor: false, name: "regularUser" };
		const permittedAuthors: string[] = [];
		const result = hasAuthorPermission({ user, permittedAuthors });
		expect(result).toBe(false);
	});
});
