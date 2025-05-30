import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { LearningGoals } from "./learning-goals";
import { IdSet } from "@self-learning/util/common";
import { GoalFormModel } from "../util/types";

// Initial state: Parent goal with two subgoals
const subGoal1 = {
	id: "sub1",
	description: "name1",
	status: "ACTIVE",
	children: [],
	parentId: "parent"
} as unknown as GoalFormModel;
const subGoal2 = {
	id: "sub2",
	description: "name2",
	status: "ACTIVE",
	children: [],
	parentId: "parent"
} as unknown as GoalFormModel;
const parentGoal = {
	id: "parent",
	description: "nameParent",
	status: "ACTIVE",
	children: ["sub1", "sub2"]
} as GoalFormModel;

let goals = new IdSet([parentGoal, subGoal1, subGoal2]);

// Mock learningGoal trpc
const mockEditGoal = jest.fn(async (updatedGoal: GoalFormModel) => {
	// Simulate an API call delay
	await new Promise(resolve => setTimeout(resolve, 50));
	goals = new IdSet(
		goals.values().map(goal => (goal.id === updatedGoal.id ? updatedGoal : goal))
	);
	//
	return updatedGoal;
});

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		learningGoal: {
			editGoal: {
				useMutation: jest.fn(() => ({
					mutateAsync: mockEditGoal
				}))
			},
			deleteGoal: {
				useMutation: jest.fn(() => ({
					mutateAsync: jest.fn() // Just a stub for now TODO new tests
				}))
			}
		}
	}
}));

// Reset goals before each test to ensure a clean state
beforeEach(() => {
	goals = new IdSet([parentGoal, subGoal1, subGoal2]);
	// Reset mocks to clear any previous calls
	jest.clearAllMocks();
});

describe("LearningGoals", () => {
	it("should fade from the first tab and appear in the second tab when all goals are solved", async () => {
		// Render the component
		const { rerender } = render(<LearningGoals goals={goals} />);

		// Wait for the initial goals to load and be displayed
		await waitFor(() => {
			expect(screen.getByText(parentGoal.description)).toBeInTheDocument();
			expect(screen.getByText(subGoal1.description)).toBeInTheDocument();
			expect(screen.getByText(subGoal2.description)).toBeInTheDocument();
		});

		// Solve subGoal1
		const subGoal1Checkbox = screen.getByTestId(`goal_status:${subGoal1.id}`);
		await userEvent.click(subGoal1Checkbox);
		await waitFor(() => {
			const updatedGoal = goals.get(subGoal1.id);
			expect(updatedGoal?.status).toBe("COMPLETED"); // ensure goals IdSet is updated to update UI correctly
			expect(mockEditGoal).toHaveBeenCalledWith({ ...subGoal1, status: "COMPLETED" });
		});
		rerender(<LearningGoals goals={goals} />);

		// Solve subGoal2
		const subGoal2Checkbox = screen.getByTestId(`goal_status:${subGoal2.id}`);
		await userEvent.click(subGoal2Checkbox);
		await waitFor(() => {
			const updatedGoal = goals.get(subGoal2.id);
			expect(updatedGoal?.status).toBe("COMPLETED"); // ensure goals IdSet is updated to update UI correctly
			expect(mockEditGoal).toHaveBeenCalledWith({ ...subGoal2, status: "COMPLETED" });
		});
		rerender(<LearningGoals goals={goals} />);

		// Solve parentGoal
		const parentGoalCheckbox = screen.getByTestId(`goal_status:${parentGoal.id}`);
		await userEvent.click(parentGoalCheckbox);
		await waitFor(() => {
			const updatedGoal = goals.get(parentGoal.id);
			expect(updatedGoal?.status).toBe("COMPLETED"); // ensure goals IdSet is updated to update UI correctly
			expect(mockEditGoal).toHaveBeenCalledWith({ ...parentGoal, status: "COMPLETED" });
		});
		rerender(<LearningGoals goals={goals} />);
		// screen.debug(undefined, Infinity);

		// Verify that the parent goal fades from the first tab
		expect(screen.queryByText(parentGoal.description)).not.toBeInTheDocument();

		// Switch to the second tab
		const secondTab = screen.getByText("Abgeschlossen");
		await userEvent.click(secondTab);

		// Verify that the parent goal appears in the second tab
		expect(screen.getByText(parentGoal.description)).toBeInTheDocument();
		expect(screen.getByText(subGoal1.description)).toBeInTheDocument();
		expect(screen.getByText(subGoal2.description)).toBeInTheDocument();
	});
});
