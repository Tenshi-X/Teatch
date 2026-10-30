BEGIN;

-- Invoker functions keep both explicit ownership checks and the caller's RLS.
CREATE FUNCTION learning_summary(p_since timestamptz DEFAULT now()-interval '90 days') RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public,pg_temp AS $$
WITH raw AS (
  SELECT x.id, x.is_correct, a.id attempt_id, a.child_id, coalesce(a.score,0) score, a.created_at,
    w.subject_id, s.name subject, nullif(w.objective_id,'') objective_id, coalesce(nullif(w.topic,''),w.title) topic,
    coalesce(nullif(w.objective_id,''),nullif(w.topic,''),w.title) group_key, w.difficulty
  FROM answers x JOIN attempts a ON a.id=x.attempt_id JOIN worksheets w ON w.id=a.worksheet_id
  JOIN children c ON c.id=a.child_id JOIN subjects s ON s.id=w.subject_id
  WHERE c.parent_id IN (SELECT id FROM profiles WHERE auth_user_id=auth.uid())
    AND a.status='completed' AND a.scoring_version=2 AND a.created_at>=p_since AND x.is_correct IS NOT NULL
), totals AS (
  SELECT child_id,subject_id,group_key,difficulty, min(subject) subject, min(objective_id) objective_id,
    (array_agg(topic ORDER BY id))[1] topic, count(*) total, count(*) FILTER(WHERE is_correct) correct
  FROM raw GROUP BY child_id,subject_id,group_key,difficulty
), distinct_attempts AS (
  SELECT DISTINCT child_id,subject_id,group_key,difficulty,attempt_id,score,created_at FROM raw
), ranked AS (
  SELECT *, row_number() OVER(PARTITION BY child_id,subject_id,group_key,difficulty ORDER BY created_at DESC,attempt_id DESC) n
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

CREATE FUNCTION dashboard_overview() RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public,pg_temp AS $$
SELECT coalesce(jsonb_object_agg(c.id,jsonb_build_object(
  'stats',jsonb_build_object('totalWorksheets',(SELECT count(*) FROM worksheets w WHERE w.child_id=c.id),
    'totalAttempts',stats.total,'averageScore',stats.average,'totalQuestions',stats.questions),
  'pendingReviews',(SELECT count(*) FROM attempts a WHERE a.child_id=c.id AND a.status='pending_review'),
  'latestWorksheet',(SELECT jsonb_build_object('id',w.id,'title',w.title) FROM worksheets w WHERE w.child_id=c.id AND w.status='generated' ORDER BY w.created_at DESC,w.id DESC LIMIT 1),
  'activities',coalesce((SELECT jsonb_agg(v.item ORDER BY v.created_at DESC) FROM (
    SELECT * FROM (
      SELECT jsonb_build_object('id','ws-'||w.id,'type','worksheet_created','title',w.title,'subject',s.name,'href','/worksheets/'||w.id,'createdAt',w.created_at) item,w.created_at
      FROM worksheets w JOIN subjects s ON s.id=w.subject_id WHERE w.child_id=c.id ORDER BY w.created_at DESC,w.id DESC LIMIT 5
    ) ws UNION ALL SELECT * FROM (
      SELECT jsonb_build_object('id','att-'||a.id,'type','attempt_completed','title',w.title,'subject',s.name,'href','/worksheets/'||w.id,'score',coalesce(a.score,0),'createdAt',a.created_at) item,a.created_at
      FROM attempts a JOIN worksheets w ON w.id=a.worksheet_id JOIN subjects s ON s.id=w.subject_id
      WHERE a.child_id=c.id AND a.status='completed' AND a.scoring_version=2 ORDER BY a.created_at DESC,a.id DESC LIMIT 5
    ) ats
    ORDER BY created_at DESC LIMIT 5
  ) v),'[]'::jsonb)
)),'{}'::jsonb)
FROM children c CROSS JOIN LATERAL (
  SELECT count(*) total,coalesce(round(avg(coalesce(a.score,0))),0) average,coalesce(sum(a.total_questions),0) questions
  FROM attempts a WHERE a.child_id=c.id AND a.status='completed' AND a.scoring_version=2
) stats
WHERE c.parent_id IN (SELECT id FROM profiles WHERE auth_user_id=auth.uid());
$$;
REVOKE ALL ON FUNCTION learning_summary(timestamptz),dashboard_overview() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION learning_summary(timestamptz),dashboard_overview() TO authenticated;

CREATE TABLE product_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  worksheet_id uuid REFERENCES worksheets(id) ON DELETE SET NULL,
  category text NOT NULL CHECK(category IN ('helpful','problem','idea')),
  comment text NOT NULL DEFAULT '' CHECK(length(comment)<=1000),
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE product_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_key uuid NOT NULL, kind text NOT NULL CHECK(kind IN ('visit','attempt_started','plan_clicked')),
  worksheet_id uuid REFERENCES worksheets(id) ON DELETE SET NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(parent_id,event_key)
);
ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON product_feedback,product_events FROM anon,authenticated;
GRANT SELECT ON product_feedback,product_events TO authenticated;
CREATE POLICY feedback_own ON product_feedback FOR SELECT TO authenticated USING(parent_id IN (SELECT id FROM profiles WHERE auth_user_id=auth.uid()) OR is_admin());
CREATE POLICY events_own ON product_events FOR SELECT TO authenticated USING(parent_id IN (SELECT id FROM profiles WHERE auth_user_id=auth.uid()) OR is_admin());
GRANT ALL ON product_feedback,product_events TO service_role;
CREATE INDEX product_feedback_parent_time ON product_feedback(parent_id,created_at DESC);
CREATE INDEX product_events_parent_time ON product_events(parent_id,created_at DESC);
CREATE INDEX product_events_created ON product_events(created_at);

CREATE FUNCTION submit_product_feedback(p_parent uuid,p_worksheet uuid,p_category text,p_comment text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE result uuid;
BEGIN
  PERFORM 1 FROM profiles WHERE id=p_parent FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF p_worksheet IS NOT NULL AND NOT EXISTS(SELECT 1 FROM worksheets w JOIN children c ON c.id=w.child_id WHERE w.id=p_worksheet AND c.parent_id=p_parent) THEN RAISE EXCEPTION 'OWNERSHIP_INVALID'; END IF;
  IF (SELECT count(*) FROM product_feedback WHERE parent_id=p_parent AND created_at>now()-interval '1 hour')>=5 THEN RAISE EXCEPTION 'RATE_LIMIT'; END IF;
  INSERT INTO product_feedback(parent_id,worksheet_id,category,comment) VALUES(p_parent,p_worksheet,p_category,trim(p_comment)) RETURNING id INTO result;
  RETURN result;
END; $$;
CREATE FUNCTION record_product_event(p_parent uuid,p_key uuid,p_kind text,p_worksheet uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  PERFORM 1 FROM profiles WHERE id=p_parent FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF p_worksheet IS NOT NULL AND NOT EXISTS(SELECT 1 FROM worksheets w JOIN children c ON c.id=w.child_id WHERE w.id=p_worksheet AND c.parent_id=p_parent) THEN RAISE EXCEPTION 'OWNERSHIP_INVALID'; END IF;
  IF EXISTS(SELECT 1 FROM product_events WHERE parent_id=p_parent AND event_key=p_key) THEN RETURN; END IF;
  IF (SELECT count(*) FROM product_events WHERE parent_id=p_parent AND created_at>now()-interval '1 hour')>=60 THEN RAISE EXCEPTION 'RATE_LIMIT'; END IF;
  INSERT INTO product_events(parent_id,event_key,kind,worksheet_id) VALUES(p_parent,p_key,p_kind,p_worksheet);
END; $$;
CREATE FUNCTION maintain_runtime() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE refunded integer; removed integer;
BEGIN
  refunded:=reconcile_generation_reservations();
  DELETE FROM product_events WHERE created_at<now()-interval '90 days';
  GET DIAGNOSTICS removed=ROW_COUNT;
  RETURN jsonb_build_object('refundedReservations',refunded,'deletedEvents',removed);
END; $$;
REVOKE ALL ON FUNCTION submit_product_feedback(uuid,uuid,text,text),record_product_event(uuid,uuid,text,uuid),maintain_runtime() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION submit_product_feedback(uuid,uuid,text,text),record_product_event(uuid,uuid,text,uuid),maintain_runtime() TO service_role;

CREATE FUNCTION admin_runtime_summary(p_offset integer DEFAULT 0,p_search text DEFAULT '') RETURNS jsonb
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
 'totalQuota',(SELECT coalesce(sum(CASE subscription_tier WHEN 'free_trial' THEN 10 WHEN 'basic' THEN 300 ELSE 500 END),0) FROM profiles),
 'totalUsage',(SELECT coalesce(sum(used),0) FROM usage),
 'failed',(SELECT count(*) FROM generation_requests WHERE status='failed' AND created_at>=date_trunc('month',now())),
 'reserved',(SELECT count(*) FROM generation_requests WHERE status='reserved'),
 'tokens',(SELECT coalesce(sum(CASE WHEN jsonb_typeof(usage->'totalTokens')='number' THEN (usage->>'totalTokens')::numeric ELSE 0 END),0) FROM generation_requests WHERE created_at>=date_trunc('month',now())),
 'activeParents7d',(SELECT count(DISTINCT parent_id) FROM product_events WHERE kind='visit' AND created_at>=now()-interval '7 days'),
 'feedbackOpen',(SELECT count(*) FROM product_feedback WHERE status='open')));
$$;
REVOKE ALL ON FUNCTION admin_runtime_summary(integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION admin_runtime_summary(integer,text) TO service_role;
COMMIT;
