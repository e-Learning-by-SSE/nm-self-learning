import React, { ReactNode } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";

export function DropdownButton({
	title,
	backgroundColor = "",
	chevronColor = "",
	hover = "",
	position = "bottom",
	children
}: {
	title: string;
	backgroundColor?: string;
	chevronColor?: string;
	hover?: string;
	position?: "top" | "bottom";
	children: ReactNode;
}) {
	const childrenArray = React.Children.toArray(children);
	const buttonContent = childrenArray[0];
	const dropdownContent = childrenArray[1];

	const positionClasses = position === "top" ? "bottom-full mb-2" : "top-full mt-2";

	return (
		<Menu as="div" className="relative inline-block w-full text-left">
			{({ open }) => (
				<>
					<MenuButton
						title={title}
						className={`inline-flex items-center gap-2 rounded-md px-4 py-2 ${backgroundColor} ${hover}`}
					>
						{open ? (
							<ChevronUpIcon className={`h-5 w-5 ${chevronColor}`} />
						) : (
							<ChevronDownIcon className={`h-5 w-5 ${chevronColor}`} />
						)}
						{buttonContent}
					</MenuButton>

					<MenuItems
						className={`absolute z-20 ${positionClasses} w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
					>
						<div className="flex flex-col p-2 gap-2">{dropdownContent}</div>
					</MenuItems>
				</>
			)}
		</Menu>
	);
}
