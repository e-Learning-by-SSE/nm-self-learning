import { fireEvent, render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useEnrollments } from "@self-learning/enrollment";
import LearningAnalyticsPage from "../pages/learning-analytics";

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

	it("shows student analytics to students", () => {
		mockUser("USER", false);

		render(<LearningAnalyticsPage />);

		expect(screen.getByText("Student analytics")).toBeTruthy();
	});

	it("shows creator analytics to teachers", () => {
		mockUser("USER", true);

		render(<LearningAnalyticsPage />);

		expect(screen.getByText("Creator analytics")).toBeTruthy();
	});

	it("lets enrolled teachers switch between creator and learner analytics", () => {
		mockUser("USER", true);
		mockUseEnrollments.mockReturnValue([
			{
				completedAt: null,
				status: "ACTIVE",
				course: { title: "Test course", slug: "test-course" }
			}
		]);

		render(<LearningAnalyticsPage />);

		expect(screen.getByText("Creator analytics")).toBeTruthy();
		expect(screen.queryByText("Student analytics")).toBeNull();

		fireEvent.click(screen.getByText("My Learning Analytics"));

		expect(screen.getByText("Student analytics")).toBeTruthy();
	});

	it("shows creator analytics to administrators", () => {
		mockUser("ADMIN", false);

		render(<LearningAnalyticsPage />);

		expect(screen.getByText("Creator analytics")).toBeTruthy();
	});
});
