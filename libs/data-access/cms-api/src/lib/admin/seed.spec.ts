import { ComponentContentYoutubeVideo } from "../generated-graphql";
import { CmsSeedManager } from "./seed";

xdescribe("Seed Tests", () => {
	const manager = new CmsSeedManager();

	beforeAll(async () => {
		await manager.init(process.env.CMS_GRAPHQL_URL as string);
		await manager.deleteAll();
	});

	it("Create Lesson", async () => {
		const result = await manager.createLesson({
			slug: "a-new-lesson",
			title: "A New Lesson",
			subtitle: "This lesson was created with the API."
		});

		expect(result.slug).toEqual("a-new-lesson");
	});

	// TODO: Can't update, because ID is unknown.
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
			"3" // <- ID is unknown
		);

		expect(result.slug).toEqual("a-new-lesson");
		expect(result.title).toEqual("Updated Lesson");
	});

	it("Create Course", async () => {
		const course: Parameters<CmsSeedManager["createCourse"]>[0] = {
			slug: "a-new-course",
			title: "A New Course",
			subtitle: "This course was created with the API."
		};

		const result = await manager.createCourse(course);

		expect(result.slug).toEqual(course.slug);
	});
});
