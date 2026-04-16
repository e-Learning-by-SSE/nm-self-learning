import { prepareRagContent } from "./content-preparation";
import { LessonContent } from "@self-learning/types";

describe("content preparation", () => {
	it("should handle empty fields", async () => {
		// Setup
		const lessonContent: LessonContent = [
			{ meta: { estimatedDuration: 0 }, type: "article", value: { content: "" } },
			{ meta: { duration: 0 }, type: "video", value: { url: "https://youtu.be/meH5HRe7jv0" } }
		];

		// Execute
		const result = await prepareRagContent(lessonContent);

		// Verify
		expect(result.pdfBuffers).toEqual([]);
		expect(result.articleTexts).toEqual([""]);
		expect(result.transcriptTexts).toEqual([]);
	});
});
