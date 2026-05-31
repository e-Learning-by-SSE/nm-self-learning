import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { IFrameInput } from "./iframe";

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
	it("renders an empty placeholder when no URL is set", () => {
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

		expect(screen.queryByTitle("iframe")).toBeNull();
	});

	it("renders a sandboxed preview iframe when a URL is provided", () => {
		render(
			<FormWrapper
				defaultValues={{
					content: [
						{
							type: "iframe",
							value: { url: "https://example.com" },
							meta: { estimatedDuration: 0 }
						}
					]
				}}
			>
				<IFrameInput index={0} />
			</FormWrapper>
		);

		const iframe = screen.getByTitle("iframe");
		expect(iframe).toBeDefined();
		expect(iframe.getAttribute("src")).toBe("https://example.com");
		expect(iframe.getAttribute("sandbox")).toContain("allow-scripts");
	});

	it("keeps content type as 'iframe' after editing the URL (regression: previously set type to 'pdf')", () => {
		let snapshot: unknown = null;
		function Capture() {
			const methods = useForm({
				defaultValues: {
					content: [
						{
							type: "iframe",
							value: { url: "" },
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

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "https://h5p.org/example" } });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const values = (snapshot as any)();
		expect(values.content[0].type).toBe("iframe");
		expect(values.content[0].value.url).toBe("https://h5p.org/example");
	});
});