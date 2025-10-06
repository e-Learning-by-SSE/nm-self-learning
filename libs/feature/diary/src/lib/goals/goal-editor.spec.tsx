import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditGoalDialog } from "./goal-editor";
import "@testing-library/jest-dom";
import { GoalFormModel } from "../util/types";

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		learningGoal: {
			getAll: {
				useQuery: jest.fn(() => ({ data: [], isLoading: false }))
			},
			editGoal: { useMutation: jest.fn(() => ({ mutateAsync: jest.fn() })) },
			editSubGoal: { useMutation: jest.fn(() => ({ mutateAsync: jest.fn() })) },
			createGoal: { useMutation: jest.fn(() => ({ mutateAsync: jest.fn() })) },
			createSubGoal: { useMutation: jest.fn(() => ({ mutateAsync: jest.fn() })) },
			createGoalFromSubGoal: { useMutation: jest.fn(() => ({ mutateAsync: jest.fn() })) }
		}
	}
}));

describe("EditGoalDialog", () => {
	beforeAll(() => {
		global.ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	});

	it("should update the description state when the user types in the textarea", async () => {
		const mockOnClose = jest.fn();
		const mockOnSubmit = jest.fn();
		const mockGoal = {
			id: "goal1",
			description: "Old Description",
			status: "ACTIVE",
			children: []
		} as unknown as GoalFormModel;

		render(<EditGoalDialog goal={mockGoal} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

		// Verify the initial description is rendered
		const descriptionTextarea = screen.getByRole("textbox");
		expect(descriptionTextarea).toHaveValue("Old Description");

		// Simulate user typing a new description
		await userEvent.clear(descriptionTextarea);
		await userEvent.type(descriptionTextarea, "New Description");

		// Verify the updated description in the textarea
		expect(descriptionTextarea).toHaveValue("New Description");

		// Simulate clicking the save button
		const saveButton = screen.getByRole("button", { name: "Speichern" });
		await userEvent.click(saveButton);

		// Verify the onSubmit function was called with the updated description
		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				...mockGoal,
				description: "New Description"
			});
		});

		// Verify the dialog is closed after saving
		expect(mockOnClose).toHaveBeenCalled();
	});
});
