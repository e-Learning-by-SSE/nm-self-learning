import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { CreatorAnalytics } from "@self-learning/analysis";

const mockLessons = jest.fn();
const mockPush = jest.fn();
const mockChart = jest.fn();

jest.mock("next/router", () => ({ useRouter: () => ({ push: mockPush, prefetch: jest.fn() }) }));
jest.mock("next-auth/react", () => ({
	useSession: () => ({ data: { user: { name: "Teacher" } }, status: "authenticated" })
}));
jest.mock("next-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { courseLabel?: string }) =>
			options?.courseLabel ? `${key}: ${options.courseLabel}` : key
	})
}));
jest.mock("chart.js/auto", () => ({
	__esModule: true,
	default: jest.fn().mockImplementation(() => mockChart())
}));
jest.mock("@self-learning/api-client", () => ({
	trpc: {
		metrics: {
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
			},
			getAuthorMetric_AverageLessonCompletionRate: {
				useQuery: (...args: unknown[]) => mockLessons(...args)
			}
		}
	}
}));

describe("creator analytics navigation", () => {
	beforeEach(() => {
		mockPush.mockClear();
		mockChart.mockReturnValue({
			destroy: jest.fn(),
			width: 400,
			height: 380,
			chartArea: { top: 20, bottom: 350, right: 390 },
			scales: { y: { left: 0, getValueForPixel: (y: number) => (y < 180 ? 0 : 1) } }
		});
		mockLessons.mockReturnValue({
			data: [
				{
					courseId: "course-1",
					lessonTitle: "Unit One",
					averageCompletionRate: 50,
					usersStarted: 2
				},
				{
					courseId: "course-2",
					lessonTitle: "Unit Two",
					averageCompletionRate: 80,
					usersStarted: 3
				}
			],
			isLoading: false
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
		expect(mockLessons).toHaveBeenLastCalledWith(undefined, { enabled: false });
	});

	it("shows the selected course's units and a return link", async () => {
		render(<CreatorAnalytics courseId="course-2" />);
		expect(
			await screen.findByRole("heading", {
				name: "lessonCompletionRateTitleActive: Course Two"
			})
		).toBeTruthy();
		expect(screen.getAllByText(/Unit Two/)).toBeTruthy();
		expect(screen.queryByText(/Unit One/)).toBeNull();
		expect(screen.getByRole("link", { name: "Back_To_Courses" }).getAttribute("href")).toBe(
			"/learning-analytics"
		);
		expect(mockLessons).toHaveBeenLastCalledWith(undefined, { enabled: true });
	});
});
