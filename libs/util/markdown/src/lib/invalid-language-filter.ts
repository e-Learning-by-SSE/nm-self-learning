import { visit } from "unist-util-visit";
import { refractor } from "refractor";
import { Node, Parent } from "unist";
import { Element } from "hast";
import { isString } from "@self-learning/util/common";

const isElementNode = (node: Node): node is Element => node.type === "element";
const isParentNode = (node: Node): node is Parent => "children" in node;

function getClassNameArray(node: Element) {
	const className = node.properties?.className;
	return Array.isArray(className)
		? className.filter(isString).map(item => item.toLowerCase())
		: undefined;
}

function getLanguage(node: Element) {
	const classNameArray = getClassNameArray(node);
	const languageString = classNameArray?.find(item => item.startsWith("language-"))?.slice(9);
	const plainLanguage = languageString?.includes("diff-")
		? languageString.split("-")[1]
		: languageString;
	return plainLanguage;
}

function removeLanguage(node: Element) {
	const classNameArray = getClassNameArray(node);
	return classNameArray?.filter(item => !item.startsWith("language-"));
}

export function removeInvalidLanguage(node: Element, index: number, parent: Parent) {
	if (!isParentNode(parent) || !isElementNode(parent) || node.tagName !== "code") return;

	const lang = getLanguage(node);
	if (!lang) return;

	if (!refractor.registered(lang) && node.properties) {
		node.properties.className = removeLanguage(node);
	}
}

export const invalidLanguageFilter = function () {
	return function (tree: Node) {
		visit(tree, "element", removeInvalidLanguage);
		return tree;
	};
};
