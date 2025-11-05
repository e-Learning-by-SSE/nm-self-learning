import { testExportGetRelativeBasePath } from "./lib/redirect-to-login";
import jestConfig from "../jest.config";

describe("basePathTests", () => {
	const OLD_ENV = process.env;
	const expectedOrigin = jestConfig.testEnvironmentOptions.url;

	beforeAll(() => {
		process.env = { ...OLD_ENV }; // Make a copy
	});

	afterAll(() => {
		process.env = OLD_ENV; // Restore old environment
	});

	test("Base path defined -> is added to window.location.origin base path", () => {
		process.env.NEXT_PUBLIC_BASE_PATH = "/test";
		expect(testExportGetRelativeBasePath()).toBe(expectedOrigin + "/test");
	});

	test("Base path undefined -> empty string", () => {
		process.env.NEXT_PUBLIC_BASE_PATH = undefined;
		expect(testExportGetRelativeBasePath()).toBe(expectedOrigin);
	});
});
