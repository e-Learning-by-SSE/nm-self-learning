import { cmsGraphqlClient } from "../cms-graphql-client";
import { getLessonBySlug } from "./lessons";

describe("Lessons API", () => {
	describe("getLessonBySlug", () => {
		it("Exists -> Returns lessons", async () => {
			const slug = "a-beginners-guide-to-react-introduction";
			const result = await getLessonBySlug(slug);
			expect(result).toBeDefined();
			expect(result?.slug).toEqual(slug);
		});
	});

	xdescribe("getLessonsForSync", () => {
		it("Log result", async () => {
			const result = await cmsGraphqlClient.lessonsForSync();
			console.log(result);
		});
	});
});
