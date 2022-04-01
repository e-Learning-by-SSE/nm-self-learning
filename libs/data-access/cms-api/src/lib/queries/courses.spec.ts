import { getCourseBySlug } from "./courses";

describe("Courses API", () => {
	describe("getCourseBySlug", () => {
		it("Course exists -> Returns course", async () => {
			const slug = "the-example-course";
			const course = await getCourseBySlug(slug);
			expect(course).toBeDefined();
			expect(course?.slug).toEqual(slug);
		});
	});
});
