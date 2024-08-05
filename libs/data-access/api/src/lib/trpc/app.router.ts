import { t } from "./trpc";
import { adminRouter } from "./routers/admin.router";
import { authorRouter } from "./routers/author.router";
import { completionRouter } from "./routers/completion.router";
import { courseRouter } from "./routers/course.router";
import { enrollmentRouter } from "./routers/enrollment.router";
import { learningDiaryRouter } from "./routers/learning-diary.router";
import { lessonRouter } from "./routers/lesson.router";
import { licenseRouter } from "./routers/license.router";
import { meRouter } from "./routers/me.router";
import { programmingRouter } from "./routers/programming";
import { skillRouter } from "./routers/skill.router";
import { specializationRouter } from "./routers/specialization.router";
import { storageRouter } from "./routers/storage.router";
import { subjectRouter } from "./routers/subject.router";
import {
	learningDiaryEntryRouter,
	learningLocationRouter
} from "./routers/learningDiaryEntry.router";

export const appRouter = t.router({
	admin: adminRouter,
	author: authorRouter,
	completion: completionRouter,
	course: courseRouter,
	enrollment: enrollmentRouter,
	learningDiary: learningDiaryRouter,
	learningLocation: learningLocationRouter,
	learningDiaryEntry: learningDiaryEntryRouter,
	lesson: lessonRouter,
	licenseRouter: licenseRouter,
	me: meRouter,
	storage: storageRouter,
	specialization: specializationRouter,
	subject: subjectRouter,
	programming: programmingRouter,
	skill: skillRouter,
	settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
