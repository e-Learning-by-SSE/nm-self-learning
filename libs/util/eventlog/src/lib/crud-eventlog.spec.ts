import { database } from "@self-learning/database";
import { createHash } from "crypto";
import { createEventLogEntry } from "./crud-eventlog";
import { EventTypeKeys } from "@self-learning/types";
import { ALWAYS_SAVE_EVENT_TYPES } from "./privacy-exceptions.conf";

jest.mock("@self-learning/database", () => ({
	database: {
		features: {
			findUnique: jest.fn()
		},
		eventLog: {
			create: jest.fn()
		}
	}
}));

const course = { courseId: "course123" };
const lesson = { lessonId: "lesson456" };
const question = { questionId: "question789", type: "multiple-choice" };

// Base event data used in tests
const baseEventData = {
	username: "testUser",
	type: "LESSON_QUIZ_START" as const,
	courseId: course.courseId,
	resourceId: lesson.lessonId,
	payload: {
		questionId: question.questionId,
		type: question.type,
		lessonAttemptId: "lessonAttempt123"
	}
};

describe("createUserEvent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should create an event with the original username when user has enabled learning statistics", async () => {
		(database.features.findUnique as jest.Mock).mockResolvedValue({ learningStatistics: true });
		(database.eventLog.create as jest.Mock).mockResolvedValue(baseEventData);

		const result = await createEventLogEntry({ ...baseEventData });

		expect(database.features.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { username: baseEventData.username }
			})
		);
		expect(database.eventLog.create).toHaveBeenCalledWith({ data: baseEventData });
		expect(result).toEqual(baseEventData);
	});

	it("should create an event with an anonymized username when learning statistics are disabled and the event type is not always saved", async () => {
		(database.features.findUnique as jest.Mock).mockResolvedValue({
			learningStatistics: false
		});

		// Use an event type that is not in the always-saved list
		const eventData = { ...baseEventData, type: "LESSON_QUIZ_START" as const };
		// Compute the expected anonymized username
		const anonymizedUsername = createHash("sha256").update(eventData.username).digest("hex");

		(database.eventLog.create as jest.Mock).mockResolvedValue({
			...eventData,
			username: anonymizedUsername
		});

		const result = await createEventLogEntry({ ...eventData });

		expect(database.features.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { username: baseEventData.username }
			})
		);
		expect(database.eventLog.create).toHaveBeenCalledWith({
			data: { ...eventData, username: anonymizedUsername }
		});
		expect(result).toEqual({ ...eventData, username: anonymizedUsername });
	});

	it("should create an event with the original username when learning statistics are disabled but the event type is always saved", async () => {
		(database.features.findUnique as jest.Mock).mockResolvedValue({
			learningStatistics: false
		});

		const eventData = {
			...baseEventData,
			type: "ERROR" as const,
			payload: {
				...baseEventData.payload,
				path: "/example/path",
				error: "Example error message"
			}
		};

		(database.eventLog.create as jest.Mock).mockResolvedValue(eventData);

		const result = await createEventLogEntry({ ...eventData });

		expect(database.eventLog.create).toHaveBeenCalledWith({ data: eventData });
		expect(result).toEqual(eventData);
	});

	// Automated test for all event types in EventTypesToAlwaysSave
	describe("EventTypesToAlwaysSave", () => {
		it("should not anonymize the username for events that are always saved", async () => {
			(database.features.findUnique as jest.Mock).mockResolvedValue({
				learningStatistics: false
			});

			for (const eventType of ALWAYS_SAVE_EVENT_TYPES) {
				const eventData = { ...baseEventData, type: eventType as EventTypeKeys };

				(database.eventLog.create as jest.Mock).mockResolvedValue(eventData);

				const result = await createEventLogEntry({ ...eventData });

				expect(database.eventLog.create).toHaveBeenCalledWith({ data: eventData });
				expect(result).toEqual(eventData);

				jest.clearAllMocks();
			}
		});
	});
});
