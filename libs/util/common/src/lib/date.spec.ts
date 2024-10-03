import { formatSeconds, formatTimeIntervalToString } from "./date";

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

describe("formatTimeIntervalToString", () => {
	test.each([
		[60000, "1 Minute"],
		[120000, "2 Minuten"],
		[3600000, "1 Stunde"],
		[7200000, "2 Stunden"],
		[86400000, "1 Tag"],
		[90000000, "1 Tag und 1 Stunde"],
		[93600000, "1 Tag und 2 Stunden"],
		[129600000, "1 Tag und 12 Stunden"],
		[86400000 + 3600000 + 60000, "1 Tag und 1 Stunde und 1 Minute"],
		[129600000 + 120000, "1 Tag und 12 Stunden und 2 Minuten"]
	])("%s -> %s", (ms: number, expected: string) => {
		expect(formatTimeIntervalToString(ms)).toBe(expected);
	});
});
