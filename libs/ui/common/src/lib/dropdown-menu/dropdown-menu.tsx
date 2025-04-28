import React, { Fragment, ReactNode } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";

export function DropdownMenu({
	title,
	dropdownPosition = "bottom",
	button,
	children
}: {
	title: string;
	dropdownPosition?: "top" | "bottom";
	button: ReactNode;
	children: ReactNode;
}) {
	const childrenArray = React.Children.toArray(children);

	return (
		<Menu as="div" className="relative inline-block w-full text-left">
			<>
				<MenuButton
					title={title}
					className={`inline-flex items-center gap-2 rounded-md px-4 py-2`}
				>
					{button}
				</MenuButton>

				<Transition
					as={Fragment}
					enter="transition ease-out duration-100"
					enterFrom="opacity-0 scale-95"
					enterTo="opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="opacity-100 scale-100"
					leaveTo="opacity-0 scale-95"
				>
					<MenuItems
						anchor={dropdownPosition}
						className={`z-10 w-max min-w-[8rem] max-w-xs rounded-md bg-white shadow-lg`}
					>
						<div className="py-1 max-h-48 overflow-auto text-sm">
							{childrenArray.map((element, i) => (
								<MenuItem key={i}>
									{({ focus }) => (
										<div
											className={`w-full text-left px-3 py-1 ${
												focus
													? "text-secondary border border-secondary"
													: "border border-transparent text-gray-700"
											} flex items-center`}
										>
											{element}
										</div>
									)}
								</MenuItem>
							))}
						</div>
					</MenuItems>
				</Transition>
			</>
		</Menu>
	);
}
