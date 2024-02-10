import { QuestionMarkCircleIcon as QuestionMarcOutline } from "@heroicons/react/outline";
import { QuestionMarkCircleIcon as QuestionMarcSolid } from "@heroicons/react/solid";
import { useRef, useState } from "react";
import { usePopper } from "react-popper";

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
export function Tooltip({ children, title }: { children: React.ReactNode; title: string }) {
	const [showTooltip, setShowTooltip] = useState(false);
	const referenceElement = useRef(null);
	const popperElement = useRef(null);
	const { styles, attributes } = usePopper(referenceElement.current, popperElement.current, {
		placement: "top"
	});

	return (
		<>
			<div
				ref={referenceElement}
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				className="cursor-pointer"
			>
				{children}
			</div>
			{showTooltip && (
				<div
					ref={popperElement}
					style={styles["popper"]}
					{...attributes["popper"]}
					className="rounded-lg bg-gray-800 p-2 text-sm text-white shadow-md"
				>
					{title}
				</div>
			)}
		</>
	);
}

export default Tooltip;
