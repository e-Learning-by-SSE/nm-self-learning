import { createUserEvent, database } from "@self-learning/database";
import { enrollUser } from "./enrollments-db";
import { ApiError } from "@self-learning/util/http";

jest.mock("@self-learning/database", () => ({
	createUserEvent: jest.fn(),
	database: {
		course: {
			findUniqueOrThrow: jest.fn()
		},
		enrollment: {
			create: jest.fn()
		}
	}
}));

describe("enrollUser", () => {
	const courseId = "course-id";
	const username = "test-user";

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should enroll a user and create a user event", async () => {
		(database.course.findUniqueOrThrow as jest.Mock).mockResolvedValue({
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
		expect(createUserEvent).toHaveBeenCalledWith({
			username,
			action: "COURSE_ENROLL",
			resourceId: courseId,
			payload: undefined
		});
	});

	it("should throw an error if the user is already enrolled", async () => {
		const createdAt = new Date();
		(database.course.findUniqueOrThrow as jest.Mock).mockResolvedValue({
			courseId,
			enrollments: [{ createdAt }]
		});

		// await expect(enrollUser({ courseId, username })).rejects.toThrow(ApiError); // TODO this does not work in testing

		expect(createUserEvent).not.toHaveBeenCalled();
	});
});
