import { WorkerHost } from "../lib/core/worker-host";
import { jobs } from "./index";
import { pathGenerationPayloadSchema } from "@self-learning/worker-api";
import type { z } from "zod";
jest.mock("@xenova/transformers", () => ({
	pipeline: jest.fn()
}));

type PathGenerationPayload = z.infer<typeof pathGenerationPayloadSchema>;

type GeneratedPathResult = null | {
	path: Array<{
		origin?: {
			id: string;
			provides: Array<{ id: string }>;
		};
	}>;
};

let workerHost: WorkerHost | undefined;

const runPathGeneration = async (payload: PathGenerationPayload) => {
	if (!workerHost) {
		throw new Error("WorkerHost not initialized");
	}
	const jobId = crypto.randomUUID();
	const { result } = await workerHost.runJob(jobId, "pathGeneration", payload, {
		requestedBy: "path-generation-job-spec"
	});
	return result as GeneratedPathResult;
};

describe("pathGenerationJob", () => {
	beforeAll(() => {
		workerHost = new WorkerHost(jobs, { minThreads: 1, maxThreads: 1 });
	});

	afterAll(async () => {
		await workerHost?.shutdown();
		workerHost = undefined;
	});

	const baseSkills = [
		{ id: "skill-foundation", repositoryId: "repo-1", children: [] },
		{ id: "skill-target", repositoryId: "repo-1", children: [] }
	];

	const baseLessons = [
		{
			lessonId: "lesson-1",
			requires: [],
			provides: [{ id: "skill-foundation" }]
		},
		{
			lessonId: "lesson-2",
			requires: [{ id: "skill-foundation" }],
			provides: [{ id: "skill-target" }]
		}
	];

	const createPayload = (
		overrides: Partial<PathGenerationPayload> = {}
	): PathGenerationPayload => ({
		dbSkills: baseSkills,
		userGlobalKnowledge: { received: [] },
		course: {
			teachingGoals: [{ id: "skill-target", repositoryId: "repo-1", children: [] }]
		},
		lessons: baseLessons,
		knowledge: [],
		...overrides
	});

	it("builds an ordered learning path that satisfies prerequisites", async () => {
		const payload = createPayload();

		const result = await runPathGeneration(payload);

		expect(result).not.toBeNull();
		const orderedLessons = result?.path.map(segment => segment.origin?.id);
		expect(orderedLessons).toEqual(["lesson-1", "lesson-2"]);
		const lastProvides = result?.path.at(-1)?.origin?.provides.map(skill => skill.id);
		expect(lastProvides).toContain("skill-target");
	});

	it("skips lessons for previously acquired knowledge", async () => {
		const payload = createPayload({ knowledge: ["skill-foundation"] });

		const result = await runPathGeneration(payload);

		expect(result).not.toBeNull();
		const orderedLessons = result?.path.map(segment => segment.origin?.id);
		expect(orderedLessons).toEqual(["lesson-2"]);
	});
});
