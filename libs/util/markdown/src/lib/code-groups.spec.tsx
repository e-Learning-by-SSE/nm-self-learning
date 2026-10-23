import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "./code-group-container";
import { compileMarkdown, rehypePlugins, remarkPlugins } from "./markdown";
import { MarkdownRemote } from "./markdown-remote";

const example = [
	"::: code-group compare",
	'```typescript title="hello.ts"',
	'const greeting = "Hallo";',
	"```",
	"```python [hello.py]",
	'print("Hallo")',
	"```",
	":::"
].join("\n");

function Preview({ content }: { content: string }) {
	return (
		<ReactMarkdown
			remarkPlugins={remarkPlugins}
			rehypePlugins={rehypePlugins}
			components={markdownComponents}
		>
			{content}
		</ReactMarkdown>
	);
}

describe("Markdown code groups", () => {
	it.each(["preview", "compiled"] as const)(
		"keeps highlighting after updating %s content, switching tabs, and opening the dialog",
		async mode => {
			const user = userEvent.setup();
			const content = [
				"# Code in geteilter Ansicht",
				"",
				example.replace("typescript title=", "typescript \u00a0title="),
				"",
				"# Standalone",
				"```typescript",
				'const greeting = "Hallo";',
				"```"
			].join("\n");
			const renderContent = async (markdown: string) =>
				mode === "preview" ? (
					<Preview content={markdown} />
				) : (
					<MarkdownRemote {...await compileMarkdown(markdown)} />
				);
			const { container, rerender } = render(await renderContent(content));
			await rerender(await renderContent(`${content}\n\nUpdated content.`));
			expect(
				container.querySelectorAll("pre.language-typescript .token.keyword")
			).toHaveLength(2);
			await user.click(screen.getByRole("tab", { name: "hello.py" }));
			expect(screen.getByRole("tabpanel").querySelector(".token.string")).toHaveTextContent(
				'"Hallo"'
			);
			await user.click(screen.getByRole("button", { name: "Code_Group_Compare" }));
			const dialog = screen.getByRole("dialog");
			expect(
				dialog.querySelector("pre.language-typescript .token.keyword")
			).toHaveTextContent("const");
			expect(dialog.querySelector("pre.language-python .token.string")).toHaveTextContent(
				'"Hallo"'
			);
		}
	);

	it("uses Prism's full registry and keeps unsupported languages readable", () => {
		const { container } = render(
			<Preview
				content={
					"```abap\nDATA greeting TYPE string.\n```\n\n```unsupported-language\nplain content\n```"
				}
			/>
		);
		expect(container.querySelector("pre.language-abap .token.keyword")).toHaveTextContent(
			"DATA"
		);
		expect(container.querySelector("code.language-unsupported-language")).toHaveTextContent(
			"plain content"
		);
	});

	it("switches highlighted snippets using the keyboard and compares all snippets in a dialog", async () => {
		const user = userEvent.setup();
		render(<Preview content={example} />);
		const first = screen.getByRole("tab", { name: "hello.ts" });
		expect(first).toHaveAttribute("aria-selected", "true");
		expect(screen.getByRole("tabpanel").querySelector(".token.keyword")).toHaveTextContent(
			"const"
		);
		await user.click(first);
		await user.keyboard("{ArrowRight}");
		expect(screen.getByRole("tab", { name: "hello.py" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		expect(screen.getByRole("tabpanel")).toHaveTextContent('print("Hallo")');
		const compare = screen.getByRole("button", { name: "Code_Group_Compare" });
		await user.click(compare);
		const dialog = screen.getByRole("dialog", { name: "Code_Group_Compare" });
		expect(within(dialog).getByRole("region", { name: "hello.ts" })).toHaveTextContent(
			'const greeting = "Hallo";'
		);
		expect(within(dialog).getByRole("region", { name: "hello.py" })).toHaveTextContent(
			'print("Hallo")'
		);
		await user.keyboard("{Escape}");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(compare).toHaveFocus();
		expect(screen.getByRole("tab", { name: "hello.py" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
	});

	it("renders the same tabs and comparison action from compiled Markdown", async () => {
		const compiled = await compileMarkdown(example);
		const user = userEvent.setup();
		render(<MarkdownRemote {...compiled} />);
		await user.click(screen.getByRole("tab", { name: "hello.py" }));
		expect(screen.getByRole("tabpanel")).toHaveTextContent('print("Hallo")');
		await user.click(screen.getByRole("button", { name: "Code_Group_Compare" }));
		expect(screen.getByRole("dialog")).toHaveTextContent('const greeting = "Hallo";');
	});

	it("offers comparison without an opt-in, supports the compact directive, and preserves following prose", () => {
		render(
			<Preview
				content={
					example.replace("::: code-group compare", ":::code-group") +
					"\nFollowing **text**."
				}
			/>
		);
		expect(screen.getAllByRole("tab")).toHaveLength(2);
		expect(screen.getByRole("button", { name: "Code_Group_Compare" })).toBeInTheDocument();
		expect(screen.getByText("text").tagName).toBe("STRONG");
	});

	it("uses language and numeric fallback labels, including unknown languages", () => {
		render(
			<Preview content={"::: code-group\n```unknown\nopaque\n```\n```\nplain\n```\n:::"} />
		);
		expect(screen.getByRole("tab", { name: "unknown" })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "2" })).toBeInTheDocument();
	});

	it.each([
		example.replace(/\n:::$/, ""),
		"::: code-group\n\nProse must remain visible.\n\n```js\nconst a = 1;\n```\n:::",
		"````md\n" + example + "\n````",
		"::: code-group\n:::"
	])("leaves incomplete, mixed-content, empty, and fenced examples readable", content => {
		const { container } = render(<Preview content={content} />);
		expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
		expect(container).toHaveTextContent("::: code-group");
	});

	it("keeps independent groups inside blockquotes and lists", () => {
		const quoted = example
			.split("\n")
			.map(line => `> ${line}`)
			.join("\n");
		const listed = example
			.split("\n")
			.map((line, index) => `${index ? "  " : "- "}${line}`)
			.join("\n");
		render(<Preview content={`${quoted}\n\n${listed}`} />);
		expect(screen.getAllByRole("tablist")).toHaveLength(2);
	});
});
