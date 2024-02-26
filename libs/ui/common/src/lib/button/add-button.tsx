import React, { ReactNode } from "react";
import { PlusIcon } from "@heroicons/react/solid";
import { UniversalButton } from "./universal-button";

export function AddButton({
	onAdd,
	title,
	children
}: {
	onAdd: () => void;
	title?: string;
	children?: ReactNode;
}) {
	return (
		<UniversalButton
			onClick={onAdd}
			title={title ? title : "Hinzufügen"}
			backgroundColor={"btn-primary"}
			border={"rounded-md border border-transparent"}
			focus={"focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"}
			hover={"hover:bg-emerald-600"}
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
