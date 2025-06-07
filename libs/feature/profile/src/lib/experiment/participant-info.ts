import { database } from "@self-learning/database";

export async function getExperimentStatus(
	username: string,
	info?: { acceptedExperimentTerms: Date | null; experimentalFeatures: boolean | null }
) {
	let userData = info;
	if (!userData) {
		userData = await database.user.findUniqueOrThrow({
			where: { name: username },
			select: {
				acceptedExperimentTerms: true,
				experimentalFeatures: true
			}
		});
	}

	return {
		consentDate: userData?.acceptedExperimentTerms,
		experimentalFeatures: userData?.experimentalFeatures ?? false,
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
	const updatedUser = await database.user.update({
		where: { name: username },
		data: {
			acceptedExperimentTerms: consent ? new Date() : null,
			experimentalFeatures: experimentalFeatures,
			enabledLearningStatistics: consent ?? false
		}
	});

	return {
		success: true,
		consentGiven: consent,
		consentDate: updatedUser.acceptedExperimentTerms,
		experimentalFeatures: updatedUser.experimentalFeatures
	};
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
				experimentalFeatures: true
			}
		}),
		database.user.count({
			where: {
				acceptedExperimentTerms: { not: null },
				experimentalFeatures: false
			}
		})
	]);
	console.log(`Treatment group count: ${treatmentCount}, Control group count: ${controlCount}`);

	let assignTreatment: boolean;
	if (treatmentCount < controlCount) {
		assignTreatment = true;
	} else if (treatmentCount > controlCount) {
		assignTreatment = false;
	} else {
		assignTreatment = Math.random() < 0.5; // Randomly assign if groups are balanced
	}

	await database.user.update({
		where: { name: username },
		data: {
			experimentalFeatures: assignTreatment
		}
	});

	return assignTreatment ? "treatment" : "control";
}
