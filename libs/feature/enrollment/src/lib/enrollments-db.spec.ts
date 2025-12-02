import { database } from "@self-learning/database";
import { enrollUser } from "./enrollments-db";
import { ApiError } from "@self-learning/util/http";

jest.mock("@self-learning/database", () => ({
	database: {
		course: {
			findUniqueOrThrow: jest.fn(),
			findUnique: jest.fn()
		},
		dynCourse: {
			findUnique: jest.fn()
		},
		enrollment: {
			create: jest.fn()
		},
		features: {
			findUnique: jest.fn()
		},
		eventLog: {
			create: jest.fn()
		}
	}
}));

(database.features.findUnique as jest.Mock).mockResolvedValue({
	learningStatistics: true
});

describe("enrollUser", () => {
	const courseId = "course-id";
	const eventLogMock = database.eventLog.create as jest.Mock;
	const username = "test-user";

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should enroll a user and create a user event", async () => {
		(database.course.findUnique as jest.Mock).mockResolvedValue({
			courseId,
			enrollments: []
		});

		const mockEnrollment = {
			createdAt: new Date(),
			status: "ACTIVE",
			course: {
				title: "Test Course",
				slug: "test-course",
				courseId
			},
			username
		};

		(database.enrollment.create as jest.Mock).mockResolvedValue(mockEnrollment);
		const result = await enrollUser({ courseId, username });

		expect(result).toEqual(mockEnrollment);
		expect(eventLogMock).toHaveBeenCalledWith({
			data: {
				username,
				type: "COURSE_ENROLL",
				resourceId: courseId,
				payload: undefined
			}
		});
	});

	it("should throw an error if the user is already enrolled", async () => {
		const createdAt = new Date();
		(database.course.findUnique as jest.Mock).mockResolvedValue({
			courseId,
			enrollments: [{ createdAt }]
		});

		try {
			await enrollUser({ courseId, username });
			fail("Expected function to throw an error");
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
		}

		expect(createUserEvent).not.toHaveBeenCalled();
	});

	it("should throw an ApiError if the course is not found", async () => {
		(database.course.findUnique as jest.Mock).mockResolvedValue(null);
		(database.dynCourse.findUnique as jest.Mock).mockResolvedValue(null);

		try {
			await enrollUser({ courseId, username });
			fail("Expected function to throw an error");
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
		}

		expect(eventLogMock).not.toHaveBeenCalled();
	});
});
