import { t } from "./trpc";
import { adminRouter } from "./routers/admin.router";
import { authorRouter } from "./routers/author.router";
import { completionRouter } from "./routers/completion.router";
import { courseRouter } from "./routers/course.router";
import { enrollmentRouter } from "./routers/enrollment.router";
import {
	learningDiaryPageRouter,
	learningLocationRouter,
	learningTechniqueRouter
} from "./routers/learning-diary.router";
import { learningGoalRouter } from "./routers/learning-goal.router";
import { lessonRouter } from "./routers/lesson.router";
import { licenseRouter } from "./routers/license.router";
import { meRouter } from "./routers/me.router";
import { programmingRouter } from "./routers/programming";
import { skillRouter } from "./routers/skill.router";
import { specializationRouter } from "./routers/specialization.router";
import { storageRouter } from "./routers/storage.router";
import { subjectRouter } from "./routers/subject.router";

import { userEventRouter } from "./routers/event-log.router";
import { notificationRouter } from "./routers/notification.router";
import { gamificationRouter } from "./routers/achievement.router";

export const appRouter = t.router({
	admin: adminRouter,
	author: authorRouter,
	completion: completionRouter,
	course: courseRouter,
	enrollment: enrollmentRouter,
	learningGoal: learningGoalRouter,
	learningLocation: learningLocationRouter,
	learningDiary: learningDiaryPageRouter,
	learningTechniqueRating: learningTechniqueRouter,
	lesson: lessonRouter,
	licenseRouter: licenseRouter,
	me: meRouter,
	achievement: gamificationRouter,
	storage: storageRouter,
	specialization: specializationRouter,
	subject: subjectRouter,
	programming: programmingRouter,
	skill: skillRouter,
	events: userEventRouter,
	notification: notificationRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
