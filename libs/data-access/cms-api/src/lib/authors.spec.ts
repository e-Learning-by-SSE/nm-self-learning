import { cmsGraphqlClient } from "./cms-graphql-client";
describe("Authors API", () => {
	it("Should return authors", async () => {
		const { authors } = await cmsGraphqlClient.authors();
		expect(authors?.data).toHaveLength(1);
	});
});
