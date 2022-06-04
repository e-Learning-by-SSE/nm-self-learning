import { useCallback, useEffect, useState } from "react";

/** Hook that provides the current  toggle-state and methods to toggle one or all sections at once. */
export function useCollapseToggle(content: unknown[]) {
	const [globalCollapsed, globalCollapseToggle] = useState(false);
	const [collapsedSections, setCollapsedSections] = useState(content.map(c => true));

	const toggleCollapse = useCallback((index: number) => {
		setCollapsedSections(items => {
			const newItems = [...items];
			newItems[index] = !newItems[index];
			return newItems;
		});
	}, []);

	useEffect(() => {
		setCollapsedSections(items => items.map(() => globalCollapsed));
	}, [globalCollapsed]);

	return {
		/** Indicates, whether all sections should be collapsed or not. */
		globalCollapsed,
		/** Toggle for opening/closing all section. */
		globalCollapseToggle,
		/** Toggles the open/closed state for a specific section. */
		toggleCollapse,
		/** Array that contains the open/closed state of each section. */
		collapsedSections
	};
}
