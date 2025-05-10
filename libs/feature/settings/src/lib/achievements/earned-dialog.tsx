import { GameifyDialog } from "@self-learning/ui/common";
import { useState } from "react";
import { useTranslation } from "next-i18next";

export function EarnedDialog({
	achievement,
	open,
	onClose
}: {
	achievement: {
		name: string;
		description: string;
	};
	open: boolean;
	onClose: () => void;
}) {
	return (
		<GameifyDialog onClose={onClose} open={open} title={"Errungenschaft freigeschaltet!"}>
			<div className="flex flex-col gap-4">
				<h2 className="text-2xl font-bold">{achievement.name}</h2>
				<p className="text-gray-500">{achievement.description}</p>
			</div>
			<div className="flex justify-end">
				<button className="btn-gamify animate-highlight-shimmering" onClick={onClose}>
					Einlösen
				</button>
			</div>
		</GameifyDialog>
	);
}

// export function EarnedDialogSkeleton() {

export function EarnedDialogControlled() {
	const [open, setOpen] = useState(true);
	return (
		<EarnedDialog
			achievement={{ name: "Test", description: "Test description" }}
			open={open}
			onClose={() => setOpen(false)}
		/>
	);
}
