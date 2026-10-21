import { useTranslation } from "next-i18next";
import { SkillFormModel } from "@self-learning/types";
import { Alert, SimpleDialog } from "@self-learning/ui/common";
import { useState } from "react";

export function ShowCyclesDialog({ cycleParticipants }: { cycleParticipants: SkillFormModel[] }) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const [openExplanation, setShowDialog] = useState<boolean>(false);

	if (cycleParticipants.length > 0) {
		return (
			<>
				<Alert
					type={{
						severity: "ERROR",
						message: (
							<div>
								<button
									onClick={() => setShowDialog(true)}
									className="text-left hover:cursor-pointer hover:text-red-700"
								>
									<span>{t("Skills_Cycles_Warning")}</span>
								</button>
							</div>
						)
					}}
				/>
				{openExplanation && (
					<SimpleDialog
						name={t("Skills_Cycles_Title")}
						onClose={() => setShowDialog(false)}
					>
						<CycleComponents cycles={cycleParticipants} />
					</SimpleDialog>
				)}
			</>
		);
	}

	return null;
}
// TODO darstellung optimieren
function CycleComponents<S extends { name: string }>({ cycles }: { cycles: S[] }) {
	return (
		<>
			{cycles.map((cycle, index) => {
				return (
					<button key={index} className="m-5 rounded-md bg-c-surface-3 p-5">
						{cycle.name}
					</button>
				);
			})}
		</>
	);
}

export type SkillProps = { repoId: string; skills: SkillFormModel[] };
