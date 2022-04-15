import { getCourseBySlug, getCoursesWithSlugs } from "./courses";

describe("Courses API", () => {
	describe("getCourseBySlug", () => {
		it("Course exists -> Returns course", async () => {
			const slug = "the-example-course";
			const course = await getCourseBySlug(slug);
			expect(course).toBeDefined();
			expect(course?.slug).toEqual(slug);
		});
	});

	describe("getCoursesWithSlugs", () => {
		it("Courses exist -> Returns courses", async () => {
			const slugs = ["the-example-course"];
			const courses = await getCoursesWithSlugs(slugs);
			expect(courses).toHaveLength(1);
			expect(courses[0].slug).toEqual(slugs[0]);
		});

		it("Includes non-existing slug -> Returns existing courses", async () => {
			const slugs = ["the-example-course", "does-not-exist"];
			const courses = await getCoursesWithSlugs(slugs);
			expect(courses).toHaveLength(1);
			expect(courses[0].slug).toEqual(slugs[0]);
		});
	});
});
