"use client";
import { QuestionMarkCircleIcon as QuestionMarcOutline } from "@heroicons/react/24/outline";
import { QuestionMarkCircleIcon as QuestionMarcSolid } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";
import { usePopper } from "react-popper";

export function QuestionMarkTooltip({
	content,
	type = "solid"
}: {
	content: string;
	type?: "outline" | "solid";
}) {
	return (
		<Tooltip content={content}>
			{type === "outline" ? (
				<QuestionMarcOutline className="h-4 w-4 text-gray-500" />
			) : (
				<QuestionMarcSolid className="h-4 w-4 text-gray-500" />
			)}
		</Tooltip>
	);
}
export function Tooltip({
	children,
	content,
	placement = "top",
	className = ""
}: {
	children: React.ReactNode;
	content: string;
	placement?: "top" | "bottom" | "left" | "right";
	className?: string;
}) {
	const [showTooltip, setShowTooltip] = useState(false);
	const referenceElement = useRef(null);
	const popperElement = useRef(null);
	const { styles, attributes } = usePopper(referenceElement.current, popperElement.current, {
		placement: placement
	});

	return (
		<>
			<div
				ref={referenceElement}
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				className={`cursor-pointer ${className}`}
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
					{content}
				</div>
			)}
		</>
	);
}
