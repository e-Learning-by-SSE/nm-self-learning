import { ReactNode } from "react";
import { Tab as HeadlessTab } from "@headlessui/react";

export function Tabs({
	children,
	selectedIndex,
	onChange
}: {
	children: ReactNode;
	selectedIndex: number | undefined;
	onChange: (index: number) => void;
}) {
	return (
		<HeadlessTab.Group selectedIndex={selectedIndex} onChange={onChange}>
			<HeadlessTab.List className="flex gap-4">{children}</HeadlessTab.List>
		</HeadlessTab.Group>
	);
}

export function Tab({ children }: { children: ReactNode }) {
	return (
		<HeadlessTab
			className={({ selected }) =>
				`border-b-2 px-2 pb-1 focus:ring-0 focus-visible:outline-secondary ${
					selected
						? "border-b-secondary font-semibold text-secondary"
						: "border-b-transparent text-light"
				}`
			}
		>
			{children}
		</HeadlessTab>
	);
}
