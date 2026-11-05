import { parse } from "node-html-parser";

const SEMESTER_DATES_URL =
	"https://www.uni-hildesheim.de/termine-fristen/semesterzeiten-in-reintext-zum-barrierefreien-aufruf/";

type DateRange = { startDate: string; endDate: string };

function parseGermanDate(value: string): string | null {
	const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value);
	if (!match) return null;
	const [, day, month, year] = match;
	const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
	if (
		date.getUTCFullYear() !== Number(year) ||
		date.getUTCMonth() !== Number(month) - 1 ||
		date.getUTCDate() !== Number(day)
	)
		return null;
	return date.toISOString().slice(0, 10);
}

/** Returns the lecture dates for the calendar semester containing today in Berlin. */
export function parseCurrentLecturePeriod(html: string, now = new Date()): DateRange | null {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Berlin",
		year: "numeric",
		month: "2-digit"
	}).formatToParts(now);
	const year = Number(parts.find(part => part.type === "year")?.value);
	const month = Number(parts.find(part => part.type === "month")?.value);
	const isSummer = month >= 4 && month <= 9;
	const startYear = month < 4 ? year - 1 : year;
	const semesterStart = `${startYear}-${isSummer ? "04" : "10"}-01`;
	const semesterEnd = isSummer ? `${year}-09-30` : `${startYear + 1}-03-31`;

	const text = parse(html).structuredText.replace(/\u00a0/g, " ");
	const headingPattern =
		/(?:^|\n)\s*(Sommersemester|Wintersemester)\s+(\d{4})(?:\s*\/\s*(\d{2,4}))?\s*(?=\n|$)/gi;
	const headings = [...text.matchAll(headingPattern)];
	const matchingHeadings = headings.filter(heading => {
		const isSummerHeading = heading[1].toLowerCase() === "sommersemester";
		if (isSummerHeading !== isSummer || Number(heading[2]) !== startYear) return false;
		if (isSummer) return !heading[3];
		const followingYear = heading[3];
		return (
			followingYear !== undefined &&
			Number(followingYear) ===
				(followingYear.length === 2 ? (startYear + 1) % 100 : startYear + 1)
		);
	});
	if (matchingHeadings.length !== 1) return null;
	const heading = matchingHeadings[0];
	const headingIndex = heading?.index;
	if (!heading || headingIndex === undefined) return null;
	const headingEnd = headingIndex + heading[0].length;
	const nextHeading = headings.find(
		other => other.index !== undefined && other.index > headingIndex
	);
	const sectionEnd = nextHeading?.index ?? text.length;
	const section = text.slice(headingEnd, sectionEnd);
	const date = "(\\d{1,2}\\.\\d{1,2}\\.\\d{4})";
	const starts = [
		...section.matchAll(
			new RegExp(`${date}\\s*:\\s*Beginn der (?:Vorlesungszeit|Vorlesungen)\\b`, "gi")
		)
	];
	const ends = [
		...section.matchAll(
			new RegExp(`${date}\\s*:\\s*Ende der (?:Vorlesungszeit|Vorlesungen)\\b`, "gi")
		)
	];
	if (starts.length !== 1 || ends.length !== 1) return null;
	const startDate = parseGermanDate(starts[0][1]);
	const endDate = parseGermanDate(ends[0][1]);
	if (
		!startDate ||
		!endDate ||
		startDate > endDate ||
		startDate < semesterStart ||
		endDate > semesterEnd
	)
		return null;
	return { startDate, endDate };
}

export async function getCurrentLecturePeriod(): Promise<DateRange | null> {
	try {
		const response = await fetch(SEMESTER_DATES_URL, { signal: AbortSignal.timeout(5000) });
		if (!response.ok) return null;
		return parseCurrentLecturePeriod(await response.text());
	} catch {
		return null;
	}
}
