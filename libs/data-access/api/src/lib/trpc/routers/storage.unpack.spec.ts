import { getMimeTypeForTest } from "./storage.router";

// Note: Full integration tests for unpackArchive require a running MinIO instance.
// These unit tests cover the helper functions and validation logic.

describe("getMimeType", () => {
	it("returns correct MIME type for HTML files", () => {
		expect(getMimeTypeForTest("index.html")).toBe("text/html");
		expect(getMimeTypeForTest("index.htm")).toBe("text/html");
	});

	it("returns correct MIME type for JS and CSS", () => {
		expect(getMimeTypeForTest("main.js")).toBe("application/javascript");
		expect(getMimeTypeForTest("style.css")).toBe("text/css");
	});

	it("returns correct MIME type for images", () => {
		expect(getMimeTypeForTest("image.png")).toBe("image/png");
		expect(getMimeTypeForTest("photo.jpg")).toBe("image/jpeg");
		expect(getMimeTypeForTest("photo.jpeg")).toBe("image/jpeg");
	});

	it("returns correct MIME type for H5P-related files", () => {
		expect(getMimeTypeForTest("h5p.json")).toBe("application/json");
		expect(getMimeTypeForTest("content.json")).toBe("application/json");
	});

	it("returns octet-stream for unknown extensions", () => {
		expect(getMimeTypeForTest("data.xyz")).toBe("application/octet-stream");
		expect(getMimeTypeForTest("noextension")).toBe("application/octet-stream");
	});
});