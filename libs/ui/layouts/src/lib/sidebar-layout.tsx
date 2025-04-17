import { Bars4Icon } from "@heroicons/react/24/outline";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { DefaultSidebar } from "./sidebar";
import { loadFromLocalStorage, saveToLocalStorage } from "@self-learning/local-storage";

/**
 * Returns a component that can be used to embed page content into a layout with a collapsible sidebar.
 *
 * @example
 * <SidebarLayout>
 * 	<h1>Example Page</h1>
 * 	<div>... content ...</div>
 * </SidebarLayout>
 */
export function SidebarLayout({ children }: PropsWithChildren<unknown>) {
	const [open, setOpen] = useSidebarState();

	return (
		<div className="flex h-full w-full">
			{open ? (
				<DefaultSidebar setOpen={setOpen} />
			) : (
				// Sidebar is closed
				<button onClick={() => setOpen(true)} className="fixed top-4 left-4">
					<Bars4Icon height="24" />
				</button>
			)}

			<div className={`w-full ${open && "sm:ml-64"}`}>{children}</div>
		</div>
	);
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
			saveToLocalStorage("user_hideSidebar", open);
			_setOpen(true);
		} else {
			saveToLocalStorage("user_hideSidebar", open);
			_setOpen(false);
		}
	}, []);

	return [open, setOpen];
}
