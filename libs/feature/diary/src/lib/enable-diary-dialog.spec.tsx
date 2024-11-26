import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EnableLearningDiaryDialog } from "./enable-diary-dialog";
import { trpc } from "@self-learning/api-client";

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

describe("EnableLearningDiaryDialog", () => {
	it('should update the toggle when "Lerntagebuch aktivieren" is pressed', async () => {
		const mockOnClose = jest.fn();

		const { getByText } = render(
			<EnableLearningDiaryDialog onClose={mockOnClose} onSubmit={() => {}} />
		);

		const activateButton = getByText("Lerntagebuch aktivieren");
		fireEvent.click(activateButton);

		await waitFor(() => {
			expect(mockMutateAsync).toHaveBeenCalledWith({
				user: {
					enabledLearningStatistics: true,
					enabledFeatureLearningDiary: true
				}
			});
		});

		expect(mockOnClose).toHaveBeenCalled();
	});

	it('should call onSubmit when the "Lerntagebuch aktivieren" button is pressed', async () => {
		const mockOnClose = jest.fn();
		const mockOnSubmit = jest.fn();

		const { getByText } = render(
			<EnableLearningDiaryDialog onClose={mockOnClose} onSubmit={mockOnSubmit} />
		);

		const activateButton = getByText("Lerntagebuch aktivieren");
		fireEvent.click(activateButton);

		await waitFor(() => {
			expect(mockMutateAsync).toHaveBeenCalledWith({
				user: {
					enabledLearningStatistics: true,
					enabledFeatureLearningDiary: true
				}
			});
		});

		expect(mockOnSubmit).toHaveBeenCalled();
		expect(mockOnClose).toHaveBeenCalled();
	});
	it("should not call onSubmit when the dialog is closed", () => {
		const mockOnClose = jest.fn();
		const mockOnSubmit = jest.fn();

		const { getByText } = render(
			<EnableLearningDiaryDialog onClose={mockOnClose} onSubmit={mockOnSubmit} />
		);

		const closeButton = getByText("Abbrechen");
		fireEvent.click(closeButton);

		expect(mockOnSubmit).not.toHaveBeenCalled();
		expect(mockOnClose).toHaveBeenCalled();
	});
});
