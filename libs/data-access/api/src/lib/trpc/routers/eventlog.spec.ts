import { userEventRouter } from "./eventlog.router";
import { Context } from "../context";
import { t } from "../trpc";
import { createUserEvent, loadUserEvents } from "@self-learning/util/common";
import { actionPayloadTypesSchema } from "@self-learning/types";

jest.mock("@self-learning/util/common");

function prepare() {
	const mockCreateUserEvent = createUserEvent as jest.MockedFunction<typeof createUserEvent>;
	mockCreateUserEvent.mockResolvedValue({
		id: 1,
		createdAt: new Date(),
		userId: "user-id",
		resourceId: null,
		action: "COURSE_RESUME",
		payload: { resumeLessonId: "lesson-id" }
	});
	const ctx: Context = {
		user: {
			id: "user-id",
			name: "John Doe",
			role: "USER",
			isAuthor: false
		}
	};
	const mockLoadUserEvent = loadUserEvents as jest.MockedFunction<typeof loadUserEvents>;
	const caller = t.createCallerFactory(userEventRouter)(ctx);
	return { caller, mockCreateUserEvent, mockLoadUserEvent };
}
describe("userEventRouter create", () => {
	it("should create new db entry", async () => {
		const { caller, mockCreateUserEvent } = prepare();
		const input = {
			action: "COURSE_RESUME" as const,
			payload: { resumeLessonId: "lesson-id" }
		};
		await caller.create(input);
		expect(mockCreateUserEvent).toHaveBeenCalledWith({
			userId: "user-id",
			...input,
			payload: input.payload
		});
	});

	it("should create a timestamp", async () => {
		const { caller } = prepare();
		const input = {
			action: "USER_LOGIN" as const,
			payload: undefined
		};
		const result = await caller.create(input);
		expect(result).toHaveProperty("createdAt");
	});

	it("should validate correct payloads", async () => {
		const { caller } = prepare();
		const input = {
			action: "COURSE_RESUME" as const,
			payload: { resumeLessonId: "lesson-id" }
		};
		const result = await caller.create(input); // could throw an error on validation fail
		// also check manual validation

		const schema = actionPayloadTypesSchema.shape["COURSE_RESUME"];
		expect(() => schema.parse(result.payload)).not.toThrow();
	});
	it("should not pass incorrect payloads", async () => {
		const { caller } = prepare();
		const input = {
			action: "COURSE_RESUME" as const,
			payload: undefined // COURSE_RESUME must have a payload
		};
		expect(caller.create(input)).rejects.toThrow();
	});
});
