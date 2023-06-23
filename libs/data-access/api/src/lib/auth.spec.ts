import { MAIL_DOMAIN, testingExportMailToUsername } from "./auth";

const mailToUsername = testingExportMailToUsername;
describe("mailToUsername", () => {
	it("input mail -> should return username", () => {
		const mail = `test${MAIL_DOMAIN}`;
		const username = mailToUsername(mail);
		expect(username).toBe("test");
	});

	// negative test case where no mail is provided
	it("input username -> should return username", () => {
		const mail = "test";
		const username = mailToUsername(mail);
		expect(username).toBe("test");
	});
});
