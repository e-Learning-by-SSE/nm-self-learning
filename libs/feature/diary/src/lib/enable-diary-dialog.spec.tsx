import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EnableLearningDiaryDialog } from "@self-learning/diary";
import userEvent from "@testing-library/user-event";

describe("EnableLearningDiaryDialog", () => {
	it("should update the toggle when save is pressed", async () => {
		const mockOnSubmit = jest.fn();
		const mockOnClose = jest.fn();

		const { getByText } = render(
			<EnableLearningDiaryDialog onClose={mockOnClose} onSubmit={mockOnSubmit} />
		);

		const activateButton = getByText("Speichern & Aktivieren");
		await userEvent.click(activateButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				learningDiary: true,
				learningStatistics: true
			});
		});
	});

	it("should call onSubmit & onClose when the save button is pressed", async () => {
		const mockOnClose = jest.fn();
		const mockOnSubmit = jest.fn();

		const { getByText } = render(
			<EnableLearningDiaryDialog onClose={mockOnClose} onSubmit={mockOnSubmit} />
		);

		const activateButton = getByText("Speichern & Aktivieren");
		await userEvent.click(activateButton);
		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalled();
			expect(mockOnClose).toHaveBeenCalled();
		});
	});
	it("should not call onSubmit when the dialog is closed", async () => {
		const mockOnClose = jest.fn();
		const mockOnSubmit = jest.fn();

		const { getByTestId } = render(
			<EnableLearningDiaryDialog onClose={mockOnClose} onSubmit={mockOnSubmit} />
		);

		const closeButton = getByTestId("dialog-cancel-button");
		await userEvent.click(closeButton);
		await waitFor(() => {
			expect(mockOnSubmit).not.toHaveBeenCalled();
			expect(mockOnClose).toHaveBeenCalled();
		});
	});
});
