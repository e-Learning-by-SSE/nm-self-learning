import {
	MenuItem as HeadlessMenuItem,
	MenuButton as HeadlessMenuButton,
	MenuItems as HeadlessMenuItems,
	Menu as HeadlessMenu
} from "@headlessui/react";
import { PropsWithChildren, ReactElement } from "react";

export function Menu({ button, children }: PropsWithChildren<{ button: ReactElement }>) {
	return (
		<HeadlessMenu as="div" className="relative flex">
			<HeadlessMenuButton className="flex items-center gap-1">{button}</HeadlessMenuButton>
			<HeadlessMenuItems className="absolute right-0 top-8 z-10 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white text-sm shadow-lg ring-1 ring-emerald-500 ring-opacity-5 focus:outline-none">
				{children}
			</HeadlessMenuItems>
		</HeadlessMenu>
	);
}

export function MenuItem({ render }: { render: (active: boolean) => React.ReactNode }) {
	return (
		<HeadlessMenuItem as="div" className="p-1">
			{({ focus }) => (
				<button
					className={`${
						focus ? "bg-emerald-500 text-white" : ""
					} flex w-full items-center gap-2 rounded-md px-2 py-2`}
				>
					{render(focus)}
				</button>
			)}
		</HeadlessMenuItem>
	);
}
