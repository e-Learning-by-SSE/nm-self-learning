import { visit } from "unist-util-visit";
import type { Element } from "hast";
import type { Plugin } from "unified";

/**
 * Custom rehype plugin to add attributes to images based on alt text patterns
 * Supports syntax like: ![text {width=300}](image.jpg)
 */
export const rehypeImageAttributes: Plugin = () => {
	return tree => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName === "img" && node.properties.alt) {
				const alt = String(node.properties.alt);

				// Look for attribute pattern in alt text: {width=300} or {width=300 height=200}
				const attributeMatch = alt.match(/\{([^}]+)\}/);

				if (attributeMatch) {
					const attributeString = attributeMatch[1];
					const cleanAlt = alt.replace(/\{[^}]+\}/, "").trim();

					const attributes = attributeString
						.split(/\s+/)
						.filter(attr => attr.includes("=") || attr.startsWith("."));

					attributes.forEach(attr => {
						const [key, value] = attr.split("=");

						if (key?.startsWith(".")) {
							node.properties.className = [
								...(node.properties.className ?? []),
								key.slice(1)
							];
						} else if (key && value) {
							if (key === "width" || key === "height") {
								const cleanValue = value.replace(/['"]/g, "");
								node.properties[key] = /^\d+$/.test(cleanValue)
									? Number(cleanValue)
									: cleanValue;
							} else if (key === "class") {
								node.properties.className = [
									...(node.properties.className ?? []),
									...value.replace(/['"]/g, "").split(/\s+/)
								];
							} else {
								node.properties[key] = value.replace(/['"]/g, "");
							}
						}
					});

					node.properties.alt = cleanAlt;
				}
			}
		});
	};
};
