-- Create KPI View for Total Learning Time
CREATE OR REPLACE VIEW "KPITotalLearningTime" AS
WITH sessionized AS (
    SELECT
        e.id,
        e.username,
        e."createdAt",
        CASE
            WHEN LAG(e."createdAt") OVER (PARTITION BY e.username ORDER BY e."createdAt") IS NULL
                 OR e."createdAt" - LAG(e."createdAt") OVER (PARTITION BY e.username ORDER BY e."createdAt") > INTERVAL '30 minutes'
            THEN 1 ELSE 0
        END AS is_new_session
    FROM "EventLog" e
),
session_ids AS (
    SELECT
        id,
        username,
        "createdAt",
        SUM(is_new_session) OVER (PARTITION BY username ORDER BY "createdAt") AS session_id
    FROM sessionized
),
session_durations AS (
    SELECT
        username,
        session_id,
        MIN("createdAt") AS session_start,
        MAX("createdAt") AS session_end,
        EXTRACT(EPOCH FROM (MAX("createdAt") - MIN("createdAt"))) AS session_duration_seconds
    FROM session_ids
    GROUP BY username, session_id
)
SELECT
    u.id AS id,
    u.name as username,
    SUM(session_duration_seconds) AS total_time_spent_seconds
FROM session_durations sd
JOIN "User" u ON u.name = sd.username
GROUP BY u.id;


--- Create KPI View for Daily Learning Time
CREATE OR REPLACE VIEW "KPIDailyLearningTime" AS
WITH sessionized AS (
    SELECT
        e.id,
        e.username,
        e."createdAt",
        CASE
            WHEN LAG(e."createdAt") OVER (PARTITION BY e.username ORDER BY e."createdAt") IS NULL
                 OR e."createdAt" - LAG(e."createdAt") OVER (PARTITION BY e.username ORDER BY e."createdAt") > INTERVAL '30 minutes'
            THEN 1 ELSE 0
        END AS is_new_session
    FROM "EventLog" e
),
session_ids AS (
    SELECT
        id,
        username,
        "createdAt",
        SUM(is_new_session) OVER (PARTITION BY username ORDER BY "createdAt") AS session_id
    FROM sessionized
),
session_durations AS (
    SELECT
        username,
        session_id,
        MIN("createdAt") AS session_start,
        MAX("createdAt") AS session_end,
        EXTRACT(EPOCH FROM (MAX("createdAt") - MIN("createdAt"))) AS session_duration_seconds
    FROM session_ids
    GROUP BY username, session_id
)
SELECT
    u.id AS id,
    u.name AS username,
    DATE_TRUNC('day', session_start) AS day,
    SUM(session_duration_seconds) AS total_time_spent_seconds
FROM session_durations sd
JOIN "User" u ON u.name = sd.username
GROUP BY u.id, day;

--- Create KPI View for Daily Quiz Stats

CREATE VIEW "KPIDailyQuizStats" AS
SELECT
    u.id AS id,
    qa.username AS username,
    DATE(qa."createdAt") AS day,
    COUNT(qans."answerId") AS total_answers,
    SUM(CASE WHEN qans."isCorrect" THEN 1 ELSE 0 END) AS correct_answers,
    SUM(CASE WHEN NOT qans."isCorrect" THEN 1 ELSE 0 END) AS incorrect_answers,
    ROUND(
      (SUM(CASE WHEN qans."isCorrect" THEN 1 ELSE 0 END)::decimal / NULLIF(COUNT(qans."answerId"), 0)) * 100,
      2
    ) AS accuracy_percent
FROM "QuizAttempt" qa
JOIN "QuizAnswer" qans ON qa."attemptId" = qans."quizAttemptId"
JOIN "User" u ON u.name = qa.username
GROUP BY u.id, qa.username, day;

--- Create KPI View for Total Learning Time by Course
CREATE VIEW "KPITotalLearningTimeByCourse" AS
WITH sessionized AS (
    SELECT
        id,
        username,
        "courseId",
        "createdAt",
        CASE
            WHEN LAG("createdAt") OVER (PARTITION BY username, "courseId" ORDER BY "createdAt") IS NULL
                 OR "createdAt" - LAG("createdAt") OVER (PARTITION BY username, "courseId" ORDER BY "createdAt") > INTERVAL '30 minutes'
            THEN 1 ELSE 0
        END AS is_new_session
    FROM "EventLog"
    WHERE "courseId" IS NOT NULL
),
session_ids AS (
    SELECT
        id,
        username,
        "courseId",
        "createdAt",
        SUM(is_new_session) OVER (PARTITION BY username, "courseId" ORDER BY "createdAt") AS session_id
    FROM sessionized
),
session_durations AS (
    SELECT
        username,
        "courseId",
        session_id,
        MIN("createdAt") AS session_start,
        MAX("createdAt") AS session_end,
        EXTRACT(EPOCH FROM (MAX("createdAt") - MIN("createdAt"))) AS session_duration_seconds
    FROM session_ids
    GROUP BY username, "courseId", session_id
)
SELECT
    u.id AS id,
    sd.username,
    sd."courseId",
    COALESCE(c.title, 'N/A') AS "courseTitle",
    SUM(session_duration_seconds) AS total_time_spent_seconds
FROM session_durations sd
JOIN "User" u ON u.name = sd.username
LEFT JOIN "Course" c ON c."courseId" = sd."courseId"
GROUP BY u.id, sd.username, sd."courseId", c.title;

-- Create KPI View for Average Completion Rate by Author by Course
CREATE OR REPLACE VIEW "KPIAverageCompletionRateByAuthorByCourse" AS
SELECT
    u.id AS id,
    a.username AS author_username,
    c."courseId",
    COALESCE(c.title, 'N/A') AS "courseTitle",
    COUNT(e.username) AS total_enrollments,
    SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END) AS completed_enrollments,
    COALESCE(
        ROUND(
            (SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END)::decimal
             / NULLIF(COUNT(e.username), 0)) * 100,
        2),
        0
    ) AS course_completion_rate_percent
FROM "_AuthorToCourse" ac
JOIN "Author" a ON a.id = ac."A"
JOIN "Course" c ON c."courseId" = ac."B"
JOIN "User" u ON u."name" = a."username"
LEFT JOIN "Enrollment" e ON e."courseId" = c."courseId"
GROUP BY a.username, u.id, c."courseId", c.title;

-- Create KPI View for Average Completion Rate by Author
CREATE OR REPLACE VIEW "KPIAverageCompletionRateByAuthor" AS
WITH course_completion AS (
    SELECT
        a.username AS author_username,
        u.id AS id,
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
    id,
    author_username,
    ROUND(AVG(course_completion_rate_percent), 2) AS author_average_completion_rate_percent
FROM course_completion
GROUP BY author_username, id
ORDER BY author_username;
