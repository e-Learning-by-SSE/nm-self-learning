import { render, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FirstLoginDialog } from "settings";
import { trpc } from "@self-learning/api-client";
import userEvent from "@testing-library/user-event";
import { renderHook } from "@testing-library/react";
import { useFirstLoginDialog } from "./first-login-dialog";
import "@testing-library/jest-dom";

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		me: {
			updateSettings: {
				useMutation: jest.fn()
			}
		}
	}
}));

const mockMutateAsync = jest.fn();
(trpc.me.updateSettings.useMutation as jest.Mock).mockReturnValue({
	mutateAsync: mockMutateAsync
});

jest.mock("next-auth/react", () => ({
	useSession: jest.fn().mockReturnValue({ data: { user: { name: "Test User" } } })
}));

describe("FirstLoginDialog", () => {
	it('should set registrationCompleted to true when the user clicks on "Speichern"', async () => {
		const mockOnClose = jest.fn();

		const { getByText } = render(<FirstLoginDialog onClose={mockOnClose} />);

		const saveButton = getByText("Speichern");
		await userEvent.click(saveButton);

		await waitFor(() => {
			expect(mockMutateAsync).toHaveBeenCalledWith({
				user: {
					enabledLearningStatistics: true,
					enabledFeatureLearningDiary: false,
					registrationCompleted: true
				}
			});
		});

		expect(mockOnClose).toHaveBeenCalled();
	});
});

describe("useFirstLoginDialog", () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("should return true and set localStorage when no previous timestamp exists", () => {
		const { result } = renderHook(() => useFirstLoginDialog());

		act(() => {
			jest.advanceTimersByTime(0); // Trigger the effect
		});

		expect(result.current).toBe(true);
		expect(localStorage.getItem("lastRenderTime")).not.toBeNull();
	});

	it("should return false if the last render time is within 24 hours", () => {
		const now = Date.now();
		localStorage.setItem("lastRenderTime", now.toString());

		const { result } = renderHook(() => useFirstLoginDialog());

		act(() => {
			jest.advanceTimersByTime(0); // Trigger the effect
		});

		expect(result.current).toBe(false);
	});

	it("should return true and update localStorage if the last render time is older than 24 hours", () => {
		const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000 - 1; // Slightly more than 24 hours ago
		localStorage.setItem("lastRenderTime", twentyFourHoursAgo.toString());

		const { result } = renderHook(() => useFirstLoginDialog());

		act(() => {
			jest.advanceTimersByTime(0); // Trigger the effect
		});

		expect(result.current).toBe(true);
		const updatedTime = localStorage.getItem("lastRenderTime");
		expect(updatedTime).not.toBeNull();
		expect(parseInt(updatedTime, 10)).toBeGreaterThan(twentyFourHoursAgo);
	});
});
