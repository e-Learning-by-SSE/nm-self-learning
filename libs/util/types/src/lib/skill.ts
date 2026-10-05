import z from "zod";
import { SkillResolved } from "@self-learning/database";
import { ResourcePermissionsFormSchema } from "./resource";

// Tree node. Lessons and courses embed this, so it has no group list.
export const skillNodeSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	authorId: z.number(),
	parents: z.array(z.string()),
	children: z.array(z.string())
});

export type SkillNode = z.infer<typeof skillNodeSchema>;
// Tree code still uses this name.
export type SkillFormModel = SkillNode;

// Parents are written later, or the parent connects the new child.
export const skillCreateSchema = skillNodeSchema
	.omit({ id: true, authorId: true, parents: true })
	.extend({
		name: z.string().min(1),
		permissions: ResourcePermissionsFormSchema
	});

export const skillEditSchema = skillNodeSchema.extend({
	permissions: ResourcePermissionsFormSchema
});

export const ResourceSkillsFormSchema = z.object({
	provides: z.array(skillNodeSchema),
	requires: z.array(skillNodeSchema)
});
export type ResourceSkillsFormType = z.infer<typeof ResourceSkillsFormSchema>;

// TODO used once, name not descriptive, too specialized
export const createSkillFormModelFromSkillResolved = (
	skill: Pick<SkillResolved, "name" | "description" | "children" | "id" | "authorId" | "parents">
): SkillFormModel => {
	return {
		name: skill.name,
		description: skill.description,
		children: skill.children.map(child => child.id),
		id: skill.id,
		authorId: skill.authorId,
		parents: skill.parents.map(parent => parent.id)
	};
};
