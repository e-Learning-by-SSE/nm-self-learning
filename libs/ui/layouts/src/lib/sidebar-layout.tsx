import { MenuIcon } from "@heroicons/react/outline";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { DefaultSidebar } from "./sidebar";

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
					<MenuIcon height="24" />
				</button>
			)}

			<div className={`w-full py-16 ${open && "sm:ml-64"}`}>
				<div className="mx-auto flex w-full flex-col px-4 lg:max-w-screen-lg">
					{children}
				</div>
			</div>
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
		const hideSidebar = localStorage.getItem("hideSidebar");
		if (hideSidebar) _setOpen(false);
	}, []);

	const setOpen = useCallback((open: boolean) => {
		if (open) {
			localStorage.removeItem("hideSidebar");
			_setOpen(true);
		} else {
			localStorage.setItem("hideSidebar", JSON.stringify(true));
			_setOpen(false);
		}
	}, []);

	return [open, setOpen];
}
