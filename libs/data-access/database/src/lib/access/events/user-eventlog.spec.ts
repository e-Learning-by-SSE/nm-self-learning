import { EventType } from "@self-learning/types";
import { database } from "@self-learning/database";
import { createUserEvent } from "./user-eventlog";

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

const mockUser = {
	name: "testUser",
	enabledLearningStatistics: true
};

const course = { courseId: "course123" };
const lesson = { lessonId: "lesson456" };
const question = { questionId: "question789", type: "multiple-choice" };

const eventData = {
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
	it("should create an event when user has enabledLearningStatistics", async () => {
		(database.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
		(database.eventLog.create as jest.Mock).mockResolvedValue(eventData);

		const result = await createUserEvent(eventData);

		expect(database.user.findUnique).toHaveBeenCalledWith({
			where: { name: eventData.username }
		});

		expect(database.eventLog.create).toHaveBeenCalledWith({ data: eventData });
		expect(result).toEqual(eventData);
	});

	it("should return null if user has disabled learning statistics", async () => {
		(database.user.findUnique as jest.Mock).mockResolvedValue({
			...mockUser,
			enabledLearningStatistics: false
		});

		const result = await createUserEvent(eventData);

		expect(database.user.findUnique).toHaveBeenCalledWith({
			where: { name: eventData.username }
		});

		expect(database.eventLog.create).not.toHaveBeenCalled();
		expect(result).toBeNull();
	});

	it("should return null if user does not exist", async () => {
		(database.user.findUnique as jest.Mock).mockResolvedValue(null);

		const result = await createUserEvent(eventData);

		expect(database.user.findUnique).toHaveBeenCalledWith({
			where: { name: eventData.username }
		});

		expect(database.eventLog.create).not.toHaveBeenCalled();
		expect(result).toBeNull();
	});
});
