import { Author } from "@self-learning/types";
import { database } from "@self-learning/database";
import { updateAuthorAsAdmin } from "./update-author";
describe("update-author", () => {
	beforeAll(async () => {
		await database.subject.createMany({
			skipDuplicates: true,
			data: ["sub1", "sub2"].map(s => ({
				slug: s,
				subjectId: s,
				subtitle: s,
				title: s
			}))
		});

		await database.specialization.createMany({
			skipDuplicates: true,
			data: ["sub1-spec1", "sub1-spec2", "sub2-spec3"].map(s => ({
				slug: s,
				specializationId: s,
				subtitle: s,
				title: s,
				subjectId: s.startsWith("sub1") ? "sub1" : "sub2"
			}))
		});
	});

	it("No permissions -> Adds permissions", async () => {
		const username = "update-admin";

		await database.user.deleteMany({
			where: { name: username }
		});

		await database.user.create({
			data: {
				name: username,
				displayName: username,
				author: {
					create: {
						displayName: username,
						slug: username
					}
				}
			}
		});

		const before = await database.author.findUniqueOrThrow({
			where: { username },
			include: {
				specializationAdmin: true,
				subjectAdmin: true
			}
		});

		expect(before.displayName).toEqual(username);
		expect(before.subjectAdmin).toEqual([]);
		expect(before.specializationAdmin).toEqual([]);

		const author: Author = {
			displayName: "updated-admin",
			imgUrl: "updated-admin",
			slug: "updated-admin",
			subjectAdmin: [{ subjectId: "sub1" }],
			specializationAdmin: [
				{ specializationId: "sub1-spec1" },
				{ specializationId: "sub2-spec3" }
			]
		};

		await updateAuthorAsAdmin({ username, author });

		const after = await database.author.findUniqueOrThrow({
			where: { username },
			include: {
				specializationAdmin: true,
				subjectAdmin: true
			}
		});

		expect(after.displayName).toEqual(author.displayName);
		expect(after.subjectAdmin).toHaveLength(1);
		expect(after.specializationAdmin).toHaveLength(2);
	});

	it("Has permissions -> Removes permissions", async () => {
		const username = "author-with-permissions";

		await database.user.deleteMany({
			where: { name: username }
		});

		await database.user.create({
			data: {
				name: username,
				displayName: username,
				author: {
					create: {
						displayName: username,
						slug: username,
						subjectAdmin: {
							create: { subjectId: "sub1" }
						},
						specializationAdmin: {
							create: { specializationId: "sub1-spec1" }
						}
					}
				}
			}
		});

		const before = await database.author.findUniqueOrThrow({
			where: { username },
			include: {
				specializationAdmin: true,
				subjectAdmin: true
			}
		});

		expect(before.displayName).toEqual(username);
		expect(before.subjectAdmin).toHaveLength(1);
		expect(before.specializationAdmin).toHaveLength(1);

		const author: Author = {
			displayName: "updated-admin",
			imgUrl: "imgUrl-updated-admin",
			slug: "slug-updated-admin",
			subjectAdmin: [],
			specializationAdmin: []
		};

		await updateAuthorAsAdmin({ username, author });

		const after = await database.author.findUniqueOrThrow({
			where: { username },
			include: {
				specializationAdmin: true,
				subjectAdmin: true
			}
		});

		expect(after.displayName).toEqual(author.displayName);
		expect(after.subjectAdmin).toHaveLength(0);
		expect(after.specializationAdmin).toHaveLength(0);
	});
});
