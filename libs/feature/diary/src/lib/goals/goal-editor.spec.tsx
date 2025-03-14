import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalEditorDialog } from "./goal-editor";
import "@testing-library/jest-dom";

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

describe("GoalEditorDialog", () => {
	beforeAll(() => {
		global.ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	});

	it("should disable save button when description length is less than 5", async () => {
		const onClose = jest.fn();
		render(<GoalEditorDialog onClose={onClose} />);

		const textarea = screen.getByRole("textbox");
		const saveButton = screen.getByRole("button", { name: /speichern/i });

		await userEvent.type(textarea, "1234");
		expect(saveButton).toBeDisabled();
	});

	it("should disable save button when description contains only whitespace", async () => {
		const onClose = jest.fn();
		render(<GoalEditorDialog onClose={onClose} />);

		const textarea = screen.getByRole("textbox");
		const saveButton = screen.getByRole("button", { name: /speichern/i });

		await userEvent.type(textarea, "     ");
		expect(saveButton).toBeDisabled();
	});

	it("should enable save button when description length is valid", async () => {
		const onClose = jest.fn();
		render(<GoalEditorDialog onClose={onClose} />);

		const textarea = screen.getByRole("textbox");
		const saveButton = screen.getByRole("button", { name: /speichern/i });

		// Enter a valid description with more than 4 characters
		await userEvent.type(textarea, "Valid description");
		expect(saveButton).not.toBeDisabled();
	});
});
