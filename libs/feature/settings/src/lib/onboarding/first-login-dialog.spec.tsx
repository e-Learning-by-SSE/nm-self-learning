import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FirstLoginDialog } from "settings";
import { trpc } from "@self-learning/api-client";
import userEvent from "@testing-library/user-event";

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
