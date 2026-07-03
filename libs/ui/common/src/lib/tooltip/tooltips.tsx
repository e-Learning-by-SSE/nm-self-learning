"use client";
import { QuestionMarkCircleIcon as QuestionMarcOutline } from "@heroicons/react/24/outline";
import { QuestionMarkCircleIcon as QuestionMarcSolid } from "@heroicons/react/24/solid";
import { useState } from "react";
import {
	autoUpdate,
	flip,
	offset,
	shift,
	useFloating,
	useHover,
	useInteractions
} from "@floating-ui/react";

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
				<QuestionMarcOutline className="h-4 w-4 text-c-text-muted" />
			) : (
				<QuestionMarcSolid className="h-4 w-4 text-c-text-muted" />
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

	const {
		refs: { setReference, setFloating },
		floatingStyles,
		context
	} = useFloating({
		open: showTooltip,
		onOpenChange: setShowTooltip,
		placement,
		strategy: "fixed",
		whileElementsMounted: autoUpdate,
		middleware: [offset(6), flip(), shift({ padding: 8 })]
	});

	const hover = useHover(context);
	const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

	return (
		<>
			<div
				ref={setReference}
				{...getReferenceProps()}
				className={`cursor-pointer ${className}`}
			>
				{children}
			</div>
			{showTooltip && (
				<div
					ref={setFloating}
					style={floatingStyles}
					{...getFloatingProps()}
					className="z-50 rounded-lg bg-gray-800 p-2 text-sm text-white shadow-md"
				>
					{content}
				</div>
			)}
		</>
	);
}
