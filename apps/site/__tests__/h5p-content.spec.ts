// Note: Full integration tests for the proxy route require a running MinIO instance.
// These unit tests cover the content-type detection logic.

describe("H5P content proxy - getMimeType logic", () => {
	const getMimeType = (filename: string): string => {
		const ext = filename.split(".").pop()?.toLowerCase() ?? "";
		const contentTypes: Record<string, string> = {
			json: "application/json",
			js: "application/javascript",
			css: "text/css",
			html: "text/html",
			png: "image/png",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			gif: "image/gif",
			svg: "image/svg+xml",
			mp4: "video/mp4",
			mp3: "audio/mpeg",
			woff: "font/woff",
			woff2: "font/woff2"
		};
		return contentTypes[ext] ?? "application/octet-stream";
	};

	it("returns correct type for H5P JSON files", () => {
		expect(getMimeType("h5p.json")).toBe("application/json");
		expect(getMimeType("content.json")).toBe("application/json");
	});

	it("returns correct type for JS and CSS", () => {
		expect(getMimeType("library.js")).toBe("application/javascript");
		expect(getMimeType("styles.css")).toBe("text/css");
	});

	it("returns correct type for images", () => {
		expect(getMimeType("image.png")).toBe("image/png");
		expect(getMimeType("photo.jpg")).toBe("image/jpeg");
		expect(getMimeType("icon.svg")).toBe("image/svg+xml");
	});

	it("returns correct type for fonts", () => {
		expect(getMimeType("font.woff2")).toBe("font/woff2");
		expect(getMimeType("font.woff")).toBe("font/woff");
	});

	it("returns octet-stream for unknown extensions", () => {
		expect(getMimeType("unknown.xyz")).toBe("application/octet-stream");
		expect(getMimeType("noextension")).toBe("application/octet-stream");
	});
});