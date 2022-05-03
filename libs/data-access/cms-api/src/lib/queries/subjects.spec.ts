import { getSubjects } from "./subjects";

describe("Subjects API", () => {
	it("getSubjects", async () => {
		const subjects = await getSubjects();
		expect(subjects.length).toBeGreaterThan(0);
	});
});
