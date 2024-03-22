import React, { ReactNode } from "react";
import { PlusIcon } from "@heroicons/react/solid";
import { DropdownButton } from "./dropdown-button";

export function AddButton({
	onAdd,
	title,
	size,
	label,
	additionalClassNames
}: {
	onAdd: () => void;
	title: string;
	size?: string;
	label?: ReactNode;
	additionalClassNames?: string;
}) {
	return (
		<button
			type="button"
			onClick={onAdd}
			title={title || "Hinzufügen"}
			className={`btn-primary rounded-md border border-transparent hover:bg-emerald-700 ${
				size ? size : "px-4 py-2"
			} ${additionalClassNames}`}
		>
			{label ? (
				<div className="flex items-center space-x-2">
					<PlusIcon className="h-5 w-5" />
					<div>{label}</div>
				</div>
			) : (
				<PlusIcon className="h-5 w-5" />
			)}
		</button>
	);
}

export function AddDropDownButton({ label, children }: { label: string; children: ReactNode }) {
	return (
		<DropdownButton
			title="Aufgabentyp hinzufügen"
			backgroundColor={"btn-primary"}
			hover={"hover:bg-emerald-700"}
			chevronColor={"text-white"}
		>
			<span className={"text-white"}>{label}</span>
			{children}
		</DropdownButton>
	);
}
