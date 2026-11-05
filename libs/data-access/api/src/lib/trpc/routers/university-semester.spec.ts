import { getCurrentLecturePeriod, parseCurrentLecturePeriod } from "./university-semester";

const semesterPage = `
<h2>Sommersemester 2026</h2>
<p>Di, 07.04.2026: Beginn der Vorlesungszeit (erste Woche: nur Einführungstage)</p>
<p>Fr, 17.07.2026: Ende der Vorlesungen</p>
<h2>Wintersemester 2026/27</h2>
<p>Semesterzeit: 01.10.2026 – 31.03.2027</p>
<p>Mo, 19.10.2026: Beginn der Vorlesungszeit</p>
<p>Fr, 05.02.2027: Ende der Vorlesungen</p>
<h2>Sommersemester 2027</h2>
<p>Mo, 05.04.2027: Beginn der Vorlesungszeit</p>
<p>Fr, 16.07.2027: Ende der Vorlesungszeit</p>`;

describe("university lecture dates", () => {
	it("selects the calendar semester even outside the lecture period", () => {
		expect(parseCurrentLecturePeriod(semesterPage, new Date("2027-03-20T12:00:00Z"))).toEqual({
			startDate: "2026-10-19",
			endDate: "2027-02-05"
		});
		expect(parseCurrentLecturePeriod(semesterPage, new Date("2027-04-01T12:00:00Z"))).toEqual({
			startDate: "2027-04-05",
			endDate: "2027-07-16"
		});
	});

	it("accepts both labels for the start of lectures", () => {
		const page = semesterPage.replace(
			"Mo, 19.10.2026: Beginn der Vorlesungszeit",
			"Mo, 19.10.2026: Beginn der Vorlesungen"
		);
		expect(parseCurrentLecturePeriod(page, new Date("2026-11-05T12:00:00Z"))).toEqual({
			startDate: "2026-10-19",
			endDate: "2027-02-05"
		});
	});

	it("uses Berlin's date at the semester boundary", () => {
		expect(parseCurrentLecturePeriod(semesterPage, new Date("2027-03-31T22:30:00Z"))).toEqual({
			startDate: "2027-04-05",
			endDate: "2027-07-16"
		});
	});

	it("rejects missing, invalid, ambiguous and out-of-semester dates", () => {
		const now = new Date("2026-11-05T12:00:00Z");
		expect(parseCurrentLecturePeriod("<h2>Sommersemester 2026</h2>", now)).toBeNull();
		expect(
			parseCurrentLecturePeriod(semesterPage.replace("05.02.2027", "31.02.2027"), now)
		).toBeNull();
		expect(
			parseCurrentLecturePeriod(semesterPage.replace("05.02.2027", "05.04.2027"), now)
		).toBeNull();
		expect(
			parseCurrentLecturePeriod(
				semesterPage.replace(
					"Fr, 05.02.2027: Ende",
					"Fr, 05.02.2027: Ende der Vorlesungen</p><p>Fr, 12.02.2027: Ende"
				),
				now
			)
		).toBeNull();
	});

	it("falls back when the page cannot be fetched or is not successful", async () => {
		const fetchSpy = jest.spyOn(globalThis, "fetch");
		try {
			fetchSpy.mockRejectedValueOnce(new Error("unavailable"));
			expect(await getCurrentLecturePeriod()).toBeNull();
			fetchSpy.mockResolvedValueOnce({ ok: false } as Response);
			expect(await getCurrentLecturePeriod()).toBeNull();
		} finally {
			fetchSpy.mockRestore();
		}
	});

	it("reads the current lecture period from a successful response", async () => {
		jest.useFakeTimers().setSystemTime(new Date("2026-11-05T12:00:00Z"));
		const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue({
			ok: true,
			text: async () => semesterPage
		} as Response);
		try {
			expect(await getCurrentLecturePeriod()).toEqual({
				startDate: "2026-10-19",
				endDate: "2027-02-05"
			});
		} finally {
			fetchSpy.mockRestore();
			jest.useRealTimers();
		}
	});
});
