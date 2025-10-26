-- Student Learning Time
CREATE OR REPLACE VIEW "StudentMetric_LearningTime" AS
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
    u.id AS "userId",
    u.name AS "username",
    SUM(session_duration_seconds) AS "timeSeconds"
FROM session_durations sd
JOIN "User" u ON u.name = sd.username
GROUP BY u.id
HAVING SUM(session_duration_seconds) > 0;


--- Student Daily Learning Time
CREATE OR REPLACE VIEW "StudentMetric_DailyLearningTime" AS
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
    u.id AS "userId",
    u.name AS "username",
    DATE_TRUNC('day', session_start) AS "day",
    SUM(session_duration_seconds) AS "timeSeconds"
FROM session_durations sd
JOIN "User" u ON u.name = sd.username
GROUP BY u.id, day
HAVING SUM(session_duration_seconds) > 0;

--- Student Hourly Learning Time
CREATE OR REPLACE VIEW "StudentMetric_HourlyLearningTime" AS
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
    id, username, "createdAt",
    SUM(is_new_session) OVER (PARTITION BY username ORDER BY "createdAt") AS session_id
  FROM sessionized
),
session_durations AS (
  SELECT
    username,
    session_id,
    MIN("createdAt") AS session_start,
    MAX("createdAt") AS session_end
  FROM session_ids
  GROUP BY username, session_id
),
expanded AS (
  SELECT
    sd.username,
    gs AS hour_start,
    LEAST(sd.session_end, gs + INTERVAL '1 hour') - GREATEST(sd.session_start, gs) AS overlap
  FROM session_durations sd
  JOIN generate_series(
    DATE_TRUNC('hour', session_start),
    DATE_TRUNC('hour', session_end),
    INTERVAL '1 hour'
  ) AS gs ON gs < sd.session_end
)
SELECT
  u.id AS "userId",
  u.name AS "username",
  DATE_TRUNC('hour', hour_start) AS "hour",
  SUM(EXTRACT(EPOCH FROM overlap)) AS "timeSeconds"
FROM expanded
JOIN "User" u ON u.name = expanded.username
WHERE overlap > INTERVAL '0 second'
GROUP BY u.id, "hour"
HAVING SUM(EXTRACT(EPOCH FROM overlap)) > 0
ORDER BY u.id, "hour";

--- Student Learning Time by Course
CREATE VIEW "StudentMetric_LearningTimeByCourse" AS
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
    u.id AS "userId",
    sd.username AS "username",
    sd."courseId",
    COALESCE(c.title, 'N/A') AS "courseTitle",
    SUM(session_duration_seconds) AS "timeSeconds"
FROM session_durations sd
JOIN "User" u ON u.name = sd."username"
LEFT JOIN "Course" c ON c."courseId" = sd."courseId"
GROUP BY u.id, sd."username", sd."courseId", c.title
HAVING SUM(session_duration_seconds) > 0;

-- Student Daily Learning Time by Course
CREATE OR REPLACE VIEW "StudentMetric_DailyLearningTimeByCourse" AS
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
    u.id AS "userId",
    sd.username AS "username",
    sd."courseId",
    COALESCE(c.title, 'N/A') AS "courseTitle",
    DATE_TRUNC('day', session_start) AS "day",
    SUM(session_duration_seconds) AS "timeSeconds"
FROM session_durations sd
JOIN "User" u ON u.name = sd.username
LEFT JOIN "Course" c ON c."courseId" = sd."courseId"
GROUP BY u.id, sd.username, sd."courseId", c.title, DATE_TRUNC('day', session_start)
HAVING SUM(session_duration_seconds) > 0
ORDER BY sd.username, c.title, "day";

-- Student Courses Completed by Subject
CREATE OR REPLACE VIEW "StudentMetric_CoursesCompletedBySubject" AS
SELECT
    u.id AS "userId",
    u.name AS "username",
    s."subjectId",
    s."title" AS "subjectTitle",
    --- Active/Enrolled Courses
    COUNT(DISTINCT CASE WHEN e."status" = 'ACTIVE' THEN e."courseId" END) AS "ActiveCoursesCount",
    STRING_AGG(DISTINCT CASE WHEN e."status" = 'ACTIVE' THEN c."title" END, ', ') AS "activeCourses",
    --- Completed Courses
    COUNT(DISTINCT CASE WHEN e."status" = 'COMPLETED' THEN e."courseId" END) AS "completedCoursesCount",
    STRING_AGG(DISTINCT CASE WHEN e."status" = 'COMPLETED' THEN c."title" END, ', ') AS "completedCourses"
FROM "Enrollment" e
JOIN "Course" c ON c."courseId" = e."courseId"
JOIN "Subject" s ON s."subjectId" = c."subjectId"
JOIN "User" u ON u.name = e."username"
GROUP BY u.id, u.name, s."subjectId", s."title"
ORDER BY u.name, s."title";

-- Student Learning Streak
CREATE OR REPLACE VIEW "StudentMetric_LearningStreak" AS
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
    u.id AS "userId",
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

-- Student Average Quiz Answers
CREATE OR REPLACE VIEW "StudentMetric_AverageQuizAnswers" AS
SELECT
    u.id AS "userId",
    u.name AS "username",
    c."courseId",
    c."title" AS "courseTitle",
    l."lessonId",
    l."title" AS "lessonTitle",
    -- Wrong Answers
    COUNT(CASE WHEN qans."isCorrect" = FALSE THEN 1 END) AS "wrongAnswers",
    -- Correct Answers
    COUNT(CASE WHEN qans."isCorrect" = TRUE THEN 1 END) AS "correctAnswers",
    -- Calculate Average
    ROUND(
      (COUNT(CASE WHEN qans."isCorrect" = TRUE THEN 1 END)::decimal /
       NULLIF(COUNT(qans."answerId"), 0)) * 100,
      2
    ) AS "averageAccuracyRate"
FROM "User" u
JOIN "Student" s ON s."userId" = u.id
JOIN "QuizAttempt" qa ON qa.username = s.username
JOIN "QuizAnswer" qans ON qans."quizAttemptId" = qa."attemptId"
JOIN "Lesson" l ON l."lessonId" = qa."lessonId"
JOIN "StartedLesson" sl ON sl."lessonId" = l."lessonId" AND sl.username = s.username
JOIN "Course" c ON c."courseId" = sl."courseId"
GROUP BY u.id, u."name", c."courseId", c."title", l."lessonId", l."title";

--- Student Hourly Average Quiz Answers
CREATE OR REPLACE VIEW "StudentMetric_HourlyAverageQuizAnswers" AS
SELECT
    u.id AS "userId",
    u.name AS "username",
    c."courseId",
    c."title" AS "courseTitle",
    l."lessonId",
    l."title" AS "lessonTitle",
    DATE_TRUNC('hour', qans."createdAt") AS "hour",
    -- Wrong Answers
    COUNT(CASE WHEN qans."isCorrect" = FALSE THEN 1 END) AS "wrongAnswers",
    -- Correct Answers
    COUNT(CASE WHEN qans."isCorrect" = TRUE THEN 1 END) AS "correctAnswers",
    -- Calculate Average
    ROUND(
      (COUNT(CASE WHEN qans."isCorrect" = TRUE THEN 1 END)::decimal /
       NULLIF(COUNT(qans."answerId"), 0)) * 100,
      2
    ) AS "averageAccuracyRate"
FROM "User" u
JOIN "Student" s ON s."userId" = u.id
JOIN "QuizAttempt" qa ON qa.username = s.username
JOIN "QuizAnswer" qans ON qans."quizAttemptId" = qa."attemptId"
JOIN "Lesson" l ON l."lessonId" = qa."lessonId"
JOIN "StartedLesson" sl ON sl."lessonId" = l."lessonId" AND sl.username = s.username
JOIN "Course" c ON c."courseId" = sl."courseId"
GROUP BY
    u.id,
    u.name,
    c."courseId",
    c."title",
    l."lessonId",
    l."title",
    DATE_TRUNC('hour', qans."createdAt")
ORDER BY u.name, c.title, l.title, "hour";


