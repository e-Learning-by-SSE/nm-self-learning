import {SkillFormModel} from "@self-learning/types";
import {findParentsOfCycledSkills} from "@self-learning/skills-pathfinder";
import {dispatchDetection} from "./detection-hook";
import {Alert, dispatchDialog, freeDialog, SimpleDialog} from "@self-learning/ui/common";

/**
 *
 * @param skillMap
 * @param item for selecting a specific folderitem
 */
export async function checkForCycles(skillMap: Map<string, FolderItem>, item?: FolderItem) {
	const skillsInWrongFormat = Array.from(skillMap.values());
	const skills = skillsInWrongFormat.map(item => {
		const skill = item.skill;
		return {
			id: skill.id,
			name: skill.name,
			repositoryId: skill.repositoryId,
			nestedSkills: skill.children,
		};
	});

	const parents = findParentsOfCycledSkills(skills)

	if(!parents)  {
		//No cycle found

		freeDialog("alert");
		if(item) {
			dispatchDetection([item]); 
		}
		
	} else {
		//cycle found


		const cycles = parents.cycles;
		const parentList = parents.nestingSkills;
	
		const folderItems: FolderItem[] = [];
		for (const cycle of cycles) {
			for (const cycleItem of cycle) {
				let folderItem = skillMap.get(cycleItem.id);
				if (item) {
					folderItem = item;
				}
				if (!folderItem) continue;
				const newFolderItem = {...folderItem, cycle: "taskbar"};
				skillMap.set(cycleItem.id, newFolderItem);
				folderItems.push(newFolderItem);
			}
		}
	
		for (const parent of parentList) {
			const folderItem = skillMap.get(parent.id);
			if (!folderItem) continue;
			const newFolderItem = {...folderItem, parent: "taskbar"};
			skillMap.set(parent.id, newFolderItem);
			folderItems.push(newFolderItem);
		}
	
		const cycleStackTrace = getCycleStackTrace(cycles as { name: string }[][])
		//draws the cycle symbol only in the affected rows.
		dispatchDetection(folderItems);
		if (!(cycles.length > 0)) return;
		const onClickDetailedCycle = () => {
			dispatchDialog(<SimpleDialog description={cycleStackTrace} name={"Zyklen - Darstellung"}
										 onClose={() => freeDialog("simpleDialog")}/>, "simpleDialog")
		}
		//draws the error message
		dispatchDialog(<Alert type={{
			severity: "ERROR", message:
	
				<div>
					<button onClick={onClickDetailedCycle}
							className="hover:text-red-700 hover:cursor-pointer text-left"><span>
					Warnung: In Ihrer Modelierung der Lernziele liegt ein Zyclus vor.
					Aufgrunddessen kann der Algorithmus keinen Gültigen Lernfpad mit denen im Zyclus beteiligten
					Lernzielen finden.
					Angegebene Pfadziel sind nicht erreichbar und nur Privat speicherbar.
					Die betroffenden Skills können
					durch Klicken auf diesen Text angezeigt werden.	</span></button>
				</div>
	
		}}/>, "alert")
	}

}

export function getCycleStackTrace<S extends { name: string }>(cycles: S[][]): string {
	let result = ""
	cycles.forEach(cycle => {
		cycle.forEach((item, index) => {
			if (index === cycle.length - 1) {
				result += item.name + " -> ";
				result += cycle[0].name
				return;
			}
			result += item.name + " -> ";

		});
	});
	return result;
}


export type FolderItem = { skill: SkillFormModel, selectedSkill: boolean, cycle?: string, parent?: string };
