import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { MinorScaleFadeIn } from "@self-learning/ui/common";

/**
 * A reusable dropdown menu component using Headless UI's Menu.
 * The dropdown width is dynamically matched to the trigger button.
 *
 * @component
 *
 * @param {string} title - Tooltip text shown on hover over the menu button.
 * @param {"top" | "bottom"} [dropdownPosition="bottom"] - Position of the dropdown menu (above or below the button).
 * @param {(focus: boolean) => string} [customFocusStyle] - Optional function to customize class names for focused items.
 * @param {ReactNode} button - The button content that triggers the dropdown (e.g., text or icon).
 * @param {ReactNode} children - Menu items to display inside the dropdown, typically as `<span>` or `<div>`.
 *
 * @example
 * <DropdownMenu
 *   title="Open user menu"
 *   dropdownPosition="bottom"
 *   button={<UserAvatar />}
 *   customFocusStyle={(focus) => focus ? "bg-gray-100 text-black" : ""}
 * >
 *   <span>Profile</span>
 *   <span>Settings</span>
 *   <span>Logout</span>
 * </DropdownMenu>
 */
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
	const buttonRef = useRef<HTMLDivElement>(null);
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
				<MenuButton title={title} className="inline-flex items-center rounded-md px-4">
					<div ref={buttonRef}>{button}</div>
				</MenuButton>

				<MinorScaleFadeIn>
					{menuWidth && (
						<MenuItems
							anchor={dropdownPosition}
							style={{
								minWidth: buttonRef.current?.offsetWidth || "auto"
							}}
							className={`absolute z-10 bg-white shadow-lg max-h-64 overflow-auto text-sm ${dropdownPosition === "top" ? "rounded-t" : "rounded-b"}`}
						>
							{childrenArray.map((element, i) => (
								<MenuItem key={i}>
									{({ focus }) => (
										<div
											className={`w-full text-left ${
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
						</MenuItems>
					)}
				</MinorScaleFadeIn>
			</>
		</Menu>
	);
}
