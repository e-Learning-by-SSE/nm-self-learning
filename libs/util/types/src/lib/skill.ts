import z from "zod";

export type Skills = {
    id: string;
    nestedSkills: Skills[];
    name: string;
    level: number;
    description: string;

}

export const skillsSchema: z.ZodType<Skills> = z.lazy(() => z.object({
    id: z.string(),
    nestedSkills: z.array(skillsSchema),
    name: z.string(),
    level: z.number(),
    description: z.string()
}))



export function convertNestedSkillsToArray(skills: Skills): Skills[] {
    const result: Skills[] = [];
    result.push(skills);
    skills.nestedSkills.forEach(skill => {
        result.push(...convertNestedSkillsToArray(skill));
    })
    return result;
}
export function convertArrayToNestedSkills(skills: Skills[]): Skills {
    const result: Skills = {
        id: skills[0].id,
        nestedSkills: [],
        name: skills[0].name,
        level: skills[0].level,
        description: skills[0].description
    };
    skills.forEach(skill => {
        if (skill.id !== result.id) {
            result.nestedSkills.push(convertArrayToNestedSkills([skill]));
        }
    })
    return result;
}
