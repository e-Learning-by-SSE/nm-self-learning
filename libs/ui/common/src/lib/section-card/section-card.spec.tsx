import { render } from "@testing-library/react";
import { SectionCard } from "./section-card";

describe("SectionCard", () => {
	describe("Layout", () => {
		it("Default Layout", () => {
			const { container } = render(<SectionCard>Content</SectionCard>);
			const html = container.innerHTML;

			// Regression test: Checks that the component renders as in previous versions
			// To update snapshot run: npx jest -u <path/to/test/file.spec.ts>
			expect(html).toMatchSnapshot();
		});

		it("Custom Layout", () => {
			// Tests that layout can be customized (additional CSS classes added)
			const additionalClass = "border-dotted";
			const { container } = render(
				<SectionCard className={additionalClass}>Content</SectionCard>
			);
			const html = container.innerHTML;

			// Check for Key criteria: dashed border added
			expect(html).toContain(additionalClass);
		});
	});

	describe("Functionality", () => {
		it("Content", () => {
			const children = "Content";
			const { container } = render(<SectionCard>{children}</SectionCard>);

			// Only specified children was added
			expect(container.children.length).toBe(1);
			expect(container.children[0].innerHTML).toEqual(children);
		});
	});
});
