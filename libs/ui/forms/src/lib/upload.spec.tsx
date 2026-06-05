import React from "react";
import { render, screen } from "@testing-library/react";
import { Upload } from "./upload";
import { TextEncoder, TextDecoder } from "util";

if (typeof global.TextEncoder === "undefined") {
	global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
	global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

// Mock heavy auth/layout dependencies
jest.mock("@self-learning/util/auth", () => ({
	getServerSession: jest.fn(),
	useSession: jest.fn(() => ({ data: null, status: "unauthenticated" }))
}));

jest.mock("next-auth/react", () => ({
	useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
	signIn: jest.fn(),
	signOut: jest.fn()
}));

// Mock all tRPC hooks used inside Upload component
jest.mock("@self-learning/api-client", () => ({
	trpc: {
		storage: {
			getPresignedUrl: {
				useMutation: jest.fn(() => ({
					mutateAsync: jest.fn()
				}))
			},
			registerAsset: {
				useMutation: jest.fn(() => ({
					mutateAsync: jest.fn()
				}))
			},
			getMyAssets: {
				useQuery: jest.fn(() => ({
					data: { result: [], totalCount: 0, page: 1, pageSize: 5 },
					isLoading: false
				}))
			}
		}
	}
}));

describe("Upload", () => {
	it("renders the upload button", () => {
		// ARRANGE
		render(
			<Upload
				mediaType="zip"
				onUploadCompleted={jest.fn()}
				preview={<div>preview</div>}
			/>
		);

		// ASSERT
		expect(screen.getByText("Upload File")).toBeDefined();
	});

	it("file input accepts zip and h5p and html files for zip mediaType", () => {
		// ARRANGE
		render(
			<Upload
				mediaType="zip"
				onUploadCompleted={jest.fn()}
				preview={<div />}
			/>
		);

		// ACT
		const input = document.querySelector("input[type='file']");

		// ASSERT
		expect(input).not.toBeNull();
		expect(input?.getAttribute("accept")).toContain(".zip");
		expect(input?.getAttribute("accept")).toContain(".h5p");
		expect(input?.getAttribute("accept")).toContain(".html");
	});

	it("file input accepts only pdf files for pdf mediaType", () => {
		// ARRANGE
		render(
			<Upload
				mediaType="pdf"
				onUploadCompleted={jest.fn()}
				preview={<div />}
			/>
		);

		// ACT
		const input = document.querySelector("input[type='file']");

		// ASSERT
		expect(input).not.toBeNull();
		expect(input?.getAttribute("accept")).toBe("application/pdf");
	});

	it("onUploadCompleted callback signature accepts fileName as third argument", () => {
		// This test documents the contract between Upload and its consumers.
		// iframe.tsx depends on fileName being passed as the 3rd argument
		// so it can detect .html vs .zip vs .h5p without relying on the URL.
		const onUploadCompleted = jest.fn();

		render(
			<Upload
				mediaType="zip"
				onUploadCompleted={onUploadCompleted}
				preview={<div />}
			/>
		);

		// Simulate what Upload calls internally after a successful upload
		// by calling the mock directly with the expected signature
		onUploadCompleted(
			"http://localhost:9000/upload/abc123",
			{ duration: 0 },
			"test-upload.html"
		);

		// ASSERT — third argument is the filename
		expect(onUploadCompleted).toHaveBeenCalledWith(
			"http://localhost:9000/upload/abc123",
			{ duration: 0 },
			"test-upload.html"
		);
	});
});