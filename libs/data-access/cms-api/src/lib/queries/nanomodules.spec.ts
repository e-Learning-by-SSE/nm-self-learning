import { getNanomoduleBySlug } from "./nanomodules";

describe("Nanomodules API", () => {
	describe("getNanomoduleBySlug", () => {
		it("Exists -> Returns nanomodule", async () => {
			const slug = "a-beginners-guide-to-react-introduction";
			const result = await getNanomoduleBySlug(slug);
			expect(result).toBeDefined();
			expect(result?.slug).toEqual(slug);
		});
	});
});
