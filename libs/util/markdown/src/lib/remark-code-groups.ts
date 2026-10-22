import type { Blockquote, Code, Paragraph, Root, RootContent } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

function paragraphText(node: RootContent) {
	return node.type === "paragraph" &&
		node.children.length === 1 &&
		node.children[0].type === "text"
		? node.children[0].value.trim()
		: undefined;
}

function codeTitle(node: Code, index: number) {
	const title = node.meta?.match(/(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|(\S+))/);
	const bracketTitle = node.meta?.match(/^\[([^\]]+)\]/);
	return (
		title?.[1] ?? title?.[2] ?? title?.[3] ?? bracketTitle?.[1] ?? node.lang ?? `${index + 1}`
	);
}

/** Group fenced code blocks without interpreting directive-like text inside code fences. */
export const remarkCodeGroups: Plugin<[], Root> = () => tree => {
	visit(tree, ["root", "blockquote", "listItem", "footnoteDefinition"], parent => {
		if (!("children" in parent)) return;
		const nodes = parent.children;
		for (let start = 0; start < nodes.length; start++) {
			const opening = paragraphText(nodes[start])?.match(
				/^:::\s*code-group(?:\s+(compare))?$/
			);
			if (!opening) continue;
			let end = start + 1;
			while (end < nodes.length && nodes[end].type === "code") end++;
			if (end === start + 1) continue;
			const closing = nodes[end];
			// A paragraph after the closing marker need not be separated by a blank line.
			if (closing?.type !== "paragraph" || closing.children[0]?.type !== "text") continue;
			const match = closing.children[0].value.match(/^:::[\t ]*(?:\n|$)/);
			if (!match) continue;
			const remainder = closing.children[0].value.slice(match[0].length);
			const after: Paragraph[] =
				remainder || closing.children.length > 1
					? [
							{
								...closing,
								children: [
									{ ...closing.children[0], value: remainder },
									...closing.children.slice(1)
								]
							}
						]
					: [];
			const snippets = nodes.slice(start + 1, end) as Code[];
			const group: Blockquote = {
				type: "blockquote",
				data: {
					hName: "div",
					hProperties: { "data-code-group": "true", "data-compare": String(!!opening[1]) }
				},
				children: snippets.map((code, index) => ({
					type: "blockquote",
					data: {
						hName: "div",
						hProperties: { "data-code-title": codeTitle(code, index) }
					},
					children: [code]
				}))
			};
			nodes.splice(start, end - start + 1, group, ...after);
		}
	});
};
