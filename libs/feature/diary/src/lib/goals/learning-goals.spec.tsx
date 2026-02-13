import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { LearningGoals } from "./learning-goals";
import { IdSet } from "@self-learning/util/common";
import { GoalFormModel } from "../util/types";

// Initial state: Parent goal with two sub goals
const subGoal1 = {
	id: "sub1",
	description: "name1",
	status: "ACTIVE",
	children: [],
	parentId: "parent",
	order: 0
} as unknown as GoalFormModel;
const subGoal2 = {
	id: "sub2",
	description: "name2",
	status: "ACTIVE",
	children: [],
	parentId: "parent",
	order: 1
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
	await new Promise(resolve => setTimeout(resolve, 10));
	goals = new IdSet(
		goals
			.values()
			.map(goal => (goal.id === updatedGoal.id ? { ...goal, ...updatedGoal } : goal))
	);
	//
	const updatedGoalParentId = goals.get(updatedGoal.id)?.parentId;

	// If the updated goal has a parent, update the parent's children array to match the sorted order of its children
	if (updatedGoalParentId) {
		const parent = goals.get(updatedGoalParentId);
		if (parent) {
			const children = goals
				.values()
				.filter(g => g.parentId === parent.id)
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
			const sortedChildIds = children.map(child => child.id);
			goals = new IdSet(
				goals
					.values()
					.map(goal =>
						goal.id === parent.id ? { ...goal, children: sortedChildIds } : goal
					)
			);
		}
	}
	return updatedGoal;
});

const mockDeleteGoal = jest.fn(async ({ goalId }: { goalId: string }) => {
	goals = new IdSet(goals.values().filter(goal => goal.id !== goalId));
	return { goalId };
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
					mutateAsync: mockDeleteGoal
				}))
			}
		}
	}
}));

const mockShowToast = jest.fn();

jest.mock("@self-learning/ui/common", () => {
	// require only stuff which does not trigger circular dependency error
	const { Tab, Tabs, SectionHeader } = jest.requireActual("@self-learning/ui/common");

	return {
		showToast: jest.fn(args => mockShowToast(args)),
		ButtonActions: () => <div data-testid="button-actions" />,
		Dialog: () => <div data-testid="dialog" />,
		IconOnlyButton: () => <button data-testid="icon-only-button" />,
		LoadingBox: () => <div data-testid="loading-box" />,
		DialogHandler: () => <div data-testid="dialog-handler" />,
		dispatchDialog: jest.fn(),
		freeDialog: jest.fn(),
		SimpleDialog: () => <div data-testid="simple-dialog" />,
		Tab,
		Tabs,
		SectionHeader
	};
});

// Reset goals before each test to ensure a clean state
beforeEach(() => {
	goals = new IdSet([parentGoal, subGoal1, subGoal2]);
	jest.clearAllMocks();
});

describe("LearningGoals", () => {
	it("should update sub-goal status to COMPLETED when checked", async () => {
		const { rerender } = render(<LearningGoals goals={goals} />);

		// Wait for initial render
		await waitFor(() => {
			expect(screen.getByText(parentGoal.description)).toBeInTheDocument();
			expect(screen.getByText(subGoal1.description)).toBeInTheDocument();
			expect(screen.getByText(subGoal2.description)).toBeInTheDocument();
		});

		// Complete subGoal1
		const subGoal1Checkbox = screen.getByTestId(`goal_status:${subGoal1.id}`);
		await userEvent.click(subGoal1Checkbox);
		await waitFor(() => {
			const updatedGoal = goals.get(subGoal1.id);
			expect(updatedGoal?.status).toBe("COMPLETED");
			expect(mockEditGoal).toHaveBeenCalledWith({ ...subGoal1, status: "COMPLETED" });
		});
		rerender(<LearningGoals goals={goals} />);

		// Complete subGoal2
		const subGoal2Checkbox = screen.getByTestId(`goal_status:${subGoal2.id}`);
		await userEvent.click(subGoal2Checkbox);
		await waitFor(() => {
			const updatedGoal = goals.get(subGoal2.id);
			expect(updatedGoal?.status).toBe("COMPLETED");
			expect(mockEditGoal).toHaveBeenCalledWith({ ...subGoal2, status: "COMPLETED" });
		});
	});
	it("should update parent goal status to COMPLETED when checked", async () => {
		const { rerender } = render(<LearningGoals goals={goals} />);

		// Solve subGoals
		const subGoal1Checkbox = screen.getByTestId(`goal_status:${subGoal1.id}`);
		await userEvent.click(subGoal1Checkbox);
		const subGoal2Checkbox = screen.getByTestId(`goal_status:${subGoal2.id}`);
		await userEvent.click(subGoal2Checkbox);
		await waitFor(() => {
			const updatedGoal1 = goals.get(subGoal1.id);
			expect(updatedGoal1?.status).toBe("COMPLETED"); // ensure goals IdSet is updated to update UI correctly
			expect(mockEditGoal).toHaveBeenCalledWith(
				expect.objectContaining({ id: subGoal1.id, status: "COMPLETED" })
			);

			const updatedGoal2 = goals.get(subGoal2.id);
			expect(updatedGoal2?.status).toBe("COMPLETED"); // ensure goals IdSet is updated to update UI correctly
			expect(mockEditGoal).toHaveBeenCalledWith(
				expect.objectContaining({ id: subGoal2.id, status: "COMPLETED" })
			);
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
	});

	it("should hide completed parent goal from first tab and show in completed tab", async () => {
		const { rerender } = render(<LearningGoals goals={goals} />);

		// Complete all goals
		const subGoal1Checkbox = screen.getByTestId(`goal_status:${subGoal1.id}`);
		await userEvent.click(subGoal1Checkbox);
		const subGoal2Checkbox = screen.getByTestId(`goal_status:${subGoal2.id}`);
		await userEvent.click(subGoal2Checkbox);
		// ensure goals IdSet is updated to update UI correctly
		await waitFor(() => {
			const updatedGoal1 = goals.get(subGoal1.id);
			expect(updatedGoal1?.status).toBe("COMPLETED");
			const updatedGoal2 = goals.get(subGoal2.id);
			expect(updatedGoal2?.status).toBe("COMPLETED");
		});
		rerender(<LearningGoals goals={goals} />);
		const parentGoalCheckbox = screen.getByTestId(`goal_status:${parentGoal.id}`);
		await userEvent.click(parentGoalCheckbox);
		// ensure goals IdSet is updated to update UI correctly
		await waitFor(() => {
			const updatedGoal = goals.get(parentGoal.id);
			expect(updatedGoal?.status).toBe("COMPLETED");
		});
		rerender(<LearningGoals goals={goals} />);

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

	it("shows message when there are no goals", async () => {
		const emptyGoals = new IdSet([]);
		render(<LearningGoals goals={emptyGoals} />);
		expect(screen.getByText("Derzeit ist kein Ziel erstellt worden.")).toBeInTheDocument();
		const secondTab = screen.getByText("Abgeschlossen");
		await userEvent.click(secondTab);
		expect(screen.getByText("Derzeit ist kein Ziel abgeschlossen.")).toBeInTheDocument();
	});

	it("shows only completed goals in the completed tab", async () => {
		const completedGoal = {
			id: "g1",
			description: "Completed Goal",
			status: "COMPLETED",
			children: []
		} as unknown as GoalFormModel;
		const activeGoal = {
			id: "g2",
			description: "Active Goal",
			status: "ACTIVE",
			children: []
		} as unknown as GoalFormModel;
		const inactiveGoal = {
			id: "g3",
			description: "Inactive Goal",
			status: "INACTIVE",
			children: []
		} as unknown as GoalFormModel;
		const testGoals = new IdSet([completedGoal, activeGoal, inactiveGoal]);
		render(<LearningGoals goals={testGoals} />);

		expect(screen.getByText("Active Goal")).toBeInTheDocument();
		expect(screen.getByText("Inactive Goal")).toBeInTheDocument();
		expect(screen.queryByText("Completed Goal")).not.toBeInTheDocument();
		const secondTab = screen.getByText("Abgeschlossen");
		await userEvent.click(secondTab);
		expect(screen.getByText("Completed Goal")).toBeInTheDocument();
		expect(screen.queryByText("Active Goal")).not.toBeInTheDocument();
		expect(screen.queryByText("Inactive Goal")).not.toBeInTheDocument();
	});

	it("changes the visual order of sub goals after moving priorities", async () => {
		const { rerender } = render(<LearningGoals goals={goals} />);

		await waitFor(() => {
			expect(screen.getByText("name1")).toBeInTheDocument();
			expect(screen.getByText("name2")).toBeInTheDocument();
		});

		let subGoalRows = screen.getAllByText(/name[12]/);
		expect(subGoalRows[0]).toHaveTextContent("name1");
		expect(subGoalRows[1]).toHaveTextContent("name2");

		const moveDownBtn = screen.getAllByTitle("Priorität senken")[0];
		await userEvent.click(moveDownBtn);
		// wait until order is changed before render
		await waitFor(() => {
			const updatedGoal1 = goals.get(subGoal1.id);
			expect(updatedGoal1?.order).toBe(1);

			const updatedGoal2 = goals.get(subGoal2.id);
			expect(updatedGoal2?.order).toBe(0);

			// as order is not important - do loose matching
			expect(mockEditGoal).toHaveBeenCalledTimes(2);
			expect(mockEditGoal).toHaveBeenCalledWith(
				expect.objectContaining({ id: subGoal1.id, order: 1 })
			);
			expect(mockEditGoal).toHaveBeenCalledWith(
				expect.objectContaining({ id: subGoal2.id, order: 0 })
			);
		});
		rerender(<LearningGoals goals={goals} />);

		// check visual order
		await waitFor(() => {
			subGoalRows = screen.getAllByText(/name[12]/);
			expect(subGoalRows[0]).toHaveTextContent("name2");
			expect(subGoalRows[1]).toHaveTextContent("name1");
		});

		const moveUpBtn = screen.getAllByTitle("Priorität erhöhen")[1];
		await userEvent.click(moveUpBtn);
		// wait until order is changed before render
		await waitFor(() => {
			const updatedGoal1 = goals.get(subGoal1.id);
			expect(updatedGoal1?.order).toBe(0);

			const updatedGoal2 = goals.get(subGoal2.id);
			expect(updatedGoal2?.order).toBe(1);

			// as order is not important - do loose matching
			expect(mockEditGoal).toHaveBeenCalledTimes(4);
			expect(mockEditGoal).toHaveBeenCalledWith(
				expect.objectContaining({ id: subGoal1.id, order: 0 })
			);
			expect(mockEditGoal).toHaveBeenCalledWith(
				expect.objectContaining({ id: subGoal2.id, order: 1 })
			);
		});
		rerender(<LearningGoals goals={goals} />);

		// check visual order again
		await waitFor(() => {
			subGoalRows = screen.getAllByText(/name[12]/);
			expect(subGoalRows[0]).toHaveTextContent("name1");
			expect(subGoalRows[1]).toHaveTextContent("name2");
		});
	});

	it("shows toast when all sub goals are completed", async () => {
		const { rerender } = render(<LearningGoals goals={goals} />);

		const subGoalACheckbox = screen.getByTestId("goal_status:sub1");
		const subGoalBCheckbox = screen.getByTestId("goal_status:sub2");
		await userEvent.click(subGoalACheckbox);
		await waitFor(() => {
			const updatedGoal = goals.get("sub1");
			expect(updatedGoal?.status).toBe("COMPLETED");
		});
		rerender(<LearningGoals goals={goals} />);
		await userEvent.click(subGoalBCheckbox);
		await waitFor(() => {
			const updatedGoal = goals.get("sub2");
			expect(updatedGoal?.status).toBe("COMPLETED");
		});
		rerender(<LearningGoals goals={goals} />);
		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "info",
					title: expect.stringContaining("kann abgeschlossen werden")
				})
			);
		});
	});

	it("does not show edit/delete/add buttons for completed goals", async () => {
		const completedGoal = {
			id: "g1",
			description: "Completed Goal",
			status: "COMPLETED",
			children: []
		} as unknown as GoalFormModel;
		const testGoals = new IdSet([completedGoal]);
		render(<LearningGoals goals={testGoals} />);

		const secondTab = screen.getByText("Abgeschlossen");
		await userEvent.click(secondTab);
		expect(screen.getByText("Completed Goal")).toBeInTheDocument();
		expect(screen.queryByTitle("Bearbeiten")).not.toBeInTheDocument();
		expect(screen.queryByTitle("Priorität erhöhen")).not.toBeInTheDocument();
		expect(screen.queryByTitle("Priorität senken")).not.toBeInTheDocument();
	});
});
