import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type ResolvedSkillDto = {
	id: string;
	nestedSkills: Array<ResolvedSkillDto>;
	name: string;
	level: number;
	description?: string | undefined;
};
type SkillCreationDto = {
	owner: string;
	name: string;
	level: number;
	description?: string | undefined;
	nestedSkills: Array<SkillCreationDto>;
};

const SkillRepositorySearchDto = z
	.object({
		pageSize: z.number(),
		page: z.number(),
		name: z.string(),
		version: z.string(),
		owner: z.string()
	})
	.partial()
	.passthrough();
const SkillRepositoryDto = z
	.object({
		owner: z.string(),
		id: z.string(),
		taxonomy: z.string().optional(),
		description: z.string().optional(),
		access_rights: z.object({}).partial().passthrough().optional(),
		name: z.string(),
		version: z.string().optional()
	})
	.passthrough();
const SkillRepositoryListDto = z
	.object({ repositories: z.array(SkillRepositoryDto) })
	.passthrough();
const UnresolvedSkillRepositoryDto = z
	.object({
		owner: z.string(),
		id: z.string(),
		taxonomy: z.string().optional(),
		description: z.string().optional(),
		access_rights: z.object({}).partial().passthrough().optional(),
		name: z.string(),
		version: z.string().optional(),
		skills: z.array(z.string())
	})
	.passthrough();
const SkillSearchDto = z
	.object({
		pageSize: z.number(),
		page: z.number(),
		name: z.string(),
		level: z.number(),
		skillMap: z.string()
	})
	.partial()
	.passthrough();
const SkillDto = z
	.object({
		id: z.string(),
		nestedSkills: z.array(z.string()),
		repositoryId: z.string(),
		name: z.string(),
		level: z.number(),
		description: z.string().optional()
	})
	.passthrough();
const SkillListDto = z.object({ skills: z.array(SkillDto) }).passthrough();
const ResolvedSkillDto: z.ZodType<ResolvedSkillDto> = z.lazy(() =>
	z
		.object({
			id: z.string(),
			nestedSkills: z.array(ResolvedSkillDto),
			name: z.string(),
			level: z.number(),
			description: z.string().optional()
		})
		.passthrough()
);
const ResolvedSkillRepositoryDto = z
	.object({
		id: z.string(),
		taxonomy: z.string().optional(),
		description: z.string().optional(),
		skills: z.array(ResolvedSkillDto),
		name: z.string(),
		version: z.string().optional()
	})
	.passthrough();
const ResolvedSkillListDto = z.object({ skills: z.array(ResolvedSkillDto) }).passthrough();
const SkillRepositoryCreationDto = z
	.object({
		ownerId: z.string(),
		name: z.string(),
		description: z.string().optional(),
		version: z.string().optional(),
		access_rights: z.object({}).partial().passthrough().optional()
	})
	.passthrough();
const SkillCreationDto: z.ZodType<SkillCreationDto> = z.lazy(() =>
	z
		.object({
			owner: z.string(),
			name: z.string(),
			level: z.number(),
			description: z.string().optional(),
			nestedSkills: z.array(SkillCreationDto)
		})
		.passthrough()
);
const PathGoalDto = z
	.object({
		id: z.string(),
		title: z.string(),
		targetAudience: z.string().optional(),
		description: z.string().optional(),
		requirements: z.array(ResolvedSkillDto),
		pathGoals: z.array(ResolvedSkillDto)
	})
	.passthrough();
const LearningPathDto = z
	.object({
		id: z.string(),
		goals: z.array(PathGoalDto),
		title: z.string(),
		description: z.string().optional()
	})
	.passthrough();
const LearningPathListDto = z.object({ learningPaths: z.array(LearningPathDto) }).passthrough();
const PathGoalCreationDto = z
	.object({
		title: z.string(),
		targetAudience: z.string().optional(),
		description: z.string().optional(),
		requirements: z.array(ResolvedSkillDto),
		pathGoals: z.array(ResolvedSkillDto)
	})
	.passthrough();
const LearningPathCreationDto = z
	.object({
		title: z.string(),
		description: z.string().optional(),
		goals: z.array(PathGoalCreationDto)
	})
	.passthrough();
const SelfLearnLearningUnitDto = z
	.object({
		selfLearnId: z.string(),
		order: z.number().optional(),
		title: z.string(),
		resource: z.string(),
		language: z.string(),
		description: z.string().optional(),
		teachingGoals: z.array(z.string()).default([])
	})
	.passthrough();
const SelfLearnLearningUnitListDto = z
	.object({ learningUnits: z.array(SelfLearnLearningUnitDto).default([]) })
	.passthrough();
const SelfLearnLearningUnitCreationDto = z
	.object({
		order: z.number().optional(),
		title: z.string(),
		resource: z.string(),
		language: z.string(),
		description: z.string().optional(),
		teachingGoals: z.array(z.string()).default([])
	})
	.passthrough();
const EdgeDto = z.object({ from: z.string(), to: z.string() }).passthrough();
const NodeDto = z.object({ id: z.string(), metadata: z.string() }).passthrough();
const GraphDto = z.object({ edges: z.array(EdgeDto), nodes: z.array(NodeDto) }).passthrough();
const CheckGraphDto = z.object({ isAcyclic: z.boolean() }).passthrough();
const PathDto = z.object({ luIDs: z.array(z.object({}).partial().passthrough()) }).passthrough();

export const schemas = {
	SkillRepositorySearchDto,
	SkillRepositoryDto,
	SkillRepositoryListDto,
	UnresolvedSkillRepositoryDto,
	SkillSearchDto,
	SkillDto,
	SkillListDto,
	ResolvedSkillDto,
	ResolvedSkillRepositoryDto,
	ResolvedSkillListDto,
	SkillRepositoryCreationDto,
	SkillCreationDto,
	PathGoalDto,
	LearningPathDto,
	LearningPathListDto,
	PathGoalCreationDto,
	LearningPathCreationDto,
	SelfLearnLearningUnitDto,
	SelfLearnLearningUnitListDto,
	SelfLearnLearningUnitCreationDto,
	EdgeDto,
	NodeDto,
	GraphDto,
	CheckGraphDto,
	PathDto
};

const endpoints = makeApi([
	{
		method: "get",
		path: "/learningpaths/:learningpathId",
		alias: "LearningPathMgmtController_getLearningPath",
		description: `Returns the specified learningpath.`,
		requestFormat: "json",
		parameters: [
			{
				name: "learningpathId",
				type: "Path",
				schema: z.string()
			}
		],
		response: LearningPathDto
	},
	{
		method: "post",
		path: "/learningpaths/add_learningpath",
		alias: "LearningPathMgmtController_addLearningpath",
		description: `Creates a new learningpath at the specified repository and returns the created learningpath.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: LearningPathCreationDto
			}
		],
		response: LearningPathDto
	},
	{
		method: "get",
		path: "/learningpaths/showAllLearningPaths",
		alias: "LearningPathMgmtController_listLearningPaths",
		description: `Lists all learning paths.`,
		requestFormat: "json",
		response: LearningPathListDto
	},
	{
		method: "get",
		path: "/learningUnits/:learningUnitId",
		alias: "SelfLearnLearningUnitController_getLearningUnit",
		description: `Returns the specified learningUnit.`,
		requestFormat: "json",
		parameters: [
			{
				name: "learningUnitId",
				type: "Path",
				schema: z.string()
			}
		],
		response: SelfLearnLearningUnitDto
	},
	{
		method: "post",
		path: "/learningUnits/add_learningUnit",
		alias: "SelfLearnLearningUnitController_addLearningUnitSelfLearn",
		description: `Creates a new learningUnit at the specified repository and returns the created learningUnit.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: SelfLearnLearningUnitCreationDto
			}
		],
		response: SelfLearnLearningUnitDto
	},
	{
		method: "get",
		path: "/learningUnits/showAllLearningUnits",
		alias: "SelfLearnLearningUnitController_listLearningUnits",
		description: `Lists all learningUnits.`,
		requestFormat: "json",
		response: SelfLearnLearningUnitListDto
	},
	{
		method: "get",
		path: "/PathFinder/allSkillsDone/:repoId",
		alias: "PathFinderController_allSkillsDone",
		requestFormat: "json",
		parameters: [
			{
				name: "repoId",
				type: "Path",
				schema: z.string()
			}
		],
		response: z.array(z.object({}).partial().passthrough())
	},
	{
		method: "get",
		path: "/PathFinder/checkGraph/:skillId",
		alias: "PathFinderController_checkGraph",
		requestFormat: "json",
		parameters: [
			{
				name: "skillId",
				type: "Path",
				schema: z.string()
			}
		],
		response: z.object({ isAcyclic: z.boolean() }).passthrough()
	},
	{
		method: "get",
		path: "/PathFinder/getConnectedGraphForSkill/:skillId",
		alias: "PathFinderController_getConnectedGraphForSkill",
		requestFormat: "json",
		parameters: [
			{
				name: "skillId",
				type: "Path",
				schema: z.string()
			}
		],
		response: GraphDto
	},
	{
		method: "get",
		path: "/PathFinder/getConnectedGraphForSkillwithResolvedElements/:skillId",
		alias: "PathFinderController_getConnectedGraphForSkillwithResolvedElements",
		requestFormat: "json",
		parameters: [
			{
				name: "skillId",
				type: "Path",
				schema: z.string()
			}
		],
		response: z.object({}).partial().passthrough()
	},
	{
		method: "get",
		path: "/PathFinder/getConnectedSkillGraphForSkill/:skillId",
		alias: "PathFinderController_getConnectedSkillGraphForSkill",
		requestFormat: "json",
		parameters: [
			{
				name: "skillId",
				type: "Path",
				schema: z.string()
			}
		],
		response: GraphDto
	},
	{
		method: "get",
		path: "/PathFinder/getPathforJava",
		alias: "PathFinderController_getPathToSkill",
		requestFormat: "json",
		response: PathDto
	},
	{
		method: "post",
		path: "/skill-repositories",
		alias: "SkillMgmtController_searchForRepositories",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: SkillRepositorySearchDto
			}
		],
		response: SkillRepositoryListDto
	},
	{
		method: "get",
		path: "/skill-repositories/:owner",
		alias: "SkillMgmtController_listRepositories",
		description: `Lists all repositories of the specified user, without showing its content.`,
		requestFormat: "json",
		parameters: [
			{
				name: "owner",
				type: "Path",
				schema: z.string()
			}
		],
		response: SkillRepositoryListDto
	},
	{
		method: "delete",
		path: "/skill-repositories/:repositoryId",
		alias: "SkillMgmtController_deleteRepo",
		requestFormat: "json",
		parameters: [
			{
				name: "repositoryId",
				type: "Path",
				schema: z.string()
			}
		],
		response: z.object({}).partial().passthrough()
	},
	{
		method: "post",
		path: "/skill-repositories/:repositoryId/adapt",
		alias: "SkillMgmtController_adaptRepo",
		description: `Adapts a repository and returns the adapted it.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: SkillRepositoryDto
			},
			{
				name: "owner",
				type: "Query",
				schema: z.string()
			},
			{
				name: "id",
				type: "Query",
				schema: z.string()
			},
			{
				name: "taxonomy",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "description",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "access_rights",
				type: "Query",
				schema: z.object({}).partial().passthrough().optional()
			},
			{
				name: "name",
				type: "Query",
				schema: z.string()
			},
			{
				name: "version",
				type: "Query",
				schema: z.string().optional()
			}
		],
		response: z.object({}).partial().passthrough()
	},
	{
		method: "post",
		path: "/skill-repositories/:repositoryId/skill/adapt_skill",
		alias: "SkillMgmtController_adaptSkill",
		description: `Adapts a skill at the specified repository and returns the adapted skill.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: SkillCreationDto
			},
			{
				name: "repositoryId",
				type: "Path",
				schema: z.string()
			}
		],
		response: SkillDto
	},
	{
		method: "post",
		path: "/skill-repositories/:repositoryId/skill/add_skill",
		alias: "SkillMgmtController_addSkill",
		description: `Creates a new skill at the specified repository and returns the created skill.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: SkillCreationDto
			},
			{
				name: "repositoryId",
				type: "Path",
				schema: z.string()
			}
		],
		response: SkillDto
	},
	{
		method: "get",
		path: "/skill-repositories/byId/:repositoryId",
		alias: "SkillMgmtController_loadRepository",
		description: `Returns one repository and its unresolved elements.
Skills and their relations are handled as IDs and need to be resolved on the client-side.`,
		requestFormat: "json",
		parameters: [
			{
				name: "repositoryId",
				type: "Path",
				schema: z.string()
			}
		],
		response: UnresolvedSkillRepositoryDto
	},
	{
		method: "post",
		path: "/skill-repositories/create",
		alias: "SkillMgmtController_createRepository",
		description: `Creates a new skill repository for the specified user.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: SkillRepositoryCreationDto
			}
		],
		response: SkillRepositoryDto
	},
	{
		method: "post",
		path: "/skill-repositories/findSkills",
		alias: "SkillMgmtController_findSkills",
		description: `Lists all skills.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: SkillSearchDto
			}
		],
		response: SkillListDto
	},
	{
		method: "get",
		path: "/skill-repositories/resolve/:repositoryId",
		alias: "SkillMgmtController_loadResolvedRepository",
		description: `Returns one resolved repository and its elements.
Skills and their relations are resolved at the server.`,
		requestFormat: "json",
		parameters: [
			{
				name: "repositoryId",
				type: "Path",
				schema: z.string()
			}
		],
		response: ResolvedSkillRepositoryDto
	},
	{
		method: "post",
		path: "/skill-repositories/resolve/findSkills",
		alias: "SkillMgmtController_findSkillsResolved",
		description: `Lists all skills.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: SkillSearchDto
			}
		],
		response: ResolvedSkillListDto
	},
	{
		method: "get",
		path: "/skill-repositories/resolve/skill/:skillId",
		alias: "SkillMgmtController_getResolvedSkill",
		description: `Returns the specified skill.`,
		requestFormat: "json",
		parameters: [
			{
				name: "skillId",
				type: "Path",
				schema: z.string()
			}
		],
		response: ResolvedSkillDto
	},
	{
		method: "get",
		path: "/skill-repositories/skill/:skillId",
		alias: "SkillMgmtController_getSkill",
		description: `Returns the specified skill.`,
		requestFormat: "json",
		parameters: [
			{
				name: "skillId",
				type: "Path",
				schema: z.string()
			}
		],
		response: SkillDto
	},
	{
		method: "delete",
		path: "/skill-repositories/skill/delete/:skillId",
		alias: "SkillMgmtController_delteSkill",
		requestFormat: "json",
		parameters: [
			{
				name: "skillId",
				type: "Path",
				schema: z.string()
			}
		],
		response: z.object({}).partial().passthrough()
	}
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
	return new Zodios(baseUrl, endpoints, options);
}
