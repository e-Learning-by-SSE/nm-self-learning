import { testExportGetRelativeBasePath } from "./lib/redirect-to-login";

describe("basePathTests", () => {
	const OLD_ENV = process.env;
	let originalLocation: Location;
	const expectedOrigin = "https://example.com";

	beforeAll(() => {
		originalLocation = window.location;
		Object.defineProperty(window, "location", {
			value: {
				...originalLocation,
				origin: expectedOrigin
			}
		});
		jest.resetModules(); // it clears the cache
		process.env = { ...OLD_ENV }; // Make a copy
	});

	afterAll(() => {
		process.env = OLD_ENV; // Restore old environment
		Object.defineProperty(window, "location", {
			value: originalLocation
		});
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
