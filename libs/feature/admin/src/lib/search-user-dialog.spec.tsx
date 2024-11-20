import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchUserDialog } from "@self-learning/admin";

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		admin: {
			findUsers: {
				useQuery: jest.fn(() => ({
					data: {
						page: 1,
						pageSize: 15,
						totalCount: 13,
						result: [
							{
								name: "NotAnAuthor",
								email: null,
								role: "USER",
								image: null
							}
						]
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

	it("should add new user to the authorList", async () => {
		// Arrange
		const name = "NotAnAuthor";
		const onCloseMock = jest.fn();

		render(<SearchUserDialog open={true} onClose={onCloseMock} />);

		// Act
		const userButton = screen.getByText(name);
		fireEvent.click(userButton);

		// Assert
		await waitFor(() => {
			expect(onCloseMock).toHaveBeenCalledWith(name);
		});
	});
});
