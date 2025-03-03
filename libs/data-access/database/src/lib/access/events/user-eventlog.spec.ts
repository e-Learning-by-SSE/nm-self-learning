import { EventType, EventTypesToAlwaysSave } from "@self-learning/types";
import { database } from "@self-learning/database";
import { createUserEvent } from "./user-eventlog";
import { createHash } from "crypto";

jest.mock("@self-learning/database", () => ({
	database: {
		user: {
			findUnique: jest.fn()
		},
		eventLog: {
			create: jest.fn()
		}
	}
}));

// Mock user objects for enabled and disabled learning statistics
const mockUserEnabled = {
	name: "testUser",
	enabledLearningStatistics: true
};

const mockUserDisabled = {
	name: "testUser",
	enabledLearningStatistics: false
};

const course = { courseId: "course123" };
const lesson = { lessonId: "lesson456" };
const question = { questionId: "question789", type: "multiple-choice" };

// Base event data used in tests
const baseEventData = {
	username: "testUser",
	type: "LESSON_QUIZ_START" as keyof EventType,
	courseId: course.courseId,
	resourceId: lesson.lessonId,
	payload: {
		questionId: question.questionId,
		type: question.type
	}
};

describe("createUserEvent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should create an event with the original username when user has enabled learning statistics", async () => {
		(database.user.findUnique as jest.Mock).mockResolvedValue(mockUserEnabled);
		(database.eventLog.create as jest.Mock).mockResolvedValue(baseEventData);

		const result = await createUserEvent({ ...baseEventData });

		expect(database.user.findUnique).toHaveBeenCalledWith({
			where: { name: baseEventData.username }
		});
		expect(database.eventLog.create).toHaveBeenCalledWith({ data: baseEventData });
		expect(result).toEqual(baseEventData);
	});

	it("should create an event with an anonymized username when learning statistics are disabled and the event type is not always saved", async () => {
		(database.user.findUnique as jest.Mock).mockResolvedValue(mockUserDisabled);

		// Use an event type that is not in the always-saved list
		const eventData = { ...baseEventData, type: "LESSON_QUIZ_START" as keyof EventType };
		// Compute the expected anonymized username
		const anonymizedUsername = createHash("sha256").update(eventData.username).digest("hex");

		(database.eventLog.create as jest.Mock).mockResolvedValue({
			...eventData,
			username: anonymizedUsername
		});

		const result = await createUserEvent({ ...eventData });

		expect(database.user.findUnique).toHaveBeenCalledWith({
			where: { name: eventData.username }
		});
		expect(database.eventLog.create).toHaveBeenCalledWith({
			data: { ...eventData, username: anonymizedUsername }
		});
		expect(result).toEqual({ ...eventData, username: anonymizedUsername });
	});

	it("should create an event with the original username when learning statistics are disabled but the event type is always saved", async () => {
		(database.user.findUnique as jest.Mock).mockResolvedValue(mockUserDisabled);

		// Use an event type that is in the always-saved list, e.g., "ERROR"
		const eventData = { ...baseEventData, type: "ERROR" as keyof EventType };

		(database.eventLog.create as jest.Mock).mockResolvedValue(eventData);

		const result = await createUserEvent({ ...eventData });

		expect(database.user.findUnique).toHaveBeenCalledWith({
			where: { name: eventData.username }
		});
		expect(database.eventLog.create).toHaveBeenCalledWith({ data: eventData });
		expect(result).toEqual(eventData);
	});

	it("should return null if the user does not exist", async () => {
		(database.user.findUnique as jest.Mock).mockResolvedValue(null);

		const result = await createUserEvent({ ...baseEventData });

		expect(database.user.findUnique).toHaveBeenCalledWith({
			where: { name: baseEventData.username }
		});
		expect(database.eventLog.create).not.toHaveBeenCalled();
		expect(result).toBeNull();
	});

	// Automated test for all event types in EventTypesToAlwaysSave
	describe("EventTypesToAlwaysSave", () => {
		it("should not anonymize the username for events that are always saved", async () => {
			(database.user.findUnique as jest.Mock).mockResolvedValue(mockUserDisabled);

			for (const eventType of EventTypesToAlwaysSave) {
				const eventData = { ...baseEventData, type: eventType as keyof EventType };

				(database.eventLog.create as jest.Mock).mockResolvedValue(eventData);

				const result = await createUserEvent({ ...eventData });

				expect(database.user.findUnique).toHaveBeenCalledWith({
					where: { name: eventData.username }
				});
				expect(database.eventLog.create).toHaveBeenCalledWith({ data: eventData });
				expect(result).toEqual(eventData);

				jest.clearAllMocks();
			}
		});
	});
});
