import { SkillFormModel } from "@self-learning/types";
import { Alert, SimpleDialog } from "@self-learning/ui/common";
import { useState } from "react";

export function ShowCyclesDialog({ cycleParticipants }: { cycleParticipants: SkillFormModel[] }) {
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
									<span>
										Warnung: In Ihrer Modellierung der Lernziele ist ein Zyklus
										vorhanden. Aufgrund dessen kann der Algorithmus keinen
										gültigen Lernpfad mit den im Zyklus beteiligten Lernzielen
										finden. Die angegebenen Pfadziele sind nicht erreichbar und
										können nur privat gespeichert werden. Die betroffenen Skills
										können durch Klicken auf diesen Text angezeigt werden.
									</span>
								</button>
							</div>
						)
					}}
				/>
				{openExplanation && (
					<SimpleDialog
						name={"Zyklen - Darstellung"}
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
					<button key={index} className="m-5 rounded-md bg-gray-200 p-5">
						{cycle.name}
					</button>
				);
			})}
		</>
	);
}

export type SkillProps = { repoId: string; skills: SkillFormModel[] };
