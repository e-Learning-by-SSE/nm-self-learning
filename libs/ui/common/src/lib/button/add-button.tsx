import React, { ReactNode } from "react";
import { PlusIcon } from "@heroicons/react/solid";
import { UniversalButton } from "./universal-button";
import { DropdownButton } from "./dropdown-button";

export function AddButton({
	onAdd,
	title,
	size,
	additionalClassNames,
	children
}: {
	onAdd: () => void;
	title?: string;
	size?: string;
	additionalClassNames?: string;
	children?: ReactNode;
}) {
	return (
		<UniversalButton
			onClick={onAdd}
			title={title ? title : "Hinzufügen"}
			backgroundColor={"btn-primary"}
			border={"rounded-md border border-transparent"}
			focus={"focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"}
			hover={"hover:bg-emerald-700"}
			size={size || "px-4 py-2"}
			additionalClassNames={additionalClassNames}
		>
			{children ? (
				<div className="flex items-center space-x-2">
					<PlusIcon className="h-5 w-5" />
					<div>{children}</div>
				</div>
			) : (
				<PlusIcon className="h-5 w-5" />
			)}
		</UniversalButton>
	);
}

export function AddDropDownButton({ lable, children }: { lable: string; children: ReactNode }) {
	return (
		<DropdownButton
			title="Options"
			backgroundColor={"btn-primary"}
			focus={"focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"}
			hover={"hover:bg-secondary"}
			chevronColor={"text-white"}
		>
			<span className={"text-white"}>{lable}</span>
			{children}
		</DropdownButton>
	);
}
