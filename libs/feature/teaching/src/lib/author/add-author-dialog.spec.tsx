import { trpc } from "@self-learning/api-client";
import { AddAuthorDialog } from "./add-author-dialog";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@self-learning/api-client", () => {
	return {
		trpc: {
			author: {
				getAll: {
					useQuery: jest.fn()
				}
			}
		}
	};
});

describe("add-author-dialog", () => {
	beforeAll(() => {
		global.ResizeObserver = class {
			observe() {}

			unobserve() {}

			disconnect() {}
		};
	});

	describe("combobox-onChange", () => {
		it("should return the name of the pressed author #267", async () => {
			//arrange
			const fakeAuthors = [
				{
					username: "mmuster",
					displayName: "Max Mustermann",
					slug: "muster-mann",
					imgUrl: null
				}
			];

			const onCloseMock = jest.fn();

			(trpc.author.getAll.useQuery as jest.Mock).mockReturnValue({
				data: fakeAuthors
			});

			render(<AddAuthorDialog open={true} onClose={onCloseMock} />);
			const button = await screen.findByTestId("author-option");
			fireEvent.click(button);

			waitFor(() => {
				expect(onCloseMock).toHaveBeenCalledWith(fakeAuthors[0]);
			});
		});
	});
});
