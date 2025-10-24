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

--- Average Lesson Completion Rate
CREATE OR REPLACE VIEW "AuthorMetric_AverageLessonCompletionRate" AS
WITH user_progress AS (
    SELECT
        sl."username",
        sl."courseId",
        COUNT(DISTINCT cl."lessonId") AS "completedLessons",
        COUNT(DISTINCT l."lessonId") AS "totalLessons"
    FROM "Lesson" l
    LEFT JOIN "StartedLesson" sl ON sl."lessonId" = l."lessonId"
    LEFT JOIN "CompletedLesson" cl 
        ON cl."lessonId" = l."lessonId" 
       AND cl."username" = sl."username"
    WHERE sl."username" IS NOT NULL
    GROUP BY sl."username", sl."courseId"
)
SELECT
    u.id AS "authorId",
    u.name AS "authorName",
    COUNT(DISTINCT up."username") AS "usersStarted",
    COUNT(DISTINCT CASE 
        WHEN up."completedLessons" = up."totalLessons" THEN up."username"
    END) AS "usersFinished",
    ROUND(
        COALESCE(
            (COUNT(DISTINCT CASE 
                WHEN up."completedLessons" = up."totalLessons" THEN up."username"
            END)::decimal / NULLIF(COUNT(DISTINCT up."username"), 0)) * 100,
            0
        ),
        2
    ) AS "averageCompletionRate"
FROM "User" u
JOIN "Author" a ON a.username = u.name
JOIN "_AuthorToCourse" ac ON ac."A" = a.id
JOIN "Course" c ON c."courseId" = ac."B"
LEFT JOIN user_progress up ON up."courseId" = c."courseId"
GROUP BY u.id, u.name
HAVING
    COUNT(DISTINCT up."username") > 7
    AND COUNT(DISTINCT CASE WHEN up."completedLessons" = up."totalLessons" THEN up."username" END) > 7;

--- Daily Average Lesson Completion Rate 
CREATE OR REPLACE VIEW "AuthorMetric_DailyAverageLessonCompletionRate" AS
WITH user_progress AS (
    SELECT
        sl."username",
        sl."courseId",
        MIN(sl."createdAt") AS started_at,
        MAX(cl."createdAt") AS last_completed_at,
        COUNT(DISTINCT cl."lessonId") AS completedLessons,
        COUNT(DISTINCT l."lessonId") AS totalLessons
    FROM "Lesson" l
    LEFT JOIN "StartedLesson" sl ON sl."lessonId" = l."lessonId"
    LEFT JOIN "CompletedLesson" cl 
        ON cl."lessonId" = l."lessonId" 
       AND cl."username" = sl."username"
    WHERE sl."username" IS NOT NULL
    GROUP BY sl."username", sl."courseId"
),
user_status AS (
    SELECT
        "username",
        "courseId",
        started_at,
        last_completed_at,
        CASE WHEN totalLessons > 0 AND completedLessons = totalLessons THEN TRUE ELSE FALSE END AS finished
    FROM user_progress
    WHERE started_at IS NOT NULL
)
SELECT
    u.id AS "authorId",
    u.name AS "authorName",
    DATE(us.started_at) AS "day",
    COUNT(DISTINCT us."username") AS "usersStarted",
    COUNT(DISTINCT CASE WHEN us.finished THEN us."username" END) AS "usersFinished",
    ROUND(
        COALESCE(
            (COUNT(DISTINCT CASE WHEN us.finished THEN us."username" END)::decimal
             / NULLIF(COUNT(DISTINCT us."username"), 0)) * 100,
            0
        ),
        2
    ) AS "averageCompletionRate"
FROM user_status us
JOIN "Course" c ON c."courseId" = us."courseId"
JOIN "_AuthorToCourse" ac ON ac."B" = c."courseId"
JOIN "Author" a ON a.id = ac."A"
JOIN "User" u ON u.name = a."username"
GROUP BY u.id, u.name, DATE(us.started_at)
HAVING
    COUNT(DISTINCT us."username") > 7
    AND COUNT(DISTINCT CASE WHEN us.finished THEN us."username" END) > 7
ORDER BY u.name, DATE(us.started_at);


--- Average Lesson Completion Rate of a Course
CREATE OR REPLACE VIEW "AuthorMetric_AverageLessonCompletionRateByCourse" AS
WITH user_course_progress AS (
    SELECT
        sl."courseId",
        sl."username",
        COUNT(DISTINCT cl."lessonId") AS "completedLessons",
        COUNT(DISTINCT l."lessonId") AS "totalLessons"
    FROM "Lesson" l
    LEFT JOIN "StartedLesson" sl ON sl."lessonId" = l."lessonId"
    LEFT JOIN "CompletedLesson" cl 
        ON cl."lessonId" = l."lessonId" 
       AND cl."username" = sl."username"
    WHERE sl."username" IS NOT NULL
    GROUP BY sl."courseId", sl."username"
),
course_completion AS (
    SELECT
        "courseId",
        COUNT(DISTINCT "username") AS "usersStarted",
        COUNT(DISTINCT CASE 
            WHEN "completedLessons" = "totalLessons" THEN "username"
        END) AS "usersFinished"
    FROM user_course_progress
    GROUP BY "courseId"
)
SELECT
    u.id AS "authorId",
    u.name AS "authorName",
    c."courseId",
    c."title" AS "courseTitle",
    COALESCE(cc."usersStarted", 0) AS "usersStarted",
    COALESCE(cc."usersFinished", 0) AS "usersFinished",
    ROUND(
        COALESCE(
            (cc."usersFinished"::decimal / NULLIF(cc."usersStarted", 0)) * 100,
            0
        ),
        2
    ) AS "averageCompletionRate"
FROM "User" u
JOIN "Author" a ON a.username = u.name
JOIN "_AuthorToCourse" ac ON ac."A" = a.id
JOIN "Course" c ON c."courseId" = ac."B"
LEFT JOIN course_completion cc ON cc."courseId" = c."courseId"
WHERE
    COALESCE(cc."usersStarted", 0) > 7
    AND COALESCE(cc."usersFinished", 0) > 7
ORDER BY u.name, c.title;

--- Daily Average Lesson Completion Rate of a Course
CREATE OR REPLACE VIEW "AuthorMetric_DailyAverageLessonCompletionRateByCourse" AS
WITH user_progress AS (
    SELECT
        sl."username",
        sl."courseId",
        MIN(sl."createdAt") AS started_at,
        MAX(cl."createdAt") AS last_completed_at,
        COUNT(DISTINCT cl."lessonId") AS completedLessons,
        COUNT(DISTINCT l."lessonId") AS totalLessons
    FROM "Lesson" l
    LEFT JOIN "StartedLesson" sl ON sl."lessonId" = l."lessonId"
    LEFT JOIN "CompletedLesson" cl 
        ON cl."lessonId" = l."lessonId"
       AND cl."username" = sl."username"
    WHERE sl."username" IS NOT NULL
    GROUP BY sl."username", sl."courseId"
),
user_status AS (
    SELECT
        "username",
        "courseId",
        started_at,
        last_completed_at,
        CASE WHEN totalLessons > 0 AND completedLessons = totalLessons THEN TRUE ELSE FALSE END AS finished
    FROM user_progress
    WHERE started_at IS NOT NULL
)
SELECT
    u.id AS "authorId",
    u.name AS "authorName",
    c."courseId",
    c.title AS "courseTitle",
    DATE(us.started_at) AS "day",
    COUNT(DISTINCT us."username") AS "usersStarted",
    COUNT(DISTINCT CASE WHEN us.finished THEN us."username" END) AS "usersFinished",
    ROUND(
        COALESCE(
            (COUNT(DISTINCT CASE WHEN us.finished THEN us."username" END)::decimal
             / NULLIF(COUNT(DISTINCT us."username"), 0)) * 100,
            0
        ),
        2
    ) AS "averageCompletionRate"
FROM user_status us
JOIN "Course" c ON c."courseId" = us."courseId"
JOIN "_AuthorToCourse" ac ON ac."B" = c."courseId"
JOIN "Author" a ON a.id = ac."A"
JOIN "User" u ON u.name = a."username"
GROUP BY u.id, u.name, c."courseId", c.title, DATE(us.started_at)
HAVING
    COUNT(DISTINCT us."username") > 7
    AND COUNT(DISTINCT CASE WHEN us.finished THEN us."username" END) > 7
ORDER BY u.name, c.title, "day";
