import { ComponentContentYoutubeVideo } from "../generated-graphql";
import { CmsSeedManager } from "./seed";
import { lessons } from "./example-data";

xdescribe("Seed", () => {
	const manager = new CmsSeedManager();

	beforeAll(async () => {
		await manager.init(process.env.CMS_GRAPHQL_URL as string);
	});

	xit("Create Lesson", async () => {
		const result = await manager.createLesson({
			slug: "a-new-lesson",
			title: "A New Lesson",
			subtitle: "This lesson was created with the API."
		});

		expect(result.slug).toEqual("a-new-lesson");
	});

	it("Create all lessons", async () => {
		const promises = lessons.map(lesson => manager.createLesson(lesson));
		const result = await Promise.all(promises);
		expect(result.length).toEqual(promises.length);
	});

	xit("Update Lesson", async () => {
		const youtubeVideo: Partial<ComponentContentYoutubeVideo> = {
			__typename: "ComponentContentYoutubeVideo",
			url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
		};

		const result = await manager.updateLesson(
			{
				slug: "a-new-lesson",
				title: "Updated Lesson",
				subtitle: "This lesson was updated with the API.",
				authors: ["1", "2"],
				content: [youtubeVideo]
			},
			"3"
		);

		expect(result.slug).toEqual("a-new-lesson");
		expect(result.title).toEqual("Updated Lesson");
	});

	xit("Create Course", async () => {
		const course: Parameters<CmsSeedManager["createCourse"]>[0] = {
			slug: "a-new-course",
			title: "A New Course",
			subtitle: "This course was created with the API."
		};

		const result = await manager.createCourse(course);

		expect(result.slug).toEqual(course.slug);
	});
});
