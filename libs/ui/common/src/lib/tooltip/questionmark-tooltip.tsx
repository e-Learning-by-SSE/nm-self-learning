import { QuestionMarkCircleIcon as QuestionMarcOutline } from "@heroicons/react/outline";
import { QuestionMarkCircleIcon as QuestionMarcSolid } from "@heroicons/react/solid";

import { Tooltip } from "@mui/material";

export function QuestionMarkTooltip({
	tooltipText,
	type = "solid"
}: {
	tooltipText: string;
	type?: "outline" | "solid";
}) {
	return (
		<Tooltip title={tooltipText}>
			{type === "outline" ? (
				<QuestionMarcOutline className="h-4 w-4 text-gray-500" />
			) : (
				<QuestionMarcSolid className="h-4 w-4 text-gray-500" />
			)}
		</Tooltip>
	);
}
