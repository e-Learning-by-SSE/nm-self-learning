import React from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import { GreyBoarderButton } from "./grey-boarder-button";

export function EditButton({
	onEdit,
	title,
	buttonTitle
}: {
	onEdit: () => void;
	title: string;
	buttonTitle?: string;
}) {
	return (
		<GreyBoarderButton onClick={onEdit} title={title}>
			{buttonTitle && buttonTitle !== "" ? (
				<div className="flex items-center space-x-2">
					<PencilIcon className="h-5 w-5 text-gray-500" />
					<span className="text-gray-600">{buttonTitle}</span>
				</div>
			) : (
				<PencilIcon className="h-5 w-5 text-gray-500" />
			)}
		</GreyBoarderButton>
	);
}
