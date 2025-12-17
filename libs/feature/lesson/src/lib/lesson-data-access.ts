import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

const selectStatement = {
	lessonId: true,
	slug: true,
	title: true,
	subtitle: true,
	description: true,
	content: true,
	quiz: true,
	meta: true,
	license: {
		select: {
			name: true,
			url: true,
			logoUrl: true,
			licenseText: true,
			oerCompatible: true
		}
	},
	lessonType: true,
	selfRegulatedQuestion: true,
	authors: {
		select: {
			displayName: true,
			slug: true,
			imgUrl: true
		}
	},
	permissions: {
		select: {
			accessLevel: true,
			groupId: true
		}
	}
};

export async function getLesson(slug: string) {
	return database.lesson.findUnique({
		where: { slug },
		select: selectStatement
	});
}

export async function getLessons(lessonIds: string[]): Promise<LessonData[]> {
	return database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: selectStatement
	});
}

export type LessonData = ResolvedValue<typeof getLesson>;
