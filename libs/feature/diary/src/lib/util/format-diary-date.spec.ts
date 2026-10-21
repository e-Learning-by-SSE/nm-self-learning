import { formatDiaryDate } from "./format-diary-date";

describe("formatDiaryDate", () => {
	it("formats a serialized server-prop date in the display timezone", () => {
		const timestamp = "2026-10-19T12:34:00.000Z";

		expect(formatDiaryDate(timestamp, "de")).toBe("19.10.2026, 14:34");
		expect(formatDiaryDate(timestamp, "de")).toBe(formatDiaryDate(new Date(timestamp), "de"));
	});
});
