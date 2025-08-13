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
			if (node.tagName === "img" && node.properties && node.properties.alt) {
				const alt = String(node.properties.alt);

				// Look for attribute pattern in alt text: {width=300} or {width=300 height=200}
				const attributeMatch = alt.match(/\{([^}]+)\}/);

				if (attributeMatch && node.properties) {
					const attributeString = attributeMatch[1];
					const cleanAlt = alt.replace(/\{[^}]+\}/, "").trim();

					const attributes = attributeString
						.split(/\s+/)
						.filter(attr => attr.includes("="));

					attributes.forEach(attr => {
						const [key, value] = attr.split("=");
						if (key && value && node.properties) {
							
							if (key === "width" || key === "height") {
								// If value is just a number, add 'px'
								const cleanValue = value.replace(/['"]/g, "");
								if (/^\d+$/.test(cleanValue)) {
									node.properties[key] = cleanValue + "px";
								} else {
									node.properties[key] = cleanValue;
								}
							} else if (key === "class" || key.startsWith(".")) {
								// Handle CSS classes
								const className = key.startsWith(".")
									? key.slice(1)
									: value.replace(/['"]/g, "");
								if (node.properties.className) {
									node.properties.className += " " + className;
								} else {
									node.properties.className = className;
								}
							} else {
								// Handle other attributes
								node.properties[key] = value.replace(/['"]/g, "");
							}
						} else if (key.startsWith(".") && node.properties) {
							const className = key.slice(1);
							if (node.properties.className) {
								node.properties.className += " " + className;
							} else {
								node.properties.className = className;
							}
						}
					});

					if (node.properties) {
						node.properties.alt = cleanAlt;
					}
				}
			}
		});
	};
};
