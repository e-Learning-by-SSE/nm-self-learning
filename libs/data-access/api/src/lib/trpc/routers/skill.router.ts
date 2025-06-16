import { authorProcedure, t } from "../trpc";
import * as z from "zod";
import { database, getSkillById } from "@self-learning/database";
import {
	createSkillFormModelFromSkillResolved,
	skillCreationFormSchema,
	SkillFormModel,
	skillFormSchema
} from "@self-learning/types";
import fieldTypes from "rehype-citation/node/src/citation-js/plugin-bibtex/input/fieldTypes";
import author = fieldTypes.author;

type RawSkill = {
	id: string;
	name: string;
	description: string | null;
	authorId: number;
	children: { id: string }[];
	parents: { id: string }[];
};

type TransformedSkill = {
	id: string;
	name: string;
	description: string | null;
	authorId: number;
	children: string[];
	parents: string[];
};

async function updateSkill(skill: SkillFormModel) {
	const children = skill.children.map(id => ({ id }));
	const parents = skill.parents.map(id => ({ id }));

	return database.skill.update({
		where: { id: skill.id },
		data: {
			name: skill.name,
			description: skill.description,
			children: { set: children },
			parents: { set: parents },
			author: { connect: { id: skill.authorId } }
		},
		include: {
			children: true,
			parents: true
		}
	});
}

async function createSkill(input: {
	skill: { children: string[]; name: string; description: string | null };
	authorId: number;
}) {
	return database.skill.create({
		data: {
			...input.skill,
			author: { connect: { id: input.authorId } },
			children: {
				connect: input.skill.children.map(id => ({ id }))
			}
		},
		include: {
			children: true,
			parents: true
		}
	});
}

export async function getParentSkills() {
	return database.skill.findMany({
		where: { parents: { none: {} } },
		select: {
			id: true,
			name: true,
			description: true,
			authorId: true,
			children: { select: { id: true } },
			parents: { select: { id: true } }
		}
	});
}

async function getSkills() {
	return database.skill.findMany({
		select: {
			id: true,
			name: true,
			description: true,
			authorId: true,
			children: { select: { id: true } },
			parents: { select: { id: true } }
		}
	});
}

export async function getParentSkillsByAuthorId(authorId: number) {
	return database.skill.findMany({
		where: {
			AND: [{ parents: { none: {} } }, { authorId: authorId }]
		},
		select: {
			id: true,
			name: true,
			description: true,
			authorId: true,
			children: { select: { id: true } },
			parents: { select: { id: true } }
		}
	});
}

export async function getSkillsByAuthorId(authorId: number) {
	const skills = await database.skill.findMany({
		where: { authorId: authorId },
		select: {
			id: true,
			name: true,
			description: true,
			authorId: true,
			children: { select: { id: true } },
			parents: { select: { id: true } }
		}
	});
	return transformSkills(skills);
}

export function transformSkills(skills: RawSkill[]): TransformedSkill[] {
	return skills.map(skill => ({
		id: skill.id,
		name: skill.name,
		description: skill.description,
		authorId: skill.authorId,
		children: skill.children.map(child => child.id),
		parents: skill.parents.map(parent => parent.id)
	}));
}

export const skillRouter = t.router({
	getParentSkills: authorProcedure.query(async () => {
		const skills = await database.skill.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				authorId: true,
				children: { select: { id: true } },
				parents: { select: { id: true } }
			}
		});

		return transformSkills(skills);
	}),
	getSkills: authorProcedure.query(async () => {
		return transformSkills(await getSkills());
	}),
	getSkillsByAuthorId: authorProcedure.query(async ({ input, ctx }) => {
		const authorId = (
			await database.author.findUnique({
				where: { username: ctx.user.name },
				select: { id: true }
			})
		)?.id;

		return await getSkillsByAuthorId(authorId ? authorId : -1);
	}),

	getParentSkillsByAuthorId: authorProcedure.query(async ({ input, ctx }) => {
		const authorId = (
			await database.author.findUnique({
				where: { username: ctx.user.name },
				select: { id: true }
			})
		)?.id;

		return getParentSkillsByAuthorId(authorId ? authorId : -1);
	}),
	updateSkill: authorProcedure
		.input(
			z.object({
				skill: skillFormSchema
			})
		)
		.mutation(async ({ input }) => {
			return updateSkill(input.skill);
		}),

	createSkill: authorProcedure
		.input(
			z.object({
				authorId: z.number(),
				skill: skillCreationFormSchema
			})
		)
		.mutation(async ({ input }) => {
			return await createSkill(input);
		}),
	createSkillWithParents: authorProcedure
		.input(
			z.object({
				authorId: z.number(),
				parentSkillId: z.string(),
				skill: skillCreationFormSchema
			})
		)
		.mutation(async ({ input }) => {
			const parentSkill = await getSkillById(input.parentSkillId);
			if (!parentSkill) return null;
			const createdSkill = await createSkill({
				authorId: input.authorId,
				skill: input.skill
			});
			const parentSkillFormModel = createSkillFormModelFromSkillResolved(parentSkill);
			const updatedParentSkill = await updateSkill({
				...parentSkillFormModel,
				children: [...parentSkillFormModel.children, createdSkill.id]
			});
			return { parentSkill: updatedParentSkill, createdSkill };
		}),

	getSkillById: authorProcedure
		.input(
			z.object({
				skillId: z.string()
			})
		)
		.query(async ({ input }) => {
			return getSkillById(input.skillId);
		}),

	getSkillsByIds: authorProcedure
		.input(
			z.object({
				skillIds: z.array(z.string())
			})
		)
		.mutation(async ({ input }) => {
			return database.skill.findMany({
				where: { id: { in: input.skillIds } },
				include: {
					children: true,
					parents: true
				}
			});
		}),

	deleteSkills: authorProcedure
		.input(
			z.object({
				ids: z.array(z.string())
			})
		)
		.mutation(async ({ input }) => {
			// TODO decide what to do with children
			return database.skill.deleteMany({
				where: { id: { in: input.ids } }
			});
		})
});
