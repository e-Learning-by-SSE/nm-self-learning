import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { DropwdownTransition } from "@self-learning/ui/common";

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

				<DropwdownTransition>
					{menuWidth && (
						<MenuItems
							anchor={dropdownPosition}
							style={{
								minWidth: buttonRef.current?.offsetWidth || "auto"
							}}
							className="absolute z-10 rounded-md bg-white shadow-lg overflow-hidden"
						>
							<div className="py-1 max-h-64 overflow-auto text-sm">
								{childrenArray.map((element, i) => (
									<MenuItem key={i}>
										{({ focus }) => (
											<div
												className={`text-left ${
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
				</DropwdownTransition>
			</>
		</Menu>
	);
}
