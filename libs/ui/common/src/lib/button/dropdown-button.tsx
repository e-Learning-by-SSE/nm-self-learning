import React, { ReactNode } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export function DropdownButton({
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

	const positionClasses = dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2";

	return (
		<Menu as="div" className="relative inline-block w-full text-left">
			{({ open }) => (
				<>
					<MenuButton
						title={title}
						className={`inline-flex items-center gap-2 rounded-md px-4 py-2`}
					>
						{button}
					</MenuButton>

					<MenuItems
						className={`absolute z-10 ${positionClasses} w-max min-w-[8rem] max-w-xs rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
					>
						<div className="py-1 max-h-48 overflow-auto text-sm">
							{childrenArray.map((element, i) => (
								<MenuItem key={i}>
									{({ focus }) => (
										<div
											className={`w-full text-left px-3 py-1 ${
												focus
													? "bg-gray-100 text-gray-900"
													: "text-gray-700"
											}`}
										>
											{element}
										</div>
									)}
								</MenuItem>
							))}
						</div>
					</MenuItems>
				</>
			)}
		</Menu>
	);
}
