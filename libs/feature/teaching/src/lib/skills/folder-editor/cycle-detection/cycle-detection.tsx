import { SkillFormModel } from "@self-learning/types";
import { Alert, SimpleDialog } from "@self-learning/ui/common";
import { useState } from "react";
import { CycleComponents } from "./cycle-components";
import { OptionalVisualizationWithRequiredId, SkillFolderVisualization } from "../skill-display";

export function ShowCyclesDialog({
	cycleParticipants,
	updateSkillDisplay,
	skillDisplayData
}: {
	cycleParticipants: SkillFormModel[];
	updateSkillDisplay: (displayUpdate: OptionalVisualizationWithRequiredId[] | null) => void;
	skillDisplayData: Map<string, SkillFolderVisualization>;
}) {
	const [openExplanation, setShowDialog] = useState<boolean>(false);

	const onClick = (selectedCycleParticipant: SkillFormModel) => {
		// eslint-disable-next-line no-restricted-globals
		confirm("Möchten Sie die betroffenen Skills anzeigen?");

		const updates: OptionalVisualizationWithRequiredId[] = [];

		skillDisplayData.forEach((value) => {
			updates.push(
				{
					...value,
					isSelected: false,
					isExpanded: false
				}
			);
		});

		cycleParticipants.forEach((cycle, index) => {
			if(cycle.id === selectedCycleParticipant.id) return; // Skip the selected participant
	
			updates.push({
				id: cycle.id,
				isSelected: false,
				isExpanded: true,
				isCycleMember: index !== 0,
				hasNestedCycleMembers: index === 0 
			});
		});

		updates.push(
			{
				id: selectedCycleParticipant.id,
				isSelected: true,
				isExpanded: true
			}
		);

		updateSkillDisplay(updates);
		setShowDialog(false);
	};

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
						size="md"
						onClose={() => setShowDialog(false)}
					>
						<CycleComponents cycles={cycleParticipants} onClick={onClick} />
					</SimpleDialog>
				)}
			</>
		);
	}

	return null;
}

export type SkillProps = { repoId: string; skills: SkillFormModel[] };
