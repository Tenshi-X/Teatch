-- Run once through the database SQL editor after migration 006.
-- pg_cron must first be enabled in this project's Supabase dashboard.
DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    RAISE EXCEPTION 'Enable pg_cron before installing the maintenance schedule';
  END IF;
END $$;
SELECT cron.schedule('teatch-runtime-maintenance','*/5 * * * *','SELECT public.maintain_runtime();');
-- Verify: SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname='teatch-runtime-maintenance';
-- Monitor: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
