import { updateGoalStatus } from "./goal-status";
import { GoalFormModel } from "./types";
import { IdSet } from "@self-learning/util/common";

describe("updateGoalStatus", () => {
	it("should update goal status to COMPLETED when all sub-goals are completed", () => {
		const mockEditGoal = jest.fn();

		const subGoal1 = {
			id: "sub1",
			status: "COMPLETED",
			children: []
		} as unknown as GoalFormModel;
		const subGoal2 = {
			id: "sub2",
			status: "COMPLETED",
			children: []
		} as unknown as GoalFormModel;
		const goal = {
			id: "1",
			status: "ACTIVE",
			children: ["sub1", "sub2"]
		} as unknown as GoalFormModel;

		const goals = new IdSet([goal, subGoal1, subGoal2]);

		updateGoalStatus(goal, goals, mockEditGoal);

		expect(mockEditGoal).toHaveBeenCalledWith({
			...goal,
			status: "COMPLETED"
		});
	});

	it("should not update goal status to COMPLETED when not all sub-goals are completed", () => {
		const mockEditGoal = jest.fn();

		const subGoal1 = { id: "sub1", status: "ACTIVE", children: [] } as unknown as GoalFormModel;
		const subGoal2 = {
			id: "sub2",
			status: "COMPLETED",
			children: []
		} as unknown as GoalFormModel;
		const goal = { id: "1", status: "ACTIVE", children: ["sub1", "sub2"] } as GoalFormModel;

		const goals = new IdSet([goal, subGoal1, subGoal2]);

		updateGoalStatus(goal, goals, mockEditGoal);

		expect(mockEditGoal).not.toHaveBeenCalled();
	});

	it("should activate parent goal when sub-goal is updated", () => {
		const mockEditGoal = jest.fn();

		const parentGoal = {
			id: "parent",
			status: "INACTIVE",
			children: ["child"]
		} as GoalFormModel;
		const childGoal = {
			id: "child",
			status: "ACTIVE",
			parentId: "parent",
			children: []
		} as unknown as GoalFormModel;

		const goals = new IdSet([parentGoal, childGoal]);

		updateGoalStatus(childGoal, goals, mockEditGoal);

		expect(mockEditGoal).toHaveBeenCalledWith({
			id: "parent",
			status: "ACTIVE",
			lastProgressUpdate: expect.any(Date)
		});
	});
});
