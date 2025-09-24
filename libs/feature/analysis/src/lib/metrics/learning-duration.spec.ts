import { minutesToMilliseconds } from "date-fns";
import { computeTotalDuration } from "./learning-duration";

describe("computeTotalDuration", () => {
	it("should return 0 for an empty array", () => {
		expect(computeTotalDuration([])).toBe(0);
	});

	it("should return 0 for a single event", () => {
		const events = [{ createdAt: new Date("2023-01-01T10:00:00Z"), resourceId: "A" }];
		expect(computeTotalDuration(events)).toBe(0);
	});

	it("should compute total duration correctly for multiple events with same resource", () => {
		const events = [
			{ createdAt: new Date("2023-01-01T10:00:00Z"), resourceId: "A" },
			{ createdAt: new Date("2023-01-01T10:05:00Z"), resourceId: "A" },
			{ createdAt: new Date("2023-01-01T10:10:00Z"), resourceId: "A" }
		];
		expect(computeTotalDuration(events)).toBe(minutesToMilliseconds(10));
	});

	it("should compute total duration correctly for multiple events with different resources", () => {
		const events = [
			{ createdAt: new Date("2023-01-01T10:00:00Z"), resourceId: "A" },
			{ createdAt: new Date("2023-01-01T10:05:00Z"), resourceId: "A" },
			{ createdAt: new Date("2023-01-01T10:10:00Z"), resourceId: "A" },
			{ createdAt: new Date("2023-01-01T10:10:00Z"), resourceId: "B" },
			{ createdAt: new Date("2023-01-01T10:15:00Z"), resourceId: "B" }
		];
		expect(computeTotalDuration(events)).toBe(minutesToMilliseconds(15));
	});

	it("should handle pauses between resource changes", () => {
		const events = [
			{ createdAt: new Date("2023-01-01T10:00:00Z"), resourceId: "A" },
			{ createdAt: new Date("2023-01-01T10:05:00Z"), resourceId: "A" },
			// 5 Minutes on A
			{ createdAt: new Date("2023-01-01T10:10:00Z"), resourceId: "B" },
			{ createdAt: new Date("2023-01-01T10:15:00Z"), resourceId: "B" },
			// 5 Minutes on B, pause for 5 minutes
			{ createdAt: new Date("2023-01-01T10:20:00Z"), resourceId: "A" },
			{ createdAt: new Date("2023-01-01T10:25:00Z"), resourceId: "A" }
			// 5 Minutes on A again, total should be 15 minutes during 25 minutes
		];
		expect(computeTotalDuration(events)).toBe(minutesToMilliseconds(15));
	});

	it("should handle dangling events", () => {
		const events = [
			{ createdAt: new Date("2023-01-01T10:00:00Z"), resourceId: "A" },
			{ createdAt: new Date("2023-01-01T10:05:00Z"), resourceId: "A" },
			// 5 Minutes on A
			{ createdAt: new Date("2023-01-01T10:10:00Z"), resourceId: "B" },
			{ createdAt: new Date("2023-01-01T10:15:00Z"), resourceId: "B" },
			// 5 Minutes on B, pause for 5 minutes
			{ createdAt: new Date("2023-01-01T10:20:00Z"), resourceId: "A" }
			// 0 Minutes on A again (single event), total should be 10 minutes during 20 minutes
		];
		expect(computeTotalDuration(events)).toBe(minutesToMilliseconds(10));
	});
});
