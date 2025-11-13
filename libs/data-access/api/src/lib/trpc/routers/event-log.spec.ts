import { userEventRouter } from "./event-log.router";
import { Context } from "../context";
import { t } from "../trpc";
import { createEventLogEntry, loadUserEventLogs } from "@self-learning/util/eventlog";
import { eventDefinitions } from "@self-learning/types";

jest.mock("@self-learning/database");
jest.mock("@self-learning/util/eventlog", () => ({
	createEventLogEntry: jest.fn(),
	loadUserEventLogs: jest.fn()
}));
function prepare() {
	const mockCreateUserEvent = createEventLogEntry as jest.MockedFunction<
		typeof createEventLogEntry
	>;
	mockCreateUserEvent.mockResolvedValue({
		resourceId: "",
		courseId: "",
		type: "ERROR",
		payload: { error: "error", path: "path" }
	});
	const ctx: Context = {
		user: {
			id: "user-id",
			name: "john",
			role: "USER",
			isAuthor: false,
			avatarUrl: null,
			featureFlags: {
				learningDiary: false,
				learningStatistics: false,
				experimental: false
			}
		}
	};
	const mockLoadUserEvent = loadUserEventLogs as jest.MockedFunction<typeof loadUserEventLogs>;
	const caller = t.createCallerFactory(userEventRouter)(ctx);
	return { caller, mockCreateUserEvent, mockLoadUserEvent };
}
describe("userEventRouter create", () => {
	it("should create new db entry", async () => {
		const { caller, mockCreateUserEvent } = prepare();
		const input = {
			type: "ERROR" as const,
			payload: { error: "error", path: "path" }
		};
		await caller.create(input);
		expect(mockCreateUserEvent).toHaveBeenCalledWith({
			username: "john",
			...input,
			payload: input.payload
		});
	});

	it("should create a timestamp", async () => {
		const { caller } = prepare();
		const input = {
			type: "USER_LOGIN" as const,
			payload: undefined
		};
		const result = await caller.create(input);
		expect(result).toHaveProperty("createdAt");
	});

	it("should validate correct payloads", async () => {
		const { caller } = prepare();
		const input = {
			type: "ERROR" as const,
			payload: { error: "error", path: "path" }
		};
		const result = await caller.create(input); // could throw an error on validation fail
		// also check manual validation

		const schema = eventDefinitions["ERROR"];
		expect(() => schema.parse(result!.payload)).not.toThrow();
	});
	it("should not pass incorrect payloads", async () => {
		const { caller } = prepare();
		const input = {
			type: "ERROR" as const,
			payload: undefined // ERROR must have a payload
		};
		expect(caller.create(input)).rejects.toThrow();
	});
});
