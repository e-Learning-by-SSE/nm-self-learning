import { TrashIcon } from "@heroicons/react/outline";
import React, { ReactNode } from "react";
import { UniversalButton } from "./universal-button";

export function DeleteButton({
	onDelete,
	title,
	additionalClassNames,
	children
}: {
	onDelete: () => void;
	title?: string;
	additionalClassNames?: string;
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
			additionalClassNames={additionalClassNames}
		>
			{children ? children : <TrashIcon className="h-5 w-5" />}
		</UniversalButton>
	);
}

export function TransparentDeleteButton({
	onDelete,
	title,
	additionalClassNames,
	children
}: {
	onDelete: () => void;
	title?: string;
	additionalClassNames?: string;
	children?: ReactNode;
}) {
	return (
		<UniversalButton
			onClick={onDelete}
			title={title ? title : "Entfernen"}
			backgroundColor={"bg-transparent"}
			border={"rounded-md border border-transparent"}
			focus={"focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"}
			hover={" "}
			size={" "}
			additionalClassNames={additionalClassNames}
		>
			{children ? (
				children
			) : (
				<TrashIcon className="h-5 w-5 text-gray-600 hover:text-red-600" />
			)}
		</UniversalButton>
	);
}
