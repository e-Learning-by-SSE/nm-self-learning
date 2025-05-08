import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "./search-bar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

jest.mock("next-auth/react", () => ({
	useSession: jest.fn()
}));

jest.mock("next/router", () => ({
	useRouter: jest.fn()
}));

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		lesson: {
			findMany: {
				useQuery: jest.fn(() => ({ data: { result: [] }, isLoading: false }))
			}
		},
		author: {
			findMany: {
				useQuery: jest.fn(() => ({ data: { result: [] }, isLoading: false }))
			}
		},
		course: {
			findMany: {
				useQuery: jest.fn(() => ({
					data: { result: [{ title: "Course 1", slug: "course-1" }] },
					isLoading: false
				}))
			}
		}
	}
}));

describe("SearchBar", () => {
	beforeEach(() => {
		(useSession as jest.Mock).mockReturnValue({
			status: "authenticated"
		});

		(useRouter as jest.Mock).mockReturnValue({
			push: jest.fn()
		});
	});

	it("renders the search bar", () => {
		render(<SearchBar />);
		const input = screen.getByPlaceholderText("Suchen...");
		expect(input).not.toBeNull();
	});

	it("updates the input value when typing", () => {
		render(<SearchBar />);
		const input = screen.getByPlaceholderText("Suchen...");
		fireEvent.change(input, { target: { value: "React" } });
		expect((input as HTMLInputElement).value).toBe("React");
	});
});
