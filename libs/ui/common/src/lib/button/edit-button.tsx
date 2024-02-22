import React from "react";
import { PencilIcon } from "@heroicons/react/solid";
import { UniversalButton } from "./universal-button";

export function EditButton({ onEdit, title }: { onEdit: () => void; title?: string }) {
	return (
		<UniversalButton onClick={onEdit} title={title}>
			<PencilIcon className="h-5 w-5 text-gray-500" />
		</UniversalButton>
	);
}
