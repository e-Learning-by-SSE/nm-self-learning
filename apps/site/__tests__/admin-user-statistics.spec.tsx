import { render, screen } from "@testing-library/react";
import UserStatisticsPage from "../pages/admin/user-statistics";

const mockQuery = jest.fn();
jest.mock("@self-learning/api-client", () => ({
	trpc: {
		admin: {
			userStatistics: { useQuery: () => mockQuery() }
		}
	}
}));
jest.mock("react-chartjs-2", () => ({ Line: () => <div>Registration chart</div> }));
jest.mock("@self-learning/api", () => ({ withTranslations: jest.fn() }));
jest.mock("@self-learning/ui/layouts", () => ({
	AdminGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	CenteredSection: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
jest.mock("@self-learning/ui/common", () => ({ LoadingBox: () => <div>Loading</div> }));
jest.mock("next/router", () => ({ useRouter: () => ({ locale: "en" }) }));
jest.mock("next-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { date: string }) => (options ? `${key} ${options.date}` : key)
	})
}));

describe("user statistics page", () => {
	it("displays the loading state", () => {
		// Setup
		mockQuery.mockReturnValue({ isLoading: true });

		// Exercise
		render(<UserStatisticsPage />);

		// Verify
		expect(screen.getByText("Loading")).toBeTruthy();
	});

	it("displays the error state", () => {
		// Setup
		mockQuery.mockReturnValue({ isError: true });

		// Exercise
		render(<UserStatisticsPage />);

		// Verify
		expect(screen.getByRole("alert").textContent).toBe("Load_Error");
	});

	it("shows the estimated registration chart and monthly totals", () => {
		// Setup
		mockQuery.mockReturnValue({
			data: {
				today: 1,
				semester: 2,
				year: 3,
				total: 4,
				registrationHistory: [
					{ month: "2026-03", total: 2 },
					{ month: "2026-04", total: 3 }
				],
				trackingStartedAt: new Date("2026-04-01T10:00:00Z")
			}
		});

		// Exercise
		render(<UserStatisticsPage />);

		// Verify
		expect(screen.getByText("Registration chart")).toBeTruthy();
		expect(screen.getByText("Registration_History_Explanation")).toBeTruthy();
		expect(screen.getByText("Mar 2026")).toBeTruthy();
		const chartRegion = screen.getByText("Registration chart").parentElement?.parentElement;
		expect(chartRegion?.getAttribute("tabindex")).toBe("0");
		chartRegion?.focus();
		expect(document.activeElement).toBe(chartRegion);
		const details = screen.getByText("Registration_History_Table").parentElement;
		if (details instanceof HTMLDetailsElement) details.open = true;
		const tableRegion = screen.getByRole("region", { name: "Registration_History_Table" });
		expect(tableRegion.getAttribute("tabindex")).toBe("0");
		tableRegion.focus();
		expect(document.activeElement).toBe(tableRegion);
	});

	it("displays all counts and the tracking start date", () => {
		// Setup
		mockQuery.mockReturnValue({
			data: {
				today: 1,
				semester: 2,
				year: 3,
				total: 4,
				registrationHistory: [],
				trackingStartedAt: new Date("2026-04-01T10:00:00Z")
			}
		});

		// Exercise
		render(<UserStatisticsPage />);

		// Verify
		for (const value of ["1", "2", "3", "4"]) expect(screen.getByText(value)).toBeTruthy();
		expect(screen.getByText("Tracking_Started Apr 1, 2026")).toBeTruthy();
		expect(screen.getByText("Sign_In_Explanation")).toBeTruthy();
	});
});
