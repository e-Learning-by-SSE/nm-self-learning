import React, { ReactNode, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { UniversalButton } from "./universal-button";

export function DropdownButton({
	lable,
	title,
	children
}: {
	lable: string;
	title: string;
	children: ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="">
			<UniversalButton onClick={() => setIsOpen(!isOpen)} title={title}>
				<div className="flex items-center space-x-1">
					<span className="flex text-gray-600">{lable}</span>
					<ChevronDownIcon className="flex text-gray-600" />
				</div>
			</UniversalButton>
			{isOpen && (
				<div className="absolute mt-2 w-48 rounded-md bg-white py-2 shadow-xl">
					{children}
				</div>
			)}
		</div>
	);
}

export default DropdownButton;
