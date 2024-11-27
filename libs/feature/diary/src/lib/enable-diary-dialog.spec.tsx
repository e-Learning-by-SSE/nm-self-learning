import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EnableLearningDiaryDialog } from "./enable-diary-dialog";

describe("EnableLearningDiaryDialog", () => {
	it("should update the toggle when save is pressed", async () => {
		const mockOnSubmit = jest.fn();
		const mockOnClose = jest.fn();

		const { getByText } = render(
			<EnableLearningDiaryDialog onClose={mockOnClose} onSubmit={mockOnSubmit} />
		);

		const activateButton = getByText("Speichern & Aktivieren");
		fireEvent.click(activateButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				enabledLearningStatistics: true,
				enabledFeatureLearningDiary: true
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
		fireEvent.click(activateButton);

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
