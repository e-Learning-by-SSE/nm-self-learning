import { database } from "@self-learning/database";

export async function getExperimentStatus(username: string) {
	const userData = await database.user.findUniqueOrThrow({
		where: { name: username },
		select: {
			acceptedExperimentTerms: true,
			featureFlags: {
				select: {
					experimental: true
				}
			}
		}
	});

	return {
		consentDate: userData?.acceptedExperimentTerms,
		experimentalFeatures: userData.featureFlags?.experimental, // null when not consented
		isParticipating: userData?.acceptedExperimentTerms !== null
	};
}

export async function updateExperimentParticipation({
	username,
	experimentalFeatures,
	consent
}: {
	username: string;
	experimentalFeatures?: boolean;
	consent: boolean;
}) {
	return database.user.update({
		where: { name: username },
		data: {
			featureFlags: {
				update: {
					experimental: experimentalFeatures ?? false,
					learningStatistics: consent ?? false
				}
			},
			acceptedExperimentTerms: consent ? new Date() : null
		}
	});
}

export async function createUserParticipation(username: string) {
	const group = await assignExperimentGroup(username);
	return updateExperimentParticipation({
		username,
		experimentalFeatures: group === "treatment",
		consent: true
	});
}

export async function assignExperimentGroup(username: string): Promise<"treatment" | "control"> {
	const [treatmentCount, controlCount] = await Promise.all([
		database.user.count({
			where: {
				acceptedExperimentTerms: { not: null },
				featureFlags: {
					experimental: true
				}
			}
		}),
		database.user.count({
			where: {
				acceptedExperimentTerms: { not: null },
				featureFlags: {
					experimental: false
				}
			}
		})
	]);

	let assignTreatment: boolean;
	if (treatmentCount < controlCount) {
		assignTreatment = true;
	} else if (treatmentCount > controlCount) {
		assignTreatment = false;
	} else {
		assignTreatment = Math.random() < 0.5; // Randomly assign if groups are balanced
	}

	await database.features.update({
		where: { username },
		data: {
			experimental: assignTreatment
		}
	});

	console.log(`User ${username} assigned to ${assignTreatment ? "treatment" : "control"} group.`);
	return assignTreatment ? "treatment" : "control";
}
