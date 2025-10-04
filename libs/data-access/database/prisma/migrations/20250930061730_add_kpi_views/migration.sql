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