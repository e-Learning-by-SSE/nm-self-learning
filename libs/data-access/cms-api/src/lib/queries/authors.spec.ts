import { getAuthorBySlug, getAuthors } from "./authors";
describe("Authors API", () => {
	describe("authors", () => {
		it("Should return authors", async () => {
			const { authors } = await getAuthors();
			expect(authors?.data).toHaveLength(2);
		});
	});

	describe("authorBySlug", () => {
		it("Returns author by slug", async () => {
			const slug = "kent-c-dodds";
			const author = await getAuthorBySlug(slug);
			expect(author?.slug).toEqual(slug);
			expect(author?.lessons?.data.length).toBeGreaterThan(0);
		});
	});
});
