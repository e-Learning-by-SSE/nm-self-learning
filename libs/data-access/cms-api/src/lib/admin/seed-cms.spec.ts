import { ExampleDataGenerator } from "@self-learning/util/testing";
import { CourseInput, LessonInput } from "../generated-graphql";
import { CmsSeedManager } from "./seed";

/** Seeds the CMS with data defined in /libs/util/testing */
describe("Seed CMS", () => {
	const manager = new CmsSeedManager();
	const exampleData = new ExampleDataGenerator();

	const lessons: LessonInput[] = exampleData.getLessons().map(({ title, slug, description }) => ({
		title,
		slug,
		description,
		content: [
			{
				__typename: "ComponentContentYoutubeVideo",
				url: "https://www.youtube.com/watch?v=WV0UUcSPk-0"
			}
		],
		authors: ["2"]
	}));

	const courses: CourseInput[] = exampleData
		.getCourses()
		.map(({ title, slug, description, subtitle }) => ({
			title,
			slug,
			subtitle,
			description,
			authors: ["1", "2"]
		}));

	beforeAll(async () => {
		await manager.init(process.env.CMS_GRAPHQL_URL as string);
		await manager.deleteAll();
	});

	it("Create all lessons", async () => {
		const promises = lessons.map(lesson => manager.createLesson(lesson));
		const result = await Promise.all(promises);
		expect(result.length).toEqual(promises.length);
	});

	it("Create all courses", async () => {
		const promises = courses.map(course => manager.createCourse(course));
		const result = await Promise.all(promises);
		expect(result.length).toEqual(promises.length);
	});
});
