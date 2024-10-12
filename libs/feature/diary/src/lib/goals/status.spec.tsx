import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GoalStatus } from "./status";
import { LearningGoalStatus } from "@prisma/client";
import { Goal } from "../util/types";

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
	it("status-button should open status menu when all sub-goals are completed", async () => {
		const mockOnChange = jest.fn();
		const goal = {
			id: "1",
			status: LearningGoalStatus.INACTIVE,
			learningSubGoals: []
		} as unknown as Goal;

		render(<GoalStatus goal={goal} editable={true} onChange={mockOnChange} />);

		// Simulate clicking the first buttons
		const button = screen.getByTestId("status-button");
		fireEvent.click(button);

		// Simulate clicking the "INACTIVE" status button
		const inactiveButton = screen.getByTitle("Bearbeitet");
		fireEvent.click(inactiveButton);

		// Check if the onChange function was called with the correct arguments
		expect(mockOnChange).toHaveBeenCalledWith(goal, LearningGoalStatus.COMPLETED);
	});
	it("status-button should not be clickable when there are sub-goals that are not COMPLETED", async () => {
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
		const button = screen.getByTestId("status-button");
		fireEvent.click(button);

		// Check if the message is displayed
		const message = screen.getByText("Feinziele müssen Bearbeitet sein");
		expect(message).toBeInTheDocument();
	});
});
