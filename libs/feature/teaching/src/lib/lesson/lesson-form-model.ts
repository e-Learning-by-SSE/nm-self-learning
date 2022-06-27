import { Lesson, QuizContent } from "@self-learning/types";

export type LessonFormModel = Lesson & { quiz: QuizContent };
