import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";
import { formatDateToString } from "@self-learning/util/common";

export async function getLearningDiaryEntriesOverview({ username }: { username: string }) {
	let learningDiaryEntries = await database.learningDiaryEntry.findMany({
		where: { studentName: username },
		select: {
			id: true,
			date: true,
			start: true,
			end: true,
			course: { select: { title: true, slug: true } },
			learningLocation: { select: { name: true } },
			learningTechniqueEvaluation: {
				select: {
					learningTechnique: {
						select: {
							name: true,
							learningStrategie: { select: { name: true } }
						}
					}
				}
			}
		}
	});

	learningDiaryEntries = learningDiaryEntries
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.reverse();

	const result = learningDiaryEntries.map((entry, index) => {
		return {
			...entry,
			date: formatDateToString(new Date(entry.date)),
			start: new Date(entry.start).toISOString(),
			end: new Date(entry.end).toISOString(),
			number: index + 1,
			duration: new Date(entry.end).getTime() - new Date(entry.start).getTime(),
			learningLocation: entry.learningLocation,
			learningTechniqueEvaluation: entry.learningTechniqueEvaluation
		};
	});

	return result;
}

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type LearningDiaryEntriesOverview = ArrayElement<
	Awaited<ResolvedValue<typeof getLearningDiaryEntriesOverview>>
>;
