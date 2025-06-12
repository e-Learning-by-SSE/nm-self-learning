import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { GoalStatusCheckbox } from "./status-checkbox";
import { GoalFormModel } from "../util/types";

describe("GoalStatusCheckbox", () => {
	it("should call onChange when checkbox is clicked and not disabled", async () => {
		const mockOnChange = jest.fn();
		const goal = {
			id: "goal1",
			status: "ACTIVE",
			parentId: undefined
		} as unknown as GoalFormModel;

		render(<GoalStatusCheckbox goal={goal} editable={true} onChange={mockOnChange} />);

		const checkbox = screen.getByTestId(`goal_status:${goal.id}`);
		await userEvent.click(checkbox);

		expect(mockOnChange).toHaveBeenCalledWith(goal);
	});

	it("should not call onChange when checkbox is disabled", async () => {
		const mockOnChange = jest.fn();
		const goal: GoalFormModel = {
			id: "goal2",
			status: "COMPLETED",
			parentId: undefined
		} as unknown as GoalFormModel;

		render(<GoalStatusCheckbox goal={goal} editable={false} onChange={mockOnChange} />);

		const checkbox = screen.getByTestId(`goal_status:${goal.id}`);
		await userEvent.click(checkbox);

		expect(mockOnChange).not.toHaveBeenCalled();
	});
});
