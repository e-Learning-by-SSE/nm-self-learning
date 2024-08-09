import { LearningActivity } from "@self-learning/types";
import { getMediaType } from "./auxillary";

describe("getMediaType", () => {
	it("should return the media type with the highest change count and the total number of changes", () => {
		const activity = {
			mediaChangeCount: {
				video: 5,
				article: 3,
				iframe: 2,
				pdf: 1
			}
		} as LearningActivity;

		const result = getMediaType(activity);

		expect(result.preferredMediaType).toBe("video");
		expect(result.numberOfChangesMediaType).toBe(11);
	});

	it("should handle cases where all media change counts are zero", () => {
		const activity = {
			mediaChangeCount: {
				video: 0,
				article: 0,
				iframe: 0,
				pdf: 0
			}
		} as LearningActivity;

		const result = getMediaType(activity);

		expect(result.preferredMediaType).toBe("video"); // Default to 'video' as per the initial value in reduce
		expect(result.numberOfChangesMediaType).toBe(0);
	});

	it("should handle cases where some media change counts are missing", () => {
		const activity = {
			mediaChangeCount: {
				video: 5,
				article: 3
			}
		} as LearningActivity;

		const result = getMediaType(activity);

		expect(result.preferredMediaType).toBe("video");
		expect(result.numberOfChangesMediaType).toBe(8);
	});

	it("should handle cases where media change counts are equal", () => {
		const activity = {
			mediaChangeCount: {
				video: 3,
				article: 3,
				iframe: 3,
				pdf: 3
			}
		} as LearningActivity;

		const result = getMediaType(activity);

		expect(result.preferredMediaType).toBe("video"); // Default to 'video' as per the initial value in reduce
		expect(result.numberOfChangesMediaType).toBe(12);
	});
});
