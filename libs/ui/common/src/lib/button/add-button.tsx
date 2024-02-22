import React from "react";
import { PlusIcon } from "@heroicons/react/solid";

export function AddButton({
	onAdd,
	lable,
	title
}: {
	onAdd: () => void;
	lable?: string;
	title?: string;
}) {
	return (
		<button
			type="button"
			className="inline-flex items-center justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-base font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
			onClick={() => onAdd()}
			aria-label="Add"
			title={title}
		>
			{lable ? <span>{lable}</span> : <PlusIcon className="h-5 w-5" />}
		</button>
	);
}
