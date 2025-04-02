import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { LearningGoals } from "./learning-goals";
import { IdSet } from "@self-learning/util/common";
import { GoalFormModel } from "../util/types";
import { trpc } from "@self-learning/api-client";

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		learningGoal: {
			editGoal: {
				useMutation: jest.fn()
			}
		}
	}
}));
const mockEditGoal = jest.fn();

(trpc.learningGoal.editGoal.useMutation as jest.Mock).mockReturnValue({
	mutateAsync: mockEditGoal
});

describe("LearningGoals", () => {
	it("should fade from the first tab and appear in the second tab when all goals are solved", async () => {
		// Initial state: Parent goal with two subgoals
		const subGoal1 = { id: "sub1", status: "ACTIVE", children: [] } as unknown as GoalFormModel;
		const subGoal2 = { id: "sub2", status: "ACTIVE", children: [] } as unknown as GoalFormModel;
		const parentGoal = {
			id: "parent",
			status: "ACTIVE",
			children: ["sub1", "sub2"]
		} as GoalFormModel;

		const goals = new IdSet([parentGoal, subGoal1, subGoal2]);

		// Render the component
		render(<LearningGoals goals={goals} />);

		// Verify initial state: Parent goal is in the first tab
		expect(screen.getByText(parentGoal.id)).toBeInTheDocument();
		expect(screen.queryByText("Abgeschlossen")).not.toBeInTheDocument();

		// Solve subGoal1
		const subGoal1Checkbox = screen.getByTestId(`goal_status:${subGoal1.id}`);
		await userEvent.click(subGoal1Checkbox);
		expect(mockEditGoal).toHaveBeenCalledWith({ ...subGoal1, status: "COMPLETED" });

		// Solve subGoal2
		const subGoal2Checkbox = screen.getByTestId(`goal_status:${subGoal2.id}`);
		await userEvent.click(subGoal2Checkbox);
		expect(mockEditGoal).toHaveBeenCalledWith({ ...subGoal2, status: "COMPLETED" });

		// Solve parentGoal
		const parentGoalCheckbox = screen.getByTestId(`goal_status:${parentGoal.id}`);
		await userEvent.click(parentGoalCheckbox);
		expect(mockEditGoal).toHaveBeenCalledWith({ ...parentGoal, status: "COMPLETED" });

		// Verify that the parent goal fades from the first tab
		expect(screen.queryByText(parentGoal.id)).not.toBeInTheDocument();

		// Switch to the second tab
		const secondTab = screen.getByText("Abgeschlossen");
		await userEvent.click(secondTab);

		// Verify that the parent goal appears in the second tab
		expect(screen.getByText(parentGoal.id)).toBeInTheDocument();
	});
});
