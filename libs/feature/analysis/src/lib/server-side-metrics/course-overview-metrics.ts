import { database } from "@self-learning/database";

async function _courseParticipation({
	courseIds,
	start,
	end,
	threshold
}: {
	courseIds: string[];
	start?: Date;
	end?: Date;
	threshold: number;
}): Promise<{ courseId: string; participants: number | null }[]> {
	// Retrieve distinct participants for each course
	const result = await database.eventLog.findMany({
		where: {
			courseId: {
				in: courseIds
			},
			createdAt: {
				gte: start,
				lte: end
			}
		},
		select: {
			courseId: true,
			username: true
		},
		distinct: ["courseId", "username"]
	});

	// Count distinct participants for each course
	const distinctParticipants = result.filter(r => r.courseId !== undefined) as {
		courseId: string;
		username: string;
	}[];
	const distinctParticipantsPerCourse = distinctParticipants.reduce(
		(acc, participation) => {
			if (!acc[participation.courseId]) {
				acc[participation.courseId] = 0;
			}
			acc[participation.courseId]++;
			return acc;
		},
		{} as Record<string, number>
	);

	// Map results to type
	return Object.entries(distinctParticipantsPerCourse).map(([courseId, participants]) => {
		if (participants >= threshold) {
			return { courseId: courseId, participants };
		}
		return { courseId: courseId, participants: null };
	});
}

export async function courseParticipation({
	courseIds,
	start,
	end,
	threshold
}: {
	courseIds: string[];
	start: Date;
	end: Date;
	threshold: number;
}) {
	// Participants in semester
	const participantsInIntervall = await _courseParticipation({
		courseIds,
		start,
		end,
		threshold
	});

	// Participants total
	const participantsTotal = await _courseParticipation({
		courseIds,
		threshold
	});

	// Merge both results
	return participantsTotal.map(item1 => {
		const item2 = participantsInIntervall.find(item => item.courseId === item1.courseId);
		return {
			courseId: item1.courseId,
			participants: item2?.participants ?? null,
			participantsTotal: item1.participants
		};
	});
}
