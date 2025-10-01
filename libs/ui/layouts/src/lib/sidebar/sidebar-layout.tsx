"use client";
import { Bars4Icon, ViewColumnsIcon } from "@heroicons/react/24/outline";
import { PropsWithChildren, ReactNode, useCallback, useEffect, useState } from "react";
import { DefaultSidebar } from "./sidebar-default";
import { loadFromLocalStorage, saveToLocalStorage } from "@self-learning/local-storage";
import Link from "next/link";

export function SecondarySidebarLayout({
	children,
	header,
	content,
	footer
}: {
	children: React.ReactNode;
	header: React.ReactNode;
	content: React.ReactNode;
	footer: React.ReactNode;
}) {
	const [open, setOpen] = useSidebarState();
	return (
		<div
			className="flex h-ful
		l w-full"
		>
			{open ? (
				<div className="relative">
					<SecondarySidebar
						footer={footer}
						header={header}
						content={content}
						onClose={() => setOpen(false)}
					/>
				</div>
			) : (
				// Sidebar is closed
				<button onClick={() => setOpen(true)} className="fixed top-20 right-20">
					<Bars4Icon height="24" />
				</button>
			)}

			<div className={`w-full`}>{children}</div>
		</div>
	);
}

/**
 * Returns a component that can be used to embed page content into a layout with a collapsible sidebar.
 *
 * @example
 * <SidebarLayout>
 * 	<h1>Example Page</h1>
 * 	<div>... content ...</div>
 * </SidebarLayout>
 */
export function DefaultSidebarLayout({ children }: PropsWithChildren<unknown>) {
	const defaultSidebar = DefaultSidebar({ setOpen: () => {} });
	return <SecondarySidebarLayout {...defaultSidebar}>{children}</SecondarySidebarLayout>;
}

/**
 * Returns a tuple containing the current state of the sidebar and a function to set its state.
 * Calling this function will also set/remove the `hideSidebar` key in the `localStorage` to
 * remember user preference.
 *
 * @example
 * const [open, setOpen] = useSidebarState();
 *
 * function closeSidebar() {
 * 	setOpen(false);
 * }
 */
function useSidebarState(): [open: boolean, setOpen: (open: boolean) => void] {
	const [open, _setOpen] = useState(true);

	useEffect(() => {
		const hideSidebar = loadFromLocalStorage("user_hideSidebar");
		if (hideSidebar) _setOpen(false);
	}, []);

	const setOpen = useCallback((open: boolean) => {
		if (open) {
			saveToLocalStorage("user_hideSidebar", !open);
			_setOpen(true);
		} else {
			saveToLocalStorage("user_hideSidebar", open);
			_setOpen(false);
		}
	}, []);

	return [open, setOpen];
}

export function SecondarySidebar({
	header,
	content,
	footer,
	onClose
}: {
	header: ReactNode;
	content: ReactNode;
	footer: ReactNode;
	onClose?: () => void;
}) {
	return (
		<aside className="hidden lg:sticky lg:top-0 lg:right-0 lg:z-10 lg:flex lg:w-64 lg:flex-col lg:overflow-hidden lg:bg-white lg:border-l">
			<div className="flex justify-end p-2">
				<button
					className="text-slate-900 hover:text-black"
					title="Close Sidebar"
					onClick={onClose}
				>
					<ViewColumnsIcon height="24" />
				</button>
			</div>
			{header}
			<ScrollableContent>{content}</ScrollableContent>
			{footer}
		</aside>
	);
}

// old sidebar layout instead of the upper Navbar
export function NavSidebar({
	header,
	content,
	footer
}: {
	header: ReactNode;
	content: ReactNode;
	footer: ReactNode;
}) {
	return (
		<div className="fixed top-0 left-0 z-10 flex h-full w-full flex-col overflow-hidden bg-white sm:w-64">
			{header}
			<ScrollableContent>{content}</ScrollableContent>
			{footer}
		</div>
	);
}

function ScrollableContent({ children }: PropsWithChildren<unknown>) {
	return <div className="Sidebar scroll flex-grow overflow-auto">{children}</div>;
}

export function SidebarLink({
	href,
	text,
	icon,
	isActive
}: {
	href: string;
	text: string;
	icon: JSX.Element;
	isActive: boolean;
}) {
	return (
		<Link
			href={href}
			className={`flex items-center gap-4 rounded py-2 px-2 ${
				isActive ? "bg-secondary text-white" : "text-light hover:bg-indigo-50"
			}`}
		>
			{icon}
			<span className={`text-sm ${isActive && "font-semibold"}`}>{text}</span>
		</Link>
	);
}
