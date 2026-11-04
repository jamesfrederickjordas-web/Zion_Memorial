-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 3b: DAILY AUTO-DEBIT SCHEDULER (pg_cron)
--
-- BEFORE RUNNING:
--   1. Database > Extensions: enable "pg_cron" and "pg_net".
--   2. Replace  YOUR_CRON_SECRET  below with the SAME value you set as the
--      Edge Function secret CRON_SECRET (see GCASH_AUTODEBIT_SETUP.md).
--
-- Runs every day at 01:00 UTC (= 9:00 AM Philippine Time):
--   * charges every installment due today (or overdue, max 3 retries)
--   * emails 3-day pre-due reminders
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove the old job if it exists (safe re-run)
DO $$
BEGIN
    PERFORM cron.unschedule('zmg-gcash-autodebit-daily');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

SELECT cron.schedule(
    'zmg-gcash-autodebit-daily',
    '0 1 * * *',
    $$
    SELECT net.http_post(
        url     := 'https://mjhkglatnwcudwcpbzsp.supabase.co/functions/v1/gcash-autodebit-run',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', 'zmg_cron_secure_2026'
        ),
        body    := '{}'::jsonb
    );
    $$
);

-- Check the job:      SELECT * FROM cron.job;
-- Check run history:  SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

