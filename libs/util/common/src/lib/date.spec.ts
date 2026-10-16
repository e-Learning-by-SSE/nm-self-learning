import { readFileSync } from "fs";
import { createInstance } from "i18next";
import { resolve } from "path";
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
	const i18n = createInstance();

	beforeAll(async () => {
		const localesPath = resolve(__dirname, "../../../../../apps/site/public/locales");
		await i18n.init({
			lng: "de",
			fallbackLng: "de",
			defaultNS: "common",
			interpolation: { escapeValue: false },
			resources: {
				de: {
					common: JSON.parse(readFileSync(resolve(localesPath, "de/common.json"), "utf8"))
				},
				en: {
					common: JSON.parse(readFileSync(resolve(localesPath, "en/common.json"), "utf8"))
				},
				pl: {
					common: {
						Duration_Minute_one: "{{count, number}} minuta",
						Duration_Minute_few: "{{count, number}} minuty",
						Duration_Minute_many: "{{count, number}} minut",
						Duration_List: "{{parts, list}}"
					}
				}
			}
		});
	});

	test.each([
		[0, "0 Minuten"],
		[59000, "0 Minuten"],
		[60000, "1 Minute"],
		[120000, "2 Minuten"],
		[3600000, "1 Stunde"],
		[7200000, "2 Stunden"],
		[86400000, "1 Tag"],
		[90000000, "1 Tag und 1 Stunde"],
		[93600000, "1 Tag und 2 Stunden"],
		[129600000, "1 Tag und 12 Stunden"],
		[86400000 + 3600000 + 60000, "1 Tag, 1 Stunde und 1 Minute"],
		[129600000 + 120000, "1 Tag, 12 Stunden und 2 Minuten"]
	])("%s -> %s", (ms: number, expected: string) => {
		expect(formatTimeIntervalToString(ms, i18n.getFixedT("de", "common"))).toBe(expected);
	});

	test.each([
		[0, "0 minutes"],
		[60000, "1 minute"],
		[120000, "2 minutes"],
		[3661000, "1 hour and 1 minute"],
		[90060000, "1 day, 1 hour, and 1 minute"]
	])("formats %s in English as %s", (ms: number, expected: string) => {
		expect(formatTimeIntervalToString(ms, i18n.getFixedT("en", "common"))).toBe(expected);
	});

	test.each([
		[1, "1 minuta"],
		[2, "2 minuty"],
		[5, "5 minut"],
		[12, "12 minut"],
		[22, "22 minuty"]
	])("supports additional plural forms: %s -> %s", (minutes: number, expected: string) => {
		expect(formatTimeIntervalToString(minutes * 60000, i18n.getFixedT("pl", "common"))).toBe(
			expected
		);
	});
});
