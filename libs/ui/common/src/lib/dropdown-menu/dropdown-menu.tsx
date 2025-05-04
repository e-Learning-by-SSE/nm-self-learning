import React, { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";

export function DropdownMenu({
	title,
	dropdownPosition = "bottom",
	customFocusStyle,
	button,
	children
}: {
	title: string;
	dropdownPosition?: "top" | "bottom";
	customFocusStyle?: (focus: boolean) => string;
	button: ReactNode;
	children: ReactNode;
}) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [menuWidth, setMenuWidth] = useState<number | null>(null);

	const childrenArray = React.Children.toArray(children);

	useEffect(() => {
		if (buttonRef.current) {
			setMenuWidth(buttonRef.current.offsetWidth);
		}
	}, []);

	return (
		<Menu as="div" className="relative inline-block text-left w-fit">
			<>
				<MenuButton
					ref={buttonRef}
					title={title}
					className="inline-flex items-center rounded-md px-4"
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
					{menuWidth && (
						<MenuItems
							anchor={dropdownPosition}
							style={{
								minWidth: buttonRef.current?.offsetWidth || "auto"
							}}
							className="absolute z-10 rounded-md bg-white shadow-lg overflow-hidden"
						>
							<div className="py-1 max-h-48 overflow-auto text-sm">
								{childrenArray.map((element, i) => (
									<MenuItem key={i}>
										{({ focus }) => (
											<div
												className={`w-full text-left px-3 py-1 ${
													customFocusStyle
														? customFocusStyle(focus)
														: focus
															? "bg-emerald-500 text-white"
															: ""
												} flex items-center`}
											>
												{element}
											</div>
										)}
									</MenuItem>
								))}
							</div>
						</MenuItems>
					)}
				</Transition>
			</>
		</Menu>
	);
}
