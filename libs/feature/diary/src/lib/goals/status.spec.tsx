import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GoalStatus } from "./status";
import { LearningGoalStatus } from "@prisma/client";
import { Goal } from "../util/types";
import userEvent from "@testing-library/user-event";

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		learningGoal: {
			editSubGoalStatus: {
				useMutation: jest.fn().mockReturnValue({
					mutateAsync: jest.fn()
				})
			},
			editGoalStatus: {
				useMutation: jest.fn().mockReturnValue({
					mutateAsync: jest.fn()
				})
			}
		}
	}
}));

describe("GoalStatus", () => {
	it("No sub goals, mark as completed -> goal completed", async () => {
		const mockOnChange = jest.fn();
		const goal = {
			id: "1",
			status: LearningGoalStatus.INACTIVE,
			learningSubGoals: []
		} as unknown as Goal;

		render(<GoalStatus goal={goal} editable={true} onChange={mockOnChange} />);

		// Simulate clicking the first buttons
		const button = await screen.findByTestId(`goal_status:${goal.id}`);
		// INACTIVE -> ACTIVE
		await userEvent.click(button);

		// ACTIVE -> COMPLETED
		await userEvent.click(button);

		// Check if the onChange function was called with the correct arguments
		expect(mockOnChange).toHaveBeenCalledWith(goal, LearningGoalStatus.COMPLETED);
	});

	it("Incomplete sub goals -> goal cannot be completed", async () => {
		const mockOnChange = jest.fn();
		const goal = {
			id: "1",
			status: LearningGoalStatus.INACTIVE,
			learningSubGoals: [
				{ id: "sub1", status: LearningGoalStatus.ACTIVE },
				{ id: "sub2", status: LearningGoalStatus.COMPLETED }
			]
		} as unknown as Goal;

		render(<GoalStatus goal={goal} editable={true} onChange={mockOnChange} />);

		// Simulate clicking the first button
		const button = await screen.findByTestId(`goal_status:${goal.id}`);
		// INACTIVE -> ACTIVE
		await userEvent.click(button);
		// ACTIVE -> INACTIVE
		await userEvent.click(button);

		// Check that goal was NOT completed
		expect(mockOnChange).not.toHaveBeenCalledWith(goal, LearningGoalStatus.COMPLETED);
	});
});
