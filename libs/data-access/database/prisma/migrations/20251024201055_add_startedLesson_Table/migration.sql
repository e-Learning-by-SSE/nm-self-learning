CREATE TABLE "StartedLesson" (
    "startedLessonId" SERIAL NOT NULL,
    "courseId" TEXT,
    "lessonId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StartedLesson_pkey" PRIMARY KEY ("startedLessonId")
);
CREATE INDEX "StartedLesson_username_lessonId_idx" ON "StartedLesson"("username", "lessonId");
ALTER TABLE "StartedLesson" ADD CONSTRAINT "StartedLesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StartedLesson" ADD CONSTRAINT "StartedLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("lessonId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StartedLesson" ADD CONSTRAINT "StartedLesson_username_fkey" FOREIGN KEY ("username") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;
