import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useEnrollments } from "@self-learning/enrollment";
import LearningAnalyticsPage from "../pages/learning-analytics";
import userEvent from "@testing-library/user-event";

jest.mock("next-auth/react", () => ({
	useSession: jest.fn()
}));

jest.mock("@self-learning/analysis", () => ({
	StudentAnalytics: () => <div>Student analytics</div>,
	CreatorAnalytics: () => <div>Creator analytics</div>
}));

jest.mock("@self-learning/enrollment", () => ({
	useEnrollments: jest.fn()
}));

jest.mock("next-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) =>
			({
				Creator_Analytics: "Creator Analytics",
				My_Learning_Analytics: "My Learning Analytics"
			})[key] ?? key
	})
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseEnrollments = useEnrollments as jest.MockedFunction<typeof useEnrollments>;

function mockUser(role: "USER" | "ADMIN", isAuthor: boolean) {
	mockUseSession.mockReturnValue({
		data: {
			user: {
				id: "analytics-user-id",
				name: "analytics-user",
				role,
				isAuthor,
				memberships: [],
				featureFlags: {
					learningDiary: false,
					learningStatistics: true,
					experimental: false
				}
			},
			expires: "2099-01-01T00:00:00.000Z"
		},
		status: "authenticated",
		update: jest.fn()
	});
}

describe("LearningAnalyticsPage", () => {
	beforeEach(() => {
		mockUseEnrollments.mockReturnValue([]);
	});

	it("shows student analytics to students which are enrolled in at least one lesson", () => {
		// Setup
		mockUser("USER", false);
		mockUseEnrollments.mockReturnValue([
			{
				completedAt: null,
				status: "ACTIVE",
				course: { title: "Test course", slug: "test-course" }
			}
		]);

		// Exercise
		render(<LearningAnalyticsPage />);

		// Verify
		expect(screen.getByText("Student analytics")).toBeTruthy();
		expect(screen.queryByText("Creator analytics")).toBeNull();
	});

	it("shows startup motivation if student hasn't learning so far", () => {
		// Setup
		mockUser("USER", false);

		// Exercise
		render(<LearningAnalyticsPage />);

		// Verify
		expect(screen.queryByText("Student analytics")).toBeNull();
		expect(screen.queryByText("Creator analytics")).toBeNull();
	});

	it("shows only creator analytics to teachers with no enrollments", () => {
		// Setup
		mockUser("USER", true);

		// Exercise
		render(<LearningAnalyticsPage />);

		// Verify
		expect(screen.getByText("Creator analytics")).toBeTruthy();
		expect(screen.queryByText("Student analytics")).toBeNull();
	});

	it("enrolled teacher has both views", async () => {
		// Setup
		const user = userEvent.setup();
		mockUser("USER", true);
		mockUseEnrollments.mockReturnValue([
			{
				completedAt: null,
				status: "ACTIVE",
				course: { title: "Test course", slug: "test-course" }
			}
		]);

		// Exercise 1
		render(<LearningAnalyticsPage />);

		// Verify 1
		expect(screen.getByText("Creator analytics")).toBeTruthy();
		expect(screen.queryByText("Student analytics")).toBeNull();

		// Exercise 2
		await user.click(screen.getByRole("tab", { name: "My Learning Analytics" }));

		// Verify 2
		expect(screen.getByText("Student analytics")).toBeTruthy();
	});
});
