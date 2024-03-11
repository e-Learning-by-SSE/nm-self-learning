import { TrashIcon } from "@heroicons/react/outline";
import React, { ReactNode } from "react";
import { XIcon } from "@heroicons/react/solid";

export function DeleteButton({
	onDelete,
	title,
	additionalClassNames,
	children
}: {
	onDelete: () => void;
	title: string;
	additionalClassNames?: string;
	children?: ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onDelete}
			title={title ? title : "Entfernen"}
			className={`rounded-md border border-transparent bg-red-500 px-4 py-2 hover:bg-red-600 ${additionalClassNames}`}
		>
			{children ? children : <TrashIcon className="h-5 w-5" />}
		</button>
	);
}

export function TransparentDeleteButton({
	onDelete,
	title,
	additionalClassNames,
	children
}: {
	onDelete: () => void;
	title: string;
	additionalClassNames?: string;
	children?: ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onDelete}
			title={title}
			className={`rounded-md border border-transparent bg-transparent ${additionalClassNames}`}
		>
			{children || <XIcon className="h-5 w-5 text-gray-600 hover:text-red-600" />}
		</button>
	);
}
