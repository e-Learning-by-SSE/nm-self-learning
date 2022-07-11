import { ChapterWithNr, Content, mapContent } from "./types";

describe("mapContent", () => {
	it("Root level -> 1, 2", () => {
		const content: Content = [
			{
				type: "chapter",
				title: "Chapter 1",
				content: []
			},
			{
				type: "chapter",
				title: "Chapter 2",
				content: []
			}
		];

		const [chapter1, chapter2] = mapContent(content) as ChapterWithNr[];

		expect(chapter1.chapterNr).toEqual("1");
		expect(chapter2.chapterNr).toEqual("2");
	});

	it("Level two -> 1 -> 1.1, 1.2", () => {
		const content: Content = [
			{
				type: "chapter",
				title: "Chapter 1",
				content: [
					{
						type: "chapter",
						title: "Chapter 1.1",
						content: []
					},
					{
						type: "chapter",
						title: "Chapter 1.2",
						content: []
					}
				]
			}
		];

		const result = mapContent(content) as ChapterWithNr[];
		const [chapter1, chapter2] = result[0].content as ChapterWithNr[];

		expect(chapter1.chapterNr).toEqual("1.1");
		expect(chapter2.chapterNr).toEqual("1.2");
	});

	it("Level three -> 1.1 -> 1.1.1, 1.1.2", () => {
		const content: Content = [
			{
				type: "chapter",
				title: "Chapter 1",
				content: [
					{
						type: "chapter",
						title: "Chapter 1.1",
						content: [
							{
								type: "chapter",
								title: "Chapter 1.1.1",
								content: []
							},
							{
								type: "chapter",
								title: "Chapter 1.1.2",
								content: []
							}
						]
					}
				]
			}
		];

		const result = mapContent(content) as ChapterWithNr[];
		const subchapter1 = result[0].content as ChapterWithNr[];
		const [chapter1, chapter2] = (subchapter1[0] as ChapterWithNr).content as ChapterWithNr[];

		expect(chapter1.chapterNr).toEqual("1.1.1");
		expect(chapter2.chapterNr).toEqual("1.1.2");
	});
});
