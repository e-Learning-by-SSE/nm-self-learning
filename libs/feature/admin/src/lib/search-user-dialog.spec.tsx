import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchUserDialog } from "@self-learning/admin";
import userEvent from "@testing-library/user-event";

const exampleUser = {
	name: "NotAnAuthor",
	email: null,
	role: "USER",
	image: null,
	displayName: "NotAnAuthor"
};

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		admin: {
			findUsers: {
				useQuery: jest.fn(() => ({
					data: {
						page: 1,
						pageSize: 15,
						totalCount: 13,
						result: [exampleUser]
					}
				}))
			}
		}
	}
}));

describe("searchUserDialog", () => {
	beforeAll(() => {
		global.ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	});

	it("should return selected user in onClose", async () => {
		// Arrange
		const name = "NotAnAuthor";
		const onCloseMock = jest.fn();

		render(<SearchUserDialog open={true} onClose={onCloseMock} />);

		// Act
		const userButton = screen.getByText(name);
		await userEvent.click(userButton);

		// Assert
		await waitFor(() => {
			expect(onCloseMock).toHaveBeenCalledWith(exampleUser);
		});
	});
});
