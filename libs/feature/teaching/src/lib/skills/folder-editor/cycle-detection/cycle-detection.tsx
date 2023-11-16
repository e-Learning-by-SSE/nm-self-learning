import {SkillFormModel} from "@self-learning/types";


function getCycleStackTrace(cycles: Array<[string, string]>) {
	let result = "digraph Cycle {\n";
	cycles.forEach(cycle => {
		result += "		" +cycle[0] + " -> " + cycle[1] + "\n";
	});
	result += "}";
	return result;
}


export type FolderItem = {skill: SkillFormModel, selectedSkill: boolean, cycle?: string};
