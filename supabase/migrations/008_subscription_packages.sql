-- Run the ENTIRE file after 001-007 and before deploying the new application.
-- Quota rollout runs once per profile. No automatic billing or monthly refill.
BEGIN;
SET LOCAL search_path = public, extensions, pg_temp;

DO $$ BEGIN
  IF to_regprocedure('public.learning_summary(timestamptz)') IS NULL
    OR to_regclass('public.quota_ledger') IS NULL
    OR to_regprocedure('public.admin_runtime_summary(integer,text)') IS NULL
    OR to_regprocedure('public.update_worksheet_content(uuid,uuid,jsonb)') IS NOT NULL THEN
    RAISE EXCEPTION 'Apply migrations 001-007 before migration 008';
  END IF;
END $$;

-- Serialize with generation reservations and quota adjustments. Abort rather
-- than changing an allocation underneath a request whose refund is still due.
LOCK TABLE public.profiles IN SHARE ROW EXCLUSIVE MODE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quota_plan_version integer NOT NULL DEFAULT 1;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM public.profiles WHERE quota_plan_version<2)
    AND EXISTS(SELECT 1 FROM public.generation_requests WHERE status='reserved') THEN
    RAISE EXCEPTION 'GENERATION_PENDING: finish or reconcile active reservations, then rerun migration 008';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.subscription_question_limit(p_tier text) RETURNS integer
LANGUAGE sql IMMUTABLE SET search_path=public,pg_temp AS $$
  SELECT CASE p_tier WHEN 'free_trial' THEN 30 WHEN 'basic' THEN 1000
    WHEN 'pro' THEN 2500 WHEN 'family' THEN 2500 WHEN 'teacher' THEN 2500 ELSE 0 END;
$$;
REVOKE ALL ON FUNCTION public.subscription_question_limit(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.subscription_question_limit(text) TO authenticated,service_role;

ALTER TABLE public.profiles ALTER COLUMN worksheet_quota SET DEFAULT 30;

-- Use a recognized last allocation to preserve questions already spent:
-- 294/300 -> 994/1000; 2994/3000 -> 994/1000; 0/10 -> 20/30.
-- Unknown custom balances are preserved up to the new plan limit. Never divide
-- by 10, guess spending missing from the ledger, or reactivate expired accounts.
DO $$
DECLARE p record; allocation integer; previous_limit integer; next_balance integer;
BEGIN
  FOR p IN SELECT * FROM public.profiles WHERE quota_plan_version<2 ORDER BY id FOR UPDATE LOOP
    SELECT l.balance INTO allocation FROM public.quota_ledger l
      WHERE l.parent_id=p.id AND l.reason IN ('opening_balance','admin_adjustment','server_adjustment')
      ORDER BY l.created_at DESC,l.id DESC LIMIT 1;
    previous_limit:=CASE
      WHEN p.subscription_tier='free_trial' AND allocation IN (10,100) THEN allocation
      WHEN p.subscription_tier='basic' AND allocation IN (300,3000) THEN allocation
      WHEN p.subscription_tier IN ('pro','family','teacher') AND allocation IN (500,5000) THEN allocation
      ELSE NULL END;
    next_balance:=CASE WHEN previous_limit IS NOT NULL THEN
      greatest(0,subscription_question_limit(p.subscription_tier)-greatest(0,previous_limit-p.worksheet_quota))
      ELSE least(p.worksheet_quota,subscription_question_limit(p.subscription_tier)) END;
    PERFORM set_config('teatch.quota_reason','plan_upgrade_20261030',true);
    UPDATE public.profiles SET worksheet_quota=next_balance,quota_plan_version=2 WHERE id=p.id;
  END LOOP;
END $$;
ALTER TABLE public.profiles ALTER COLUMN quota_plan_version SET DEFAULT 2;

CREATE OR REPLACE FUNCTION public.has_subscription_feature(p_feature text) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public,pg_temp AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles p
    WHERE p.auth_user_id=auth.uid() AND p.subscription_status='active'
      AND (p.subscription_period_end IS NULL OR p.subscription_period_end>now())
      AND CASE p_feature
        WHEN 'progress_charts' THEN p.subscription_tier IN ('basic','pro','family','teacher')
        WHEN 'learning_insights' THEN p.subscription_tier IN ('pro','family','teacher')
        ELSE false END);
$$;
REVOKE ALL ON FUNCTION public.has_subscription_feature(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_subscription_feature(text) TO authenticated,service_role;

-- Guard the RPC itself, including direct authenticated REST calls. Basic own
-- history remains readable; Pro aggregate reports are returned only to Pro.
CREATE OR REPLACE FUNCTION public.learning_summary(p_since timestamptz DEFAULT now()-interval '90 days') RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public,pg_temp AS $$
WITH raw AS (
  SELECT x.id,x.is_correct,a.id attempt_id,a.child_id,coalesce(a.score,0) score,a.created_at,
    w.subject_id,s.name subject,nullif(w.objective_id,'') objective_id,coalesce(nullif(w.topic,''),w.title) topic,
    coalesce(nullif(w.objective_id,''),nullif(w.topic,''),w.title) group_key,w.difficulty
  FROM answers x JOIN attempts a ON a.id=x.attempt_id JOIN worksheets w ON w.id=a.worksheet_id
  JOIN children c ON c.id=a.child_id JOIN subjects s ON s.id=w.subject_id
  WHERE c.parent_id IN (SELECT id FROM profiles WHERE auth_user_id=auth.uid())
    AND public.has_subscription_feature('learning_insights')
    AND a.status='completed' AND a.scoring_version=2 AND a.created_at>=p_since AND x.is_correct IS NOT NULL
), totals AS (
  SELECT child_id,subject_id,group_key,difficulty,min(subject) subject,min(objective_id) objective_id,
    (array_agg(topic ORDER BY id))[1] topic,count(*) total,count(*) FILTER(WHERE is_correct) correct
  FROM raw GROUP BY child_id,subject_id,group_key,difficulty
), distinct_attempts AS (
  SELECT DISTINCT child_id,subject_id,group_key,difficulty,attempt_id,score,created_at FROM raw
), ranked AS (
  SELECT *,row_number() OVER(PARTITION BY child_id,subject_id,group_key,difficulty ORDER BY created_at DESC,attempt_id DESC) n
  FROM distinct_attempts
), trends AS (
  SELECT child_id,subject_id,group_key,difficulty,count(*) attempts,
    CASE WHEN count(*)>=10 THEN floor(avg(score) FILTER(WHERE n<=5)-avg(score) FILTER(WHERE n BETWEEN 6 AND 10)+0.5)::integer END trend
  FROM ranked GROUP BY child_id,subject_id,group_key,difficulty
)
SELECT coalesce(jsonb_agg(jsonb_build_object(
  'childId',t.child_id,'subjectId',t.subject_id,'subject',t.subject,'topic',t.topic,'objectiveId',t.objective_id,
  'difficulty',t.difficulty,'total',t.total,'correct',t.correct,'accuracy',round(t.correct*100.0/t.total),
  'attempts',r.attempts,'trend',r.trend,'status',CASE WHEN t.total<5 THEN 'insufficient' WHEN round(t.correct*100.0/t.total)>=80 THEN 'mastered' WHEN round(t.correct*100.0/t.total)<60 THEN 'practice' ELSE 'developing' END
) ORDER BY t.correct*100.0/t.total,t.subject_id,t.group_key),'[]'::jsonb)
FROM totals t JOIN trends r USING(child_id,subject_id,group_key,difficulty);
$$;
REVOKE ALL ON FUNCTION public.learning_summary(timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.learning_summary(timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_profile(p_profile uuid,p_changes jsonb,p_quota integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE current_profile public.profiles;
BEGIN
  SELECT * INTO current_profile FROM public.profiles WHERE id=p_profile FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF (p_quota IS NOT NULL OR p_changes->>'subscription_tier' IS DISTINCT FROM current_profile.subscription_tier)
    AND EXISTS(SELECT 1 FROM public.generation_requests WHERE parent_id=p_profile AND status='reserved') THEN
    RAISE EXCEPTION 'GENERATION_PENDING';
  END IF;
  IF p_quota IS NOT NULL AND p_quota<>public.subscription_question_limit(p_changes->>'subscription_tier') THEN
    RAISE EXCEPTION 'PLAN_QUOTA_MISMATCH';
  END IF;
  PERFORM set_config('teatch.quota_reason','admin_adjustment',true);
  UPDATE public.profiles SET role=p_changes->>'role',subscription_tier=p_changes->>'subscription_tier',
    subscription_status=p_changes->>'subscription_status',subscription_period_end=(p_changes->>'subscription_period_end')::timestamptz,
    subscription_period_start=CASE WHEN p_quota IS NOT NULL THEN now() ELSE subscription_period_start END,
    worksheet_quota=COALESCE(p_quota,worksheet_quota),quota_plan_version=2 WHERE id=p_profile;
END; $$;
REVOKE ALL ON FUNCTION public.admin_update_profile(uuid,jsonb,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_profile(uuid,jsonb,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_runtime_summary(p_offset integer DEFAULT 0,p_search text DEFAULT '') RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
WITH usage AS (
 SELECT parent_id,sum(question_count) FILTER(WHERE status='succeeded') used FROM generation_requests
 WHERE created_at>=date_trunc('month',now()) GROUP BY parent_id
), page AS (
 SELECT p.*,coalesce(u.used,0) usage FROM profiles p LEFT JOIN usage u ON u.parent_id=p.id
 WHERE p.full_name ILIKE '%'||left(p_search,100)||'%' OR coalesce(p.email,'') ILIKE '%'||left(p_search,100)||'%'
 ORDER BY p.created_at DESC,p.id DESC LIMIT 50 OFFSET greatest(0,p_offset)
)
SELECT jsonb_build_object('profiles',coalesce((SELECT jsonb_agg(to_jsonb(page)) FROM page),'[]'::jsonb),
 'matchedUsers',(SELECT count(*) FROM profiles p WHERE p.full_name ILIKE '%'||left(p_search,100)||'%' OR coalesce(p.email,'') ILIKE '%'||left(p_search,100)||'%'),
 'metrics',jsonb_build_object('totalUsers',(SELECT count(*) FROM profiles),
 'activeSubscriptions',(SELECT count(*) FROM profiles WHERE subscription_tier<>'free_trial' AND subscription_status='active' AND (subscription_period_end IS NULL OR subscription_period_end>now())),
 'totalQuota',(SELECT coalesce(sum(public.subscription_question_limit(subscription_tier)),0) FROM profiles),
 'totalUsage',(SELECT coalesce(sum(used),0) FROM usage),
 'failed',(SELECT count(*) FROM generation_requests WHERE status='failed' AND created_at>=date_trunc('month',now())),
 'reserved',(SELECT count(*) FROM generation_requests WHERE status='reserved'),
 'tokens',(SELECT coalesce(sum(CASE WHEN jsonb_typeof(usage->'totalTokens')='number' THEN (usage->>'totalTokens')::numeric ELSE 0 END),0) FROM generation_requests WHERE created_at>=date_trunc('month',now())),
 'activeParents7d',(SELECT count(DISTINCT parent_id) FROM product_events WHERE kind='visit' AND created_at>=now()-interval '7 days'),
 'feedbackOpen',(SELECT count(*) FROM product_feedback WHERE status='open')));
$$;
REVOKE ALL ON FUNCTION public.admin_runtime_summary(integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_runtime_summary(integer,text) TO service_role;

NOTIFY pgrst,'reload schema';
COMMIT;

SELECT
  (SELECT column_default::text='30' FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='worksheet_quota') AS trial_quota_ready,
  NOT EXISTS(SELECT 1 FROM public.profiles WHERE quota_plan_version<2) AS existing_quotas_migrated,
  public.subscription_question_limit('basic')=1000 AND public.subscription_question_limit('pro')=2500 AS paid_quotas_ready,
  to_regprocedure('public.has_subscription_feature(text)') IS NOT NULL AS feature_access_ready;
