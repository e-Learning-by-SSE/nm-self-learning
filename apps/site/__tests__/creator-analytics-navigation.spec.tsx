import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { CreatorAnalytics, TeacherView } from "@self-learning/analysis";

const mockLecturePeriod = jest.fn();
const mockActivity = jest.fn();
const mockPush = jest.fn();
const mockChart = jest.fn();

jest.mock("next/router", () => ({ useRouter: () => ({ push: mockPush, prefetch: jest.fn() }) }));
jest.mock("next-auth/react", () => ({
	useSession: () => ({ data: { user: { name: "Teacher" } }, status: "authenticated" })
}));
jest.mock("next-i18next", () => ({
	useTranslation: () => ({
		i18n: { language: "de" },
		t: (key: string, options?: { courseLabel?: string }) =>
			options?.courseLabel ? `${key}: ${options.courseLabel}` : key
	})
}));
jest.mock("chart.js/auto", () => ({
	__esModule: true,
	default: jest.fn().mockImplementation((...args: unknown[]) => mockChart(...args))
}));
jest.mock("@self-learning/api-client", () => ({
	trpc: {
		metrics: {
			getCurrentLecturePeriod: {
				useQuery: (...args: unknown[]) => mockLecturePeriod(...args)
			},
			getAuthorCourseLessonActivity: {
				useQuery: (...args: unknown[]) => {
					mockActivity(...args);
					return {
						data: {
							courseSlug: "course-two",
							lessonChart: {
								period: [
									{
										lessonId: "one",
										title: "Weekly Unit",
										completionRate: 50,
										averageScore: 75
									},
									{
										lessonId: "two",
										title: "Another Unit",
										completionRate: 100,
										averageScore: 80
									}
								],
								total: [
									{
										lessonId: "one",
										title: "Weekly Unit",
										completionRate: 80,
										averageScore: 90
									},
									{
										lessonId: "two",
										title: "Another Unit",
										completionRate: 60,
										averageScore: 70
									}
								]
							},
							analytics: {
								period: {
									enrollments: 2,
									completedLessons: { min: 1, max: 2, avg: 1.5 }
								},
								total: {
									enrollments: 3,
									completedLessons: { min: 1, max: 3, avg: 2 }
								}
							},
							periods: [{ start: "2026-04-01", end: "2026-04-15" }],
							chapters: [
								{
									title: "Chapter One",
									lessons: [
										{
											lessonId: "one",
											title: "Weekly Unit",
											slug: "weekly-unit",
											periodCompletions: [2],
											totalCompletions: 2
										}
									]
								},
								{
									title: "Chapter Two",
									lessons: [
										{
											lessonId: "two",
											title: "Another Unit",
											slug: "another-unit",
											periodCompletions: [1],
											totalCompletions: 1
										}
									]
								}
							]
						},
						isLoading: false,
						isError: false
					};
				}
			},
			getAuthorMetric_AverageCourseCompletionRate: {
				useQuery: () => ({
					data: [
						{
							courseId: "course-2",
							courseTitle: "Course Two",
							averageCompletionRate: 80,
							averageCompletionRateLastSixMonths: 60,
							enrollmentsLastSixMonths: 2,
							totalEnrollments: 3
						},
						{
							courseId: "course-1",
							courseTitle: "Course One",
							averageCompletionRate: 50,
							averageCompletionRateLastSixMonths: 25,
							enrollmentsLastSixMonths: 1,
							totalEnrollments: 2
						}
					],
					isLoading: false
				})
			}
		}
	}
}));

describe("creator analytics navigation", () => {
	beforeEach(() => {
		mockPush.mockClear();
		mockChart.mockClear();
		mockActivity.mockClear();
		mockLecturePeriod.mockReturnValue({ data: null, isLoading: false });
		mockChart.mockReturnValue({
			destroy: jest.fn(),
			width: 400,
			height: 380,
			chartArea: { top: 20, bottom: 350, right: 390 },
			scales: { y: { left: 0, getValueForPixel: (y: number) => (y < 180 ? 0 : 1) } }
		});
	});

	it("opens a course by clicking its row in the diagram", async () => {
		render(<CreatorAnalytics />);
		expect(
			await screen.findByRole("heading", { name: "courseCompletionRateTitle" })
		).toBeTruthy();
		expect(document.querySelector("#OverviewCard")).toBeNull();
		const rows = within(screen.getByRole("table")).getAllByRole("row");
		expect(rows).toHaveLength(3);
		expect(within(rows[1]).getByRole("link", { name: "Course One" }).getAttribute("href")).toBe(
			"/learning-analytics/courses/course-1"
		);
		expect(rows[1].textContent).toContain("25.0%");
		expect(rows[1].textContent).toContain("50.0%");
		expect(within(rows[2]).getByRole("link", { name: "Course Two" })).toBeTruthy();
		const canvas = document.querySelector("canvas") as HTMLCanvasElement;
		expect(Array.from(canvas.querySelectorAll("a"), link => link.textContent)).toEqual([
			"Course One",
			"Course Two"
		]);
		await waitFor(() => expect(mockChart).toHaveBeenCalled());
		jest.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
			left: 0,
			top: 0,
			width: 400,
			height: 380
		} as DOMRect);
		fireEvent.click(canvas, { clientX: 20, clientY: 220 });
		expect(mockPush).toHaveBeenCalledWith("/learning-analytics/courses/course-2");
		expect(screen.queryByText(/lessonCompletionRateTitleActive/)).toBeNull();
	});

	it("shows the selected course's units and a return link", async () => {
		render(<CreatorAnalytics courseId="course-2" />);
		expect(
			await screen.findByRole("heading", {
				name: "Lesson_Chart_Title: Course Two"
			})
		).toBeTruthy();
		await waitFor(() => expect(mockChart).toHaveBeenCalled());
		const chartOptions = mockChart.mock.lastCall?.[1];
		expect(chartOptions.data.labels).toEqual(["1", "2"]);
		expect(chartOptions.options.plugins.tooltip.callbacks.title([{ dataIndex: 1 }])).toBe(
			"Another Unit"
		);
		const weeklyTable = screen.getAllByRole("table")[1];
		expect(within(weeklyTable).getByText("Weekly Unit")).toBeTruthy();
		const rows = within(weeklyTable).getAllByRole("row");
		expect(rows.slice(1).map(row => row.querySelector("th")?.textContent)).toEqual([
			"Chapter One",
			"Weekly Unit",
			"Chapter Two",
			"Another Unit"
		]);
		expect(within(weeklyTable).getAllByText("2")).toHaveLength(2);
		expect(screen.getByText("Lesson_Semester_Note")).toBeTruthy();
		expect(screen.getByRole("link", { name: "Back_To_Courses" }).getAttribute("href")).toBe(
			"/learning-analytics"
		);
	});

	it("switches the two lesson curves between the selected period and total", async () => {
		render(<CreatorAnalytics courseId="course-2" />);
		const periodButton = screen.getByRole("button", { name: "Analysis_Period" });
		const totalButton = screen.getByRole("button", { name: "Analysis_Total" });
		expect(periodButton.getAttribute("aria-pressed")).toBe("true");
		await waitFor(() =>
			expect(
				mockChart.mock.lastCall?.[1].data.datasets.map(
					(dataset: { data: number[] }) => dataset.data
				)
			).toEqual([
				[50, 100],
				[75, 80]
			])
		);
		fireEvent.click(totalButton);
		expect(totalButton.getAttribute("aria-pressed")).toBe("true");
		await waitFor(() =>
			expect(
				mockChart.mock.lastCall?.[1].data.datasets.map(
					(dataset: { data: number[] }) => dataset.data
				)
			).toEqual([
				[80, 60],
				[90, 70]
			])
		);
	});

	it("uses lecture dates as defaults and preserves a manually selected range", () => {
		mockLecturePeriod.mockReturnValue({
			data: { startDate: "2026-10-19", endDate: "2027-02-05" },
			isLoading: false
		});
		const { rerender } = render(<CreatorAnalytics courseId="course-2" />);
		const start = screen.getByLabelText("Date_Range_From") as HTMLInputElement;
		const end = screen.getByLabelText("Date_Range_To") as HTMLInputElement;
		expect(start.value).toBe("2026-10-19");
		expect(end.value).toBe("2027-02-05");
		fireEvent.change(start, { target: { value: "2026-10-01" } });
		mockLecturePeriod.mockReturnValue({
			data: { startDate: "2026-10-20", endDate: "2027-02-06" },
			isLoading: false
		});
		rerender(<CreatorAnalytics courseId="course-2" />);
		expect(start.value).toBe("2026-10-01");
		expect(end.value).toBe("2027-02-05");
		expect(mockActivity).toHaveBeenLastCalledWith(
			{ courseId: "course-2", startDate: "2026-10-01", endDate: "2027-02-05" },
			{ enabled: true }
		);
	});

	it("waits for the lookup and falls back to the calendar semester", () => {
		jest.useFakeTimers().setSystemTime(new Date("2027-01-15T12:00:00Z"));
		try {
			mockLecturePeriod.mockReturnValue({ data: undefined, isLoading: true });
			const { rerender } = render(<CreatorAnalytics courseId="course-2" />);
			expect(screen.getByText("loadingSession")).toBeTruthy();
			expect(mockActivity).toHaveBeenLastCalledWith(expect.anything(), { enabled: false });
			mockLecturePeriod.mockReturnValue({ data: null, isLoading: false });
			rerender(<CreatorAnalytics courseId="course-2" />);
			expect((screen.getByLabelText("Date_Range_From") as HTMLInputElement).value).toBe(
				"2026-10-01"
			);
			expect((screen.getByLabelText("Date_Range_To") as HTMLInputElement).value).toBe(
				"2027-03-31"
			);
			expect(mockActivity).toHaveBeenLastCalledWith(
				{ courseId: "course-2", startDate: "2026-10-01", endDate: "2027-03-31" },
				{ enabled: true }
			);
		} finally {
			jest.useRealTimers();
		}
	});

	it("shows the same course metrics and completion note in the author dashboard", () => {
		render(<TeacherView />);
		const rows = within(screen.getByRole("table")).getAllByRole("row");
		expect(rows).toHaveLength(3);
		expect(within(rows[1]).getByRole("link", { name: "Course One" }).getAttribute("href")).toBe(
			"/learning-analytics/courses/course-1"
		);
		expect(rows[1].textContent).toContain("25.0%");
		expect(rows[1].textContent).toContain("50.0%");
		expect(screen.getByText("Courses_Table_Completion_Note")).toBeTruthy();
	});
});
