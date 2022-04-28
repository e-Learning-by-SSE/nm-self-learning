import { database } from "@self-learning/database";
import { graphql } from "msw";
import { setupServer } from "msw/node";
import { getCoursesOfUser } from "../pages/api/users/[username]/courses";

export const handlers = [
	graphql.query("coursesWithSlugs", (req, res, ctx) => {
		return res(
			ctx.data({
				test: "Result from mocked msw response..."
			})
		);
	})
];

export const server = setupServer(...handlers);

// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

describe("/api/users/[username]/courses", () => {
	describe("getCoursesOfUser", () => {
		it("1", async () => {
			database.enrollments.findMany = jest.fn().mockImplementation(() => {
				return Promise.resolve([{ courseId: "testing" }]);
			});
			await getCoursesOfUser("username");
		});

		it("2", async () => {
			server.use(
				graphql.query("coursesWithSlugs", (req, res, ctx) => {
					return res(
						ctx.data({
							test: "Result from overwritten mocked msw response..."
						})
					);
				})
			);

			database.enrollments.findMany = jest.fn().mockImplementation(() => {
				return Promise.resolve([{ courseId: "testing2" }]);
			});
			await getCoursesOfUser("username");
		});
	});
});
