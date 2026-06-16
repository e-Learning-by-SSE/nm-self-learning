import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { IFrameInput } from "./iframe";

// Mock tRPC to avoid needing a full provider in tests
jest.mock("@self-learning/api-client", () => ({
	trpc: {
		storage: {
			unpackArchive: {
				useMutation: jest.fn(() => ({
					mutateAsync: jest.fn(),
					isPending: false
				}))
			},
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

function FormWrapper({
	defaultValues,
	children
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	defaultValues: any;
	children: React.ReactNode;
}) {
	const methods = useForm({ defaultValues });
	return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("IFrameInput", () => {
	it("renders upload tab by default with upload button visible", () => {
		render(
			<FormWrapper
				defaultValues={{
					content: [
						{
							type: "iframe",
							value: { url: "" },
							meta: { estimatedDuration: 0 }
						}
					]
				}}
			>
				<IFrameInput index={0} />
			</FormWrapper>
		);

		// Upload tab is default — upload button should be visible
		expect(screen.getByText("Upload File")).toBeDefined();
		// URL input should not be visible on upload tab
		expect(screen.queryByRole("textbox")).toBeNull();
	});

	it("renders URL input when Externe URL tab is clicked", () => {
		render(
			<FormWrapper
				defaultValues={{
					content: [
						{
							type: "iframe",
							value: { url: "https://example.com", source: "url" },
							meta: { estimatedDuration: 0 }
						}
					]
				}}
			>
				<IFrameInput index={0} />
			</FormWrapper>
		);

		// Click the URL tab
		fireEvent.click(screen.getByText("Externe URL"));

		// URL input should now be visible
		const input = screen.getByRole("textbox");
		expect(input).toBeDefined();
	});

	it("keeps content type as 'iframe' after editing the URL (regression: previously set type to 'pdf')", () => {
		let snapshot: unknown = null;
		function Capture() {
			const methods = useForm({
				defaultValues: {
					content: [
						{
							type: "iframe",
							value: { url: "", source: "url" },
							meta: { estimatedDuration: 0 }
						}
					]
				}
			});
			snapshot = methods.getValues;
			return (
				<FormProvider {...methods}>
					<IFrameInput index={0} />
				</FormProvider>
			);
		}

		render(<Capture />);

		// Switch to URL tab first
		fireEvent.click(screen.getByText("Externe URL"));

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "https://h5p.org/example" } });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const values = (snapshot as any)();
		expect(values.content[0].type).toBe("iframe");
		expect(values.content[0].value.url).toBe("https://h5p.org/example");
	});
});
