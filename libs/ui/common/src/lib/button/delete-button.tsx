import { TrashIcon } from "@heroicons/react/outline";
import React, { ReactNode } from "react";
import { UniversalButton } from "./universal-button";

export function DeleteButton({
	onDelete,
	title,
	children
}: {
	onDelete: () => void;
	lable?: string;
	title?: string;
	children?: ReactNode;
}) {
	return (
		<UniversalButton
			onClick={onDelete}
			title={title ? title : "Entfernen"}
			backgroundColor={"bg-red-500"}
			border={"rounded-md border border-transparent"}
			focus={"focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"}
			hover={"hover:bg-red-600"}
			size={"px-4 py-2"}
		>
			{children ? children : <TrashIcon className="h-5 w-5" />}
		</UniversalButton>
	);
}
