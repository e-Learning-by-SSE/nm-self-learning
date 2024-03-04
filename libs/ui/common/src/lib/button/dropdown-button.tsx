import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { UniversalButton } from "./universal-button";

export function DropdownButton({
	title,
	backgroundColor,
	chevronColor,
	hover,
	focus,
	children
}: {
	title: string;
	backgroundColor?: string;
	chevronColor?: string;
	hover?: string;
	focus?: string;
	children: ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const childrenArray = React.Children.toArray(children);
	const withoutFirst = childrenArray.slice(1);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [dropdownRef]);

	return (
		<div className="relative" ref={dropdownRef}>
			<div className={"inline-flex items-center justify-center"}>
				<UniversalButton
					onClick={event => {
						event?.stopPropagation();
						setIsOpen(!isOpen);
					}}
					title={title}
					size={"px-4 py-2"}
					backgroundColor={backgroundColor}
					hover={hover}
					focus={focus}
				>
					{/*First Child Prop is used to Display the Button Text*/}
					{isOpen ? (
						<ChevronUpIcon className={`h-5 w-5 ${chevronColor ? chevronColor : ""}`} />
					) : (
						<ChevronDownIcon
							className={`h-5 w-5 ${chevronColor ? chevronColor : ""}`}
						/>
					)}
					{childrenArray[0]}
				</UniversalButton>
			</div>
			{isOpen && (
				<div
					className="absolute w-full overflow-auto bg-transparent shadow-md"
					onClick={() => setIsOpen(false)}
				>
					{withoutFirst}
				</div>
			)}
		</div>
	);
}
