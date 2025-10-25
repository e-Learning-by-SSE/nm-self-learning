--- Average Completion Rate
CREATE OR REPLACE VIEW "AuthorMetric_AverageCompletionRate" AS
WITH course_completion AS (
    SELECT
        a.username AS author_username,
        u.id,
        c."courseId",
        COUNT(e.username) AS total_enrollments,
        SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END) AS completed_enrollments,
        CASE
            WHEN COUNT(e.username) = 0 THEN 0
            ELSE ROUND(
                (SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END)::decimal
                 / COUNT(e.username)) * 100, 2
            )
        END AS course_completion_rate_percent
    FROM "_AuthorToCourse" ac
    JOIN "Author" a ON a.id = ac."A"
    JOIN "Course" c ON c."courseId" = ac."B"
    JOIN "User" u ON u."name" = a."username"
    LEFT JOIN "Enrollment" e ON e."courseId" = c."courseId"
    GROUP BY a.username, u.id, c."courseId"
)
SELECT
    id AS "authorId",
    author_username AS "authorUsername",
    ROUND(AVG(course_completion_rate_percent), 2) AS "averageCompletionPercent"
FROM course_completion
GROUP BY author_username, id
ORDER BY author_username;

-- Average Subject Completion Rate
CREATE OR REPLACE VIEW "AuthorMetric_AverageSubjectCompletionRate" AS
SELECT
    u.id AS "authorId",
    a.username AS "authorUsername",
    s."subjectId",
    s.title AS "subjectTitle",
    COUNT(e."username") AS "totalEnrollments",
    SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END) AS "completedEnrollments",
    ROUND(
        COALESCE(
            (SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END)::decimal
             / NULLIF(COUNT(e."username"), 0)) * 100,
            0
        ),
    2) AS "averageCompletionRate"
FROM "_AuthorToCourse" ac
JOIN "Author" a ON a.id = ac."A"
JOIN "Course" c ON c."courseId" = ac."B"
JOIN "User" u ON u."name" = a."username"
JOIN "Subject" s ON s."subjectId" = c."subjectId"
LEFT JOIN "Enrollment" e ON e."courseId" = c."courseId"
GROUP BY u.id, a.username, s."subjectId", s.title
ORDER BY a.username, s.title;

--- Average Course Completion Rate
CREATE OR REPLACE VIEW "AuthorMetric_AverageCourseCompletionRate" AS
SELECT
    u.id AS "authorId",
    a.username AS "authorUsername",
    c."courseId",
    COALESCE(c.title, 'N/A') AS "courseTitle",
    COUNT(e.username) AS "totalEnrollments",
    SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END) AS "completedEnrollments",
    COALESCE(
        ROUND(
            (SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END)::decimal
             / NULLIF(COUNT(e.username), 0)) * 100,
        2),
        0
    ) AS "averageCompletionRate"
FROM "_AuthorToCourse" ac
JOIN "Author" a ON a.id = ac."A"
JOIN "Course" c ON c."courseId" = ac."B"
JOIN "User" u ON u."name" = a."username"
LEFT JOIN "Enrollment" e ON e."courseId" = c."courseId"
GROUP BY a.username, u.id, c."courseId", c.title;

--- Average Lesson Completion Rate by Course
CREATE OR REPLACE VIEW "AuthorMetric_AverageLessonCompletionRate" AS
-- 1. Amount of Lessons that where started
WITH Started AS (
  SELECT
    "courseId",
    "lessonId",
    COUNT(DISTINCT "username") AS "usersStarted"
  FROM "StartedLesson"
  GROUP BY "courseId", "lessonId"
),
-- 2. Amount of Lessons that where finished
Finished AS (
  SELECT
    "courseId",
    "lessonId",
    COUNT(DISTINCT "username") AS "usersFinished"
  FROM "CompletedLesson"
  GROUP BY "courseId", "lessonId"
),
-- 3. Combine the both
Total_Amount AS (
    SELECT
        COALESCE(s."courseId", f."courseId") AS "courseId",
        COALESCE(s."lessonId", f."lessonId") AS "lessonId",
        COALESCE(s."usersStarted", 0) AS "usersStarted",
        COALESCE(f."usersFinished", 0) AS "usersFinished"
    FROM Started s
    FULL JOIN Finished f
        ON s."lessonId" = f."lessonId" AND s."courseId" = f."courseId"
     WHERE COALESCE(s."usersStarted", 0) >= 7
        AND COALESCE(f."usersFinished", 0) >= 7
),
-- 4. Compute completion rate
Completion_Rate AS (
  SELECT
    ta."courseId",
    ta."lessonId",
    ta."usersStarted",
    ta."usersFinished",
    ROUND(
      COALESCE(
        (ta."usersFinished"::decimal / NULLIF(ta."usersStarted", 0)) * 100,
        0
      ),
    2) AS "averageCompletionRate"
  FROM Total_Amount ta
)
-- 5. Link Lessons to Author
SELECT
  u.id AS "authorId",
  u.name AS "authorName",
  cr."lessonId",
  l.title AS "lessonTitle",
  cr."usersStarted",
  cr."usersFinished",
  cr."averageCompletionRate"
FROM Completion_Rate cr
JOIN "Course" c ON c."courseId" = cr."courseId"
JOIN "Lesson" l ON l."lessonId" = cr."lessonId"
JOIN (
  SELECT DISTINCT "A", "B"
  FROM "_AuthorToCourse"
) ac ON ac."B" = c."courseId"
JOIN "Author" a ON a.id = ac."A"
JOIN "User" u ON u.name = a."username"
ORDER BY u.name, cr."lessonId";

--------- Average Lesson Completion Rate of a Course ---------
CREATE OR REPLACE VIEW "AuthorMetric_AverageLessonCompletionRateByCourse" AS
-- 1. Amount of Lessons that where started
WITH Started AS (
  SELECT
    "courseId",
    "lessonId",
    COUNT(DISTINCT "username") AS "usersStarted"
  FROM "StartedLesson"
  GROUP BY "courseId", "lessonId"
),
-- 2. Amount of Lessons that where finished
Finished AS (
  SELECT
    "courseId",
    "lessonId",
    COUNT(DISTINCT "username") AS "usersFinished"
  FROM "CompletedLesson"
  GROUP BY "courseId", "lessonId"
),
-- 3. Combine both
Total_Amount AS (
  SELECT
    COALESCE(s."courseId", f."courseId") AS "courseId",
    COALESCE(s."lessonId", f."lessonId") AS "lessonId",
    COALESCE(s."usersStarted", 0) AS "usersStarted",
    COALESCE(f."usersFinished", 0) AS "usersFinished"
  FROM Started s
  FULL JOIN Finished f
    ON s."lessonId" = f."lessonId" AND s."courseId" = f."courseId"
),
-- 4. Compute lesson-level completion rate
Completion_Rate AS (
  SELECT
    ta."courseId",
    ta."lessonId",
    ta."usersStarted",
    ta."usersFinished",
    ROUND(
      COALESCE(
        (ta."usersFinished"::decimal / NULLIF(ta."usersStarted", 0)) * 100,
        0
      ),
    2) AS "averageCompletionRate"
  FROM Total_Amount ta
),
-- 5. Aggregate to course-level
Course_Aggregate AS (
  SELECT
    "courseId",
    COUNT(DISTINCT "lessonId") AS "numLessons",
    SUM("usersStarted") AS "totalUsersStarted",
    SUM("usersFinished") AS "totalUsersFinished",
    ROUND(AVG("averageCompletionRate"), 2) AS "averageCourseCompletionRate"
  FROM Completion_Rate
  GROUP BY "courseId"
   HAVING 
    SUM("usersStarted") >= 7
    AND SUM("usersFinished") >= 7
)
-- 6. Link Courses to Authors
SELECT
  u.id AS "authorId",
  u.name AS "authorName",
  c."courseId",
  c."title" AS "courseTitle",
  ca."numLessons",
  ca."totalUsersStarted",
  ca."totalUsersFinished",
  ca."averageCourseCompletionRate"
FROM Course_Aggregate ca
JOIN "Course" c ON c."courseId" = ca."courseId"
JOIN (
  SELECT DISTINCT "A", "B"
  FROM "_AuthorToCourse"
) ac ON ac."B" = c."courseId"
JOIN "Author" a ON a.id = ac."A"
JOIN "User" u ON u.name = a."username"
ORDER BY u.name, c."title";

