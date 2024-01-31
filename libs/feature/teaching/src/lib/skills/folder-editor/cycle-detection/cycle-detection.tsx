import { SkillFormModel } from "@self-learning/types";
import { findParentsOfCycledSkills } from "@e-learning-by-sse/nm-skill-lib";
import { Alert, SimpleDialog } from "@self-learning/ui/common";
import { useState } from "react";
import { CycleType } from "../skill-display";

export function checkCycles2(skillMap: Map<string, SkillFormModel>) {
	const skills = Array.from(skillMap.values()).map(skill => ({
		id: skill.id,
		name: skill.name,
		repositoryId: skill.repositoryId,
		nestedSkills: skill.children
	}));

	const parentList = findParentsOfCycledSkills(skills);
	if (!parentList) return [];
	const childs = parentList.cycles;
	const parents = parentList.nestingSkills;
	const getCycleItemsWithCycleType = (cycle: any[], cycleType: CycleType) => {
		return cycle
			.map(cycleItem => {
				const item = skillMap.get(cycleItem.id);
				if (item) {
					return {
						...item,
						id: cycleItem.id,
						cycleType
					};
				}
				return null;
			})
			.filter(item => item)
			.map(item => item as NonNullable<typeof item>);
	};

	const cycleChilds = childs.flatMap(cycle => getCycleItemsWithCycleType(cycle, "child"));
	const cycleParents = getCycleItemsWithCycleType(parents, "parent");
	// for (const cycle of cycles) {
	// 	for (const cycleItem of cycle) {
	// 		const folderItem = skillMap.get(cycleItem.id);
	// 		if (!folderItem) continue;
	// 		foundCycleParticipants.push({ id: cycleItem.id, item: folderItem });
	// 	}
	// }
	return [...cycleChilds, ...cycleParents];

	// // const foundCycleParticipants: { id: string; item: FolderItem }[] = cycles.flatMap(cycle =>
	// // 	cycle
	// // 		.map(({ id }) => ({ id, item: { ...skillMap.get(id), cycle: "taskbar" } }))
	// // 		.filter(Boolean)
	// // );

	// parentList.forEach(parent => {
	// 	const folderItem = skillMap.get(parent.id);
	// 	if (!folderItem) return;
	// 	const newFolderItem = { ...folderItem, parent: "taskbar" };
	// 	foundCycleParticipants.push({ id: parent.id, item: newFolderItem });
	// });

	// return foundCycleParticipants;
}

// function checkCyclesOld(skillMap: Map<string, FolderItem>, item?: FolderItem) {
// 	const skills = Array.from(skillMap.values()).map(({ skill }) => ({
// 		id: skill.id,
// 		name: skill.name,
// 		repositoryId: skill.repositoryId,
// 		nestedSkills: skill.children
// 	}));

// 	const parents = findParentsOfCycledSkills(skills);

// 	if (!parents) return [];
// 	const cycles = parents.cycles;
// 	const parentList = parents.nestingSkills;

// 	const foundCycleParticipants: FolderItem[] = [];
// 	for (const cycle of cycles) {
// 		for (const cycleItem of cycle) {
// 			let folderItem = skillMap.get(cycleItem.id);
// 			if (item) {
// 				folderItem = item;
// 			}
// 			if (!folderItem) continue;
// 			const newFolderItem = { ...folderItem, cycle: "taskbar" };
// 			skillMap.set(cycleItem.id, newFolderItem);
// 			foundCycleParticipants.push(newFolderItem);
// 		}
// 	}

// 	for (const parent of parentList) {
// 		const folderItem = skillMap.get(parent.id);
// 		if (!folderItem) continue;
// 		const newFolderItem = { ...folderItem, parent: "taskbar" };
// 		skillMap.set(parent.id, newFolderItem);
// 		foundCycleParticipants.push(newFolderItem);
// 	}

// 	return foundCycleParticipants;
// }

// export function useCycleDetection(skillMap: Map<string, SkillFormModel>) {
// 	const [cycleParticipants, setCycleParticipants] = useState<SkillFormModel[]>([]);
// 	// const [cycleStackTrace, setCycleStackTrace] = useState<string>("");

// 	useEffect(() => {
// 		const newCycleParticipants = checkCycles2(skillMap);
// 		setCycleParticipants(newCycleParticipants);
// 	}, [skillMap]);

// 	return { cycleParticipants, cyclesFound: cycleParticipants.length > 0 };
// }

export function ShowCyclesDialog({ cycleParticipants }: { cycleParticipants: SkillFormModel[] }) {
	const [showDialog, setShowDialog] = useState<boolean>(false);

	// const cycleComponents = buildCycleComponents(cycleParticipants);

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
				{showDialog && (
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

function CycleComponents<S extends { name: string }>({ cycles }: { cycles: S[] }) {
	return (
		<>
			{cycles.map((cycle, index) => {
				return (
					<button key={index} className="m-5 bg-gray-500 p-5">
						{cycle.name}
					</button>
				);
			})}
		</>
	);
}

export type SkillProps = { repoId: string; skills: SkillFormModel[] };
