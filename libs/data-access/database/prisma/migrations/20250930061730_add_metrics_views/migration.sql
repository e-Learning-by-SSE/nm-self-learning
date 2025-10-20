-- Create KPI View for Total Learning Time
CREATE OR REPLACE VIEW "TotalLearningTime" AS
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
    u.id AS "id",
    u.name AS "username",
    SUM(session_duration_seconds) AS "totalTimeSeconds"
FROM session_durations sd
JOIN "User" u ON u.name = sd.username
GROUP BY u.id;


--- Create KPI View for Daily Learning Time
CREATE OR REPLACE VIEW "DailyLearningTime" AS
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
    u.id AS "id",
    u.name AS "username",
    DATE_TRUNC('day', session_start) AS "day",
    SUM(session_duration_seconds) AS "totalTimeSeconds"
FROM session_durations sd
JOIN "User" u ON u.name = sd.username
GROUP BY u.id, day;

--- Create KPI View for Daily Quiz Stats
CREATE VIEW "DailyQuizStats" AS
SELECT
    u.id AS "id",
    qa.username AS "username",
    DATE(qa."createdAt") AS "day",
    COUNT(qans."answerId") AS "totalAnswers",
    SUM(CASE WHEN qans."isCorrect" THEN 1 ELSE 0 END) AS "correctAnswers",
    SUM(CASE WHEN NOT qans."isCorrect" THEN 1 ELSE 0 END) AS "incorrectAnswers",
    ROUND(
      (SUM(CASE WHEN qans."isCorrect" THEN 1 ELSE 0 END)::decimal / NULLIF(COUNT(qans."answerId"), 0)) * 100,
      2
    ) AS "accuracyPercent"
FROM "QuizAttempt" qa
JOIN "QuizAnswer" qans ON qa."attemptId" = qans."quizAttemptId"
JOIN "User" u ON u.name = qa.username
GROUP BY u.id, qa.username, day;

--- Create KPI View for Total Learning Time by Course
CREATE VIEW "TotalLearningTimeByCourse" AS
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
    u.id AS "id",
    sd.username AS "username",
    sd."courseId",
    COALESCE(c.title, 'N/A') AS "courseTitle",
    SUM(session_duration_seconds) AS "totalTimeSeconds"
FROM session_durations sd
JOIN "User" u ON u.name = sd."username"
LEFT JOIN "Course" c ON c."courseId" = sd."courseId"
GROUP BY u.id, sd."username", sd."courseId", c.title;

-- Create KPI View for Average Completion Rate by Author by Course
CREATE OR REPLACE VIEW "AverageCompletionRateByAuthorByCourse" AS
SELECT
    u.id AS "id",
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
    ) AS "completionRatePercent"
FROM "_AuthorToCourse" ac
JOIN "Author" a ON a.id = ac."A"
JOIN "Course" c ON c."courseId" = ac."B"
JOIN "User" u ON u."name" = a."username"
LEFT JOIN "Enrollment" e ON e."courseId" = c."courseId"
GROUP BY a.username, u.id, c."courseId", c.title;

-- Create KPI View for Average Completion Rate by Author
CREATE OR REPLACE VIEW "AverageCompletionRateByAuthor" AS
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
    id AS "id",
    author_username AS "authorUsername",
    ROUND(AVG(course_completion_rate_percent), 2) AS "averageCompletionPercent"
FROM course_completion
GROUP BY author_username, id
ORDER BY author_username;

-- Create KPI View for Average Completion Rate by Author by Subject
CREATE OR REPLACE VIEW "AverageCompletionRateByAuthorBySubject" AS
SELECT
    u.id AS "id",
    a.username AS "authorUsername",
    s."subjectId",
    s.title AS "subjectTitle",

    COUNT(DISTINCT c."courseId") AS "totalCourses",
    
    COUNT(e."username") AS "totalEnrollments",

    SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END) AS "completedEnrollments",

    -- Completion rate across author’s courses in this subject
    ROUND(
        COALESCE(
            (SUM(CASE WHEN e."status" = 'COMPLETED' OR e."completedAt" IS NOT NULL THEN 1 ELSE 0 END)::decimal
             / NULLIF(COUNT(e."username"), 0)) * 100,
            0
        ),
    2) AS "completionRatePercent"

FROM "_AuthorToCourse" ac
JOIN "Author" a ON a.id = ac."A"
JOIN "Course" c ON c."courseId" = ac."B"
JOIN "User" u ON u."name" = a."username"
JOIN "Subject" s ON s."subjectId" = c."subjectId"
LEFT JOIN "Enrollment" e ON e."courseId" = c."courseId"

GROUP BY u.id, a.username, s."subjectId", s.title
ORDER BY a.username, s.title;

-- Create KPI View for Daily Learning Time by Course
CREATE OR REPLACE VIEW "DailyLearningTimeByCourse" AS
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
    u.id AS "id",
    sd.username AS "username",
    sd."courseId",
    COALESCE(c.title, 'N/A') AS "courseTitle",
    DATE_TRUNC('day', session_start) AS "day",
    SUM(session_duration_seconds) AS "totalTimeSeconds"
FROM session_durations sd
JOIN "User" u ON u.name = sd.username
LEFT JOIN "Course" c ON c."courseId" = sd."courseId"
GROUP BY u.id, sd.username, sd."courseId", c.title, DATE_TRUNC('day', session_start)
ORDER BY sd.username, c.title, day;

-- Create KPI View for Learning Streaks
CREATE OR REPLACE VIEW "LearningStreak" AS
WITH user_days AS (
    SELECT
        username,
        DATE("createdAt") AS day
    FROM "EventLog"
    GROUP BY username, DATE("createdAt")
),
streak_groups AS (
    SELECT
        username,
        day,
        DATE(day - (ROW_NUMBER() OVER (PARTITION BY username ORDER BY day)) * INTERVAL '1 day') AS streak_group
    FROM user_days
),
streak_lengths AS (
    SELECT
        username,
        streak_group,
        COUNT(*) AS streak_length,
        MAX(day) AS last_day
    FROM streak_groups
    GROUP BY username, streak_group
)
SELECT
    u.id AS "id",
    u.name AS "username",
    COALESCE(MAX(sl.streak_length), 0) AS "longestStreakDays",
    COALESCE((
        SELECT streak_length
        FROM streak_lengths s2
        WHERE s2.username = u.name
          AND s2.last_day = (SELECT MAX(day) FROM user_days WHERE username = u.name)
        LIMIT 1
    ), 0) AS "currentStreakDays"
FROM "User" u
LEFT JOIN streak_lengths sl ON sl.username = u.name
GROUP BY u.id, u.name
ORDER BY "longestStreakDays" DESC;

-- Create KPI View for Courses Completed Per Subject
CREATE OR REPLACE VIEW "CoursesCompletedBySubject" AS
SELECT
    u.id AS id,
    u.name AS username,
    s."subjectId",
    s."title" AS subject_title,
    COUNT(DISTINCT e."courseId") AS total_completed_courses,
    STRING_AGG(DISTINCT c."title", ', ' ORDER BY c."title") AS completed_courses
FROM "Enrollment" e
JOIN "Course" c ON c."courseId" = e."courseId"
JOIN "Subject" s ON s."subjectId" = c."subjectId"
JOIN "User" u ON u.name = e."username"
WHERE e."completedAt" IS NOT NULL
   OR e."status" = 'COMPLETED'
GROUP BY u.id, u.name, s."subjectId", s."title"
ORDER BY u."name", s."title";
