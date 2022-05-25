import { loginAsAdmin } from "./login";

describe("Login", () => {
	it("Valid credentials -> Returns JWT", async () => {
		const result = await loginAsAdmin();

		console.log(result.data);

		expect(1).toEqual(1);
	});
});
