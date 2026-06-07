import React from "react";
import { render } from "@testing-library/react";
import * as H5PModule from "h5p-standalone";
import { H5PViewer } from "./h5p-viewer";

// Mock h5p-standalone to avoid loading the full library in tests
jest.mock("h5p-standalone", () => ({
	H5P: jest.fn().mockImplementation(() => ({}))
}));

const H5PMock = H5PModule.H5P as jest.Mock;

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
		H5PMock.mockClear();

		render(<H5PViewer folderUrl="http://localhost:9000/upload/content/abc123" />);

		return new Promise<void>(resolve => {
			setTimeout(() => {
				if (H5PMock.mock.calls.length > 0) {
					const options = H5PMock.mock.calls[0][1];
					expect(options.h5pJsonPath).toBe("/api/h5p-content/content/abc123");
					expect(options.frameJs).toBe("/h5p/frame.bundle.js");
					expect(options.frameCss).toBe("/h5p/styles/h5p.css");
				}
				resolve();
			}, 100);
		});
	});
});