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
}): Promise<{ resourceId: string; participants: number | null }[]> {
	// Retrieve distinct participants for each course
	const result = await database.eventLog.findMany({
		where: {
			resourceId: {
				in: courseIds
			},
			createdAt: {
				gte: start,
				lte: end
			}
		},
		select: {
			resourceId: true,
			username: true
		},
		distinct: ["resourceId", "username"]
	});

	// Count distinct participants for each course
	const distinctParticipants = result.filter(r => r.resourceId !== undefined) as {
		resourceId: string;
		username: string;
	}[];
	const distinctParticipantsPerCourse = distinctParticipants.reduce(
		(acc, participation) => {
			if (!acc[participation.resourceId]) {
				acc[participation.resourceId] = 0;
			}
			acc[participation.resourceId]++;
			return acc;
		},
		{} as Record<string, number>
	);

	// Map results to type
	return Object.entries(distinctParticipantsPerCourse).map(([courseId, participants]) => {
		if (participants >= threshold) {
			return { resourceId: courseId, participants };
		}
		return { resourceId: courseId, participants: null };
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
		const item2 = participantsInIntervall.find(item => item.resourceId === item1.resourceId);
		return {
			resourceId: item1.resourceId,
			participants: item2?.participants ?? null,
			participantsTotal: item1.participants
		};
	});
}
