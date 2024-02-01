/* eslint-disable @typescript-eslint/ban-ts-comment */
import { visit } from "unist-util-visit";
import { Plugin } from "unified";
import { refractor } from "refractor";
import { Node, Parent } from "unist";
import { Element } from "hast";

const getLanguage = (node: Element) => {
	const className = node.properties?.className; // Ensure className is not null or undefined
	if (className) {
		if (Array.isArray(className)) {
			for (const classListItem of className) {
				if (
					typeof classListItem === "string" &&
					classListItem.slice(0, 9) === "language-"
				) {
					return classListItem.slice(9).toLowerCase();
				}
			}
		}
	}
	return null;
};

/**
 * A custom language filter plugin.
 * This plugin filters the programming language of code blocks in markdown.
 *
 * @returns A function that filters the programming language of code blocks in markdown.
 */
const customLanguageFilter: Plugin = _ => {
	return function (tree: Node, _) {
		visit(tree, "element", (node: Element, index: number, parent: Parent) => {
			if (!parent || node.tagName !== "code") {
				return;
			}

			const lang = getLanguage(node);

			if (lang) {
				const rootLang = lang.includes("diff-") ? lang.split("-")[1] : lang;

				if (!refractor.registered(rootLang)) {
					// Remove the entire <pre> block if language is not registered
					if (typeof index === "number" && parent.type === "element") {
						parent.children.splice(index, 1);
					}
				} else {
					// Continue with the existing class names
					// @ts-ignore: We know that parent is an Element
					parent.properties.className = [
						// @ts-ignore: We know that parent is an Element
						...(parent.properties.className || []),
						`language-${rootLang}`
					];
				}
			}
		});
		return tree;
	};
};

export default customLanguageFilter;
