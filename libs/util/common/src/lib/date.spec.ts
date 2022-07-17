import { formatSeconds } from "./date";

describe("formatSeconds", () => {
	test.each([
		[1, "0:01"],
		[60, "1:00"],
		[142, "2:22"],
		[3600, "1:00:00"],
		[36000, "10:00:00"]
	])("%s -> %s", (seconds: number, expected: string) => {
		expect(formatSeconds(seconds)).toBe(expected);
	});
});
