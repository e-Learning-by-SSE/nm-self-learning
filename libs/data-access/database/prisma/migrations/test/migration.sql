-- Creates a view to calculate total time spent by each user based on sessions
-- A session is defined as a series of events with no more than 30 minutes between them

--CREATE OR REPLACE VIEW kpi_total_time_spent AS

DROP TABLE IF EXISTS kpi_total_time_spent;

CREATE TABLE kpi_total_time_spent AS
WITH sessionized AS (
    SELECT
        id,
        username,
        "createdAt",
        CASE
            WHEN LAG("createdAt") OVER (PARTITION BY username ORDER BY "createdAt") IS NULL
                 OR "createdAt" - LAG("createdAt") OVER (PARTITION BY username ORDER BY "createdAt") > INTERVAL '30 minutes'
            THEN 1 ELSE 0
        END AS is_new_session
    FROM "EventLog"
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
    username,
    SUM(session_duration_seconds) AS total_time_spent_seconds
FROM session_durations
GROUP BY username;