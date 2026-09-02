import { render } from "@testing-library/react";
import { H5PViewer } from "./h5p-viewer";

// Mock document.createElement to intercept script tag creation
const originalCreateElement = document.createElement.bind(document);
const mockScriptOnload = jest.fn();

beforeEach(() => {
	jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
		if (tag === "script") {
			const script = originalCreateElement("script") as HTMLScriptElement;
			Object.defineProperty(script, "onload", {
				set: (fn) => { mockScriptOnload.mockImplementation(fn); },
				get: () => mockScriptOnload
			});
			return script;
		}
		return originalCreateElement(tag);
	});

	// Mock H5PStandalone on window
	(window as unknown as { H5PStandalone: unknown }).H5PStandalone = {
		H5P: jest.fn().mockImplementation(() => ({}))
	};
});

afterEach(() => {
	jest.restoreAllMocks();
	delete (window as unknown as { H5PStandalone?: unknown }).H5PStandalone;
});

describe("H5PViewer", () => {
	it("renders a container div", () => {
		render(<H5PViewer folderUrl="http://localhost:9000/upload/content/abc123" />);
		const container = document.querySelector(".w-full");
		expect(container).not.toBeNull();
	});

	it("renders without crashing when folderUrl is empty", () => {
		expect(() => {
			render(<H5PViewer folderUrl="" />);
		}).not.toThrow();
	});

	it("converts MinIO folder URL to correct proxy path", () => {
		const H5PMock = ((window as unknown as { H5PStandalone: { H5P: jest.Mock } }).H5PStandalone).H5P;

		render(<H5PViewer folderUrl="http://localhost:9000/upload/content/abc123" />);

		expect(H5PMock).toHaveBeenCalledWith(
			expect.any(HTMLElement),
			expect.objectContaining({
				h5pJsonPath: "/api/h5p-content/content/abc123",
				frameJs: "/h5p/frame.bundle.js",
				frameCss: "/h5p/styles/h5p.css"
			})
		);
	});
});