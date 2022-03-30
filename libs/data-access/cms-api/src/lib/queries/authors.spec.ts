import { getAuthors } from "./authors";
describe("Authors API", () => {
	it("Should return authors", async () => {
		const { authors } = await getAuthors();
		expect(authors?.data).toHaveLength(2);
	});
});
