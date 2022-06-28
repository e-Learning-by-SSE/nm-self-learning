import { Fragment, ReactNode } from "react";
import { Tab as HeadlessTab } from "@headlessui/react";
import { motion } from "framer-motion";

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
		<HeadlessTab as={Fragment}>
			{({ selected }) => (
				<button
					type="button"
					className="flex flex-col gap-1 pb-1 focus:ring-0 focus-visible:outline-secondary"
				>
					<span
						className={`px-2  ${
							selected ? "font-semibold text-secondary" : "text-light"
						}`}
					>
						{children}
					</span>

					{selected && (
						<motion.span
							layoutId="selectedTab"
							className="h-[4px] w-full rounded-lg bg-secondary"
						></motion.span>
					)}
				</button>
			)}
		</HeadlessTab>
	);
}

export function VerticalTabs({
	children,
	selectedIndex,
	onChange
}: {
	children: ReactNode;
	selectedIndex: number | undefined;
	onChange: (index: number) => void;
}) {
	return (
		<HeadlessTab.Group vertical={true} selectedIndex={selectedIndex} onChange={onChange}>
			<HeadlessTab.List className="flex flex-col gap-2">{children}</HeadlessTab.List>
		</HeadlessTab.Group>
	);
}

export function VerticalTab({ children }: { children: ReactNode }) {
	return (
		<HeadlessTab as={Fragment}>
			{({ selected }) => (
				<li className="grid grid-cols-[4px_1fr] gap-2">
					{selected && (
						<motion.span
							layoutId="selectedTab"
							className="flex h-full w-[4px] rounded-lg bg-secondary"
						></motion.span>
					)}
					{!selected && <span></span>}
					<button
						type="button"
						className={`w-fit py-1 focus:ring-0 focus-visible:outline-secondary ${
							selected ? "font-semibold text-secondary" : "text-light"
						}`}
					>
						{children}
					</button>
				</li>
			)}
		</HeadlessTab>
	);
}
