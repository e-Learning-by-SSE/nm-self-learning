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
	// TODO author does not have any permissions anymore
	// TODO add tests for other stuff
	it("TODO", async () => {});
});
