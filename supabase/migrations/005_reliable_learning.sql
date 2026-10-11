-- Apply before deploying the new application. Existing balances and scores are preserved.
BEGIN;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check CHECK (subscription_tier IN ('free_trial','basic','pro','family','teacher'));
UPDATE profiles SET worksheet_quota = GREATEST(COALESCE(worksheet_quota, 0), 0);
ALTER TABLE profiles ALTER COLUMN worksheet_quota SET NOT NULL;
ALTER TABLE profiles ADD CONSTRAINT profiles_quota_nonnegative CHECK (worksheet_quota >= 0);
ALTER TABLE profiles ALTER COLUMN subscription_period_end SET DEFAULT (now() + interval '30 days');
CREATE TABLE quota_ledger(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,delta integer NOT NULL,balance integer NOT NULL,reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE quota_ledger ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON quota_ledger FROM anon,authenticated;
CREATE INDEX quota_ledger_parent ON quota_ledger(parent_id);
INSERT INTO quota_ledger(parent_id,delta,balance,reason) SELECT id,worksheet_quota,worksheet_quota,'opening_balance' FROM profiles;
CREATE FUNCTION record_quota_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  IF TG_OP='INSERT' THEN INSERT INTO quota_ledger(parent_id,delta,balance,reason)VALUES(NEW.id,NEW.worksheet_quota,NEW.worksheet_quota,'opening_balance');
  ELSIF NEW.worksheet_quota<>OLD.worksheet_quota THEN INSERT INTO quota_ledger(parent_id,delta,balance,reason)VALUES(NEW.id,NEW.worksheet_quota-OLD.worksheet_quota,NEW.worksheet_quota,COALESCE(NULLIF(current_setting('teatch.quota_reason',true),''),'server_adjustment')); END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER audit_quota AFTER INSERT OR UPDATE OF worksheet_quota ON profiles FOR EACH ROW EXECUTE FUNCTION record_quota_change();
REVOKE UPDATE ON profiles FROM anon, authenticated;
REVOKE INSERT,DELETE ON profiles FROM anon,authenticated;
GRANT UPDATE(full_name, phone_number, is_onboarded, avatar_url) ON profiles TO authenticated;
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public,pg_temp AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role = 'admin');
$$;
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
BEGIN
  INSERT INTO profiles(auth_user_id, full_name, email, role)
  VALUES(NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email, 'user');
  RETURN NEW;
END; $$;

ALTER TABLE worksheets DROP CONSTRAINT IF EXISTS worksheets_question_type_check;
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE worksheets ADD CONSTRAINT worksheets_question_type_check CHECK (question_type IN ('multiple_choice','essay','short_answer','matching','guess_image','image_matching','true_false','word_jumble','sentence_jumble','ordering','pattern_completion','count_image','choose_image','image_label','grouping','story_qa','drag_and_drop','coloring'));
ALTER TABLE questions ADD CONSTRAINT questions_type_check CHECK (type IN ('multiple_choice','essay','short_answer','matching','guess_image','image_matching','true_false','word_jumble','sentence_jumble','ordering','pattern_completion','count_image','choose_image','image_label','grouping','story_qa','drag_and_drop','coloring'));
ALTER TABLE worksheets DROP CONSTRAINT IF EXISTS worksheets_status_check;
ALTER TABLE worksheets ADD CONSTRAINT worksheets_status_check CHECK (status IN ('generating','draft','generated','error'));
ALTER TABLE worksheets ADD COLUMN objective_id text, ADD COLUMN schema_version integer NOT NULL DEFAULT 1;
ALTER TABLE questions ADD COLUMN content jsonb NOT NULL DEFAULT '{}', ADD COLUMN schema_version integer NOT NULL DEFAULT 1;
UPDATE questions q SET content = w.ai_response->'questions'->q.order_index
FROM worksheets w WHERE q.worksheet_id=w.id AND jsonb_typeof(w.ai_response->'questions'->q.order_index)='object';
ALTER TABLE attempts DROP CONSTRAINT IF EXISTS attempts_status_check;
ALTER TABLE attempts ADD CONSTRAINT attempts_status_check CHECK (status IN ('in_progress','pending_review','completed'));
ALTER TABLE attempts ADD COLUMN scoring_version integer NOT NULL DEFAULT 1, ADD COLUMN submission_key uuid;
CREATE UNIQUE INDEX attempts_submission_key ON attempts(child_id, submission_key);
ALTER TABLE answers ADD COLUMN review_status text NOT NULL DEFAULT 'graded' CHECK (review_status IN ('graded','pending'));
REVOKE INSERT, UPDATE ON worksheets, questions, attempts, answers FROM anon, authenticated;
REVOKE DELETE ON questions, attempts, answers FROM anon, authenticated;

CREATE TABLE generation_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_key uuid NOT NULL, request_hash text NOT NULL, question_count integer NOT NULL CHECK(question_count BETWEEN 1 AND 20),
  status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','succeeded','failed')),
  worksheet_id uuid REFERENCES worksheets(id) ON DELETE SET NULL, usage jsonb NOT NULL DEFAULT '{}', error_code text,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(parent_id, request_key)
);
ALTER TABLE generation_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON generation_requests FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON generation_requests TO service_role;
CREATE INDEX generation_requests_reserved ON generation_requests(parent_id, created_at) WHERE status='reserved';

CREATE FUNCTION reserve_generation(p_parent uuid, p_key uuid, p_hash text, p_count integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE p profiles; r generation_requests; refunded integer;
BEGIN
  IF p_count NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'INVALID_COUNT'; END IF;
  SELECT * INTO p FROM profiles WHERE id=p_parent FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  -- Recovery after a server crash. The HTTP generation timeout is under one minute.
  WITH expired AS (
    UPDATE generation_requests SET status='failed', error_code='EXPIRED'
    WHERE parent_id=p_parent AND status='reserved' AND created_at < now()-interval '15 minutes'
    RETURNING question_count
  ) SELECT COALESCE(sum(question_count),0) INTO refunded FROM expired;
  IF refunded>0 THEN PERFORM set_config('teatch.quota_reason','expired_refund',true); UPDATE profiles SET worksheet_quota=worksheet_quota+refunded WHERE id=p_parent; p.worksheet_quota:=p.worksheet_quota+refunded; END IF;
  SELECT * INTO r FROM generation_requests WHERE parent_id=p_parent AND request_key=p_key;
  IF FOUND THEN
    IF r.request_hash<>p_hash THEN RAISE EXCEPTION 'KEY_CONFLICT'; END IF;
    RETURN jsonb_build_object('id',r.id,'status',r.status,'worksheetId',r.worksheet_id,'created',false);
  END IF;
  IF (SELECT count(*) FROM generation_requests WHERE parent_id=p_parent AND created_at>now()-interval '1 hour')>=20 THEN RAISE EXCEPTION 'RATE_LIMIT'; END IF;
  IF p.subscription_status<>'active' OR (p.subscription_period_end IS NOT NULL AND p.subscription_period_end<=now()) THEN RAISE EXCEPTION 'SUBSCRIPTION_INACTIVE'; END IF;
  IF p.worksheet_quota<p_count THEN RAISE EXCEPTION 'QUOTA_EXHAUSTED'; END IF;
  PERFORM set_config('teatch.quota_reason','reservation',true);
  UPDATE profiles SET worksheet_quota=worksheet_quota-p_count WHERE id=p_parent;
  INSERT INTO generation_requests(parent_id,request_key,request_hash,question_count) VALUES(p_parent,p_key,p_hash,p_count) RETURNING * INTO r;
  RETURN jsonb_build_object('id',r.id,'status',r.status,'created',true);
END; $$;

CREATE FUNCTION fail_generation(p_request uuid, p_code text, p_usage jsonb DEFAULT '{}') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r generation_requests; owner uuid;
BEGIN
  SELECT parent_id INTO owner FROM generation_requests WHERE id=p_request;
  PERFORM 1 FROM profiles WHERE id=owner FOR UPDATE;
  SELECT * INTO r FROM generation_requests WHERE id=p_request FOR UPDATE;
  IF r.status='reserved' THEN
    PERFORM set_config('teatch.quota_reason','failure_refund',true);
    UPDATE profiles SET worksheet_quota=worksheet_quota+r.question_count WHERE id=r.parent_id;
    UPDATE generation_requests SET status='failed',error_code=left(p_code,60),usage=p_usage WHERE id=r.id;
    r.status:='failed';
  END IF;
  RETURN jsonb_build_object('status',r.status,'worksheetId',r.worksheet_id);
END; $$;

CREATE FUNCTION finalize_generation(p_request uuid,p_child uuid,p_subject uuid,p_params jsonb,p_result jsonb,p_usage jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r generation_requests; w uuid; q jsonb; idx integer:=0; owner uuid;
BEGIN
  SELECT parent_id INTO owner FROM generation_requests WHERE id=p_request;
  PERFORM 1 FROM profiles WHERE id=owner FOR UPDATE;
  SELECT * INTO r FROM generation_requests WHERE id=p_request FOR UPDATE;
  IF r.status='succeeded' THEN RETURN r.worksheet_id; END IF;
  IF r.status<>'reserved' OR r.id IS NULL THEN RAISE EXCEPTION 'RESERVATION_INVALID'; END IF;
  IF NOT EXISTS(SELECT 1 FROM children c JOIN subjects s ON s.level=c.level WHERE c.id=p_child AND c.parent_id=r.parent_id AND s.id=p_subject) THEN RAISE EXCEPTION 'OWNERSHIP_INVALID'; END IF;
  IF jsonb_array_length(p_result->'questions')<>r.question_count THEN RAISE EXCEPTION 'COUNT_MISMATCH'; END IF;
  INSERT INTO worksheets(child_id,subject_id,title,difficulty,question_type,question_count,topic,objective_id,ai_response,status,schema_version)
  VALUES(p_child,p_subject,p_result->>'title',p_params->>'difficulty',p_params->>'questionType',r.question_count,p_params->>'topic',p_params->>'objectiveId',p_result,'draft',2) RETURNING id INTO w;
  FOR q IN SELECT value FROM jsonb_array_elements(p_result->'questions') LOOP
    INSERT INTO questions(worksheet_id,type,question,options,answer,explanation,content,schema_version,order_index)
    VALUES(w,q->>'type',q->>'question',COALESCE(q->'pairs',q->'options','[]'),q->>'answer',q->>'explanation',q,2,idx);
    idx:=idx+1;
  END LOOP;
  UPDATE generation_requests SET status='succeeded',worksheet_id=w,usage=p_usage WHERE id=r.id;
  RETURN w;
END; $$;

CREATE FUNCTION update_worksheet_content(p_parent uuid,p_worksheet uuid,p_result jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE w worksheets; q jsonb; idx integer:=0;
BEGIN
  SELECT * INTO w FROM worksheets WHERE id=p_worksheet FOR UPDATE;
  IF NOT EXISTS(SELECT 1 FROM children WHERE id=w.child_id AND parent_id=p_parent) THEN RAISE EXCEPTION 'OWNERSHIP_INVALID'; END IF;
  IF EXISTS(SELECT 1 FROM attempts WHERE worksheet_id=w.id) THEN RAISE EXCEPTION 'ALREADY_ATTEMPTED'; END IF;
  IF jsonb_array_length(p_result->'questions')<>w.question_count THEN RAISE EXCEPTION 'COUNT_MISMATCH'; END IF;
  FOR q IN SELECT value FROM jsonb_array_elements(p_result->'questions') LOOP
    UPDATE questions SET question=q->>'question',options=COALESCE(q->'pairs',q->'options','[]'),answer=q->>'answer',explanation=q->>'explanation',content=q,schema_version=2 WHERE worksheet_id=w.id AND order_index=idx;
    IF NOT FOUND THEN RAISE EXCEPTION 'QUESTION_MISSING'; END IF;
    idx:=idx+1;
  END LOOP;
  UPDATE worksheets SET title=p_result->>'title',ai_response=p_result,status='generated',schema_version=2 WHERE id=w.id;
END; $$;

CREATE FUNCTION save_scored_attempt(p_parent uuid,p_worksheet uuid,p_key uuid,p_duration integer,p_answers jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE w worksheets; a attempts; n integer; good integer; pending integer;
BEGIN
  SELECT * INTO w FROM worksheets WHERE id=p_worksheet FOR UPDATE;
  IF w.status<>'generated' OR NOT EXISTS(SELECT 1 FROM children WHERE id=w.child_id AND parent_id=p_parent) THEN RAISE EXCEPTION 'OWNERSHIP_INVALID'; END IF;
  SELECT * INTO a FROM attempts WHERE child_id=w.child_id AND submission_key=p_key;
  IF FOUND THEN
    IF a.worksheet_id<>w.id THEN RAISE EXCEPTION 'KEY_CONFLICT'; END IF;
    RETURN to_jsonb(a);
  END IF;
  SELECT count(*),count(*) FILTER(WHERE x->>'is_correct'='true'),count(*) FILTER(WHERE x->>'is_correct' IS NULL)
  INTO n,good,pending FROM jsonb_array_elements(p_answers) x;
  IF n<>w.question_count OR (SELECT count(DISTINCT x->>'question_id') FROM jsonb_array_elements(p_answers) x)<>n OR
    (SELECT count(*) FROM jsonb_array_elements(p_answers) x JOIN questions q ON q.id=(x->>'question_id')::uuid AND q.worksheet_id=w.id)<>n THEN RAISE EXCEPTION 'ANSWERS_INVALID'; END IF;
  INSERT INTO attempts(worksheet_id,child_id,score,total_questions,correct_answers,duration,status,completed_at,scoring_version,submission_key)
  VALUES(w.id,w.child_id,CASE WHEN pending=0 THEN round(good*100.0/n) ELSE NULL END,n,good,GREATEST(0,LEAST(p_duration,86400)),CASE WHEN pending=0 THEN 'completed' ELSE 'pending_review' END,now(),2,p_key) RETURNING * INTO a;
  INSERT INTO answers(attempt_id,question_id,user_answer,is_correct,review_status)
  SELECT a.id,(x->>'question_id')::uuid,x->>'user_answer',(x->>'is_correct')::boolean,CASE WHEN x->>'is_correct' IS NULL THEN 'pending' ELSE 'graded' END FROM jsonb_array_elements(p_answers) x;
  RETURN to_jsonb(a);
END; $$;

CREATE FUNCTION review_attempt_answer(p_parent uuid,p_answer uuid,p_correct boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE att uuid; n integer; good integer; pending integer;
BEGIN
  SELECT a.id INTO att FROM answers x JOIN attempts a ON a.id=x.attempt_id JOIN children c ON c.id=a.child_id WHERE x.id=p_answer AND c.parent_id=p_parent AND a.scoring_version=2;
  IF att IS NULL THEN RAISE EXCEPTION 'OWNERSHIP_INVALID'; END IF;
  PERFORM 1 FROM attempts WHERE id=att FOR UPDATE;
  UPDATE answers SET is_correct=p_correct,review_status='graded' WHERE id=p_answer AND review_status='pending';
  SELECT count(*),count(*) FILTER(WHERE is_correct),count(*) FILTER(WHERE review_status='pending') INTO n,good,pending FROM answers WHERE attempt_id=att;
  UPDATE attempts SET correct_answers=good,score=CASE WHEN pending=0 THEN round(good*100.0/n) ELSE NULL END,status=CASE WHEN pending=0 THEN 'completed' ELSE 'pending_review' END WHERE id=att;
END; $$;

-- Privileged procedures cannot be called through a user's browser token.
REVOKE ALL ON FUNCTION reserve_generation(uuid,uuid,text,integer),fail_generation(uuid,text,jsonb),finalize_generation(uuid,uuid,uuid,jsonb,jsonb,jsonb),update_worksheet_content(uuid,uuid,jsonb),save_scored_attempt(uuid,uuid,uuid,integer,jsonb),review_attempt_answer(uuid,uuid,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION reserve_generation(uuid,uuid,text,integer),fail_generation(uuid,text,jsonb),finalize_generation(uuid,uuid,uuid,jsonb,jsonb,jsonb),update_worksheet_content(uuid,uuid,jsonb),save_scored_attempt(uuid,uuid,uuid,integer,jsonb),review_attempt_answer(uuid,uuid,boolean) TO service_role;

CREATE TABLE question_reports(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,reason text NOT NULL CHECK(length(reason) BETWEEN 5 AND 1000),status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY reports_select ON question_reports FOR SELECT USING(parent_id IN (SELECT id FROM profiles WHERE auth_user_id=auth.uid()) OR is_admin());
REVOKE INSERT,UPDATE,DELETE ON question_reports FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON question_reports TO service_role;
GRANT SELECT ON quota_ledger TO service_role;

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
INSERT INTO storage.buckets(id,name,public) VALUES('avatars','avatars',false) ON CONFLICT(id) DO NOTHING;
UPDATE storage.buckets SET public=false,file_size_limit=2097152,allowed_mime_types=ARRAY['image/png','image/jpeg','image/webp'] WHERE id='avatars';
CREATE POLICY avatar_owner_select ON storage.objects FOR SELECT TO authenticated USING(bucket_id='avatars' AND (name LIKE auth.uid()::text||'/%' OR name LIKE auth.uid()::text||'-%'));
CREATE POLICY avatar_owner_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='avatars' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY avatar_owner_update ON storage.objects FOR UPDATE TO authenticated USING(bucket_id='avatars' AND (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK(bucket_id='avatars' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY avatar_owner_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='avatars' AND (name LIKE auth.uid()::text||'/%' OR name LIKE auth.uid()::text||'-%'));

-- Lock the parent row to enforce child limits even for simultaneous browser requests.
CREATE FUNCTION enforce_child_limit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE p profiles; lim integer;
BEGIN
  SELECT * INTO p FROM profiles WHERE id=NEW.parent_id FOR UPDATE;
  lim:=CASE p.subscription_tier WHEN 'free_trial' THEN 1 WHEN 'basic' THEN 3 ELSE 6 END;
  IF TG_OP='UPDATE' AND NEW.parent_id<>OLD.parent_id THEN RAISE EXCEPTION 'PARENT_IMMUTABLE'; END IF;
  IF TG_OP='INSERT' AND (SELECT count(*) FROM children WHERE parent_id=NEW.parent_id)>=lim THEN RAISE EXCEPTION 'CHILD_LIMIT'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER child_limit BEFORE INSERT OR UPDATE ON children FOR EACH ROW EXECUTE FUNCTION enforce_child_limit();

CREATE FUNCTION admin_update_profile(p_profile uuid,p_changes jsonb,p_quota integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  PERFORM 1 FROM profiles WHERE id=p_profile FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF p_quota IS NOT NULL AND EXISTS(SELECT 1 FROM generation_requests WHERE parent_id=p_profile AND status='reserved') THEN RAISE EXCEPTION 'GENERATION_PENDING'; END IF;
  PERFORM set_config('teatch.quota_reason','admin_adjustment',true);
  UPDATE profiles SET role=p_changes->>'role',subscription_tier=p_changes->>'subscription_tier',subscription_status=p_changes->>'subscription_status',subscription_period_end=(p_changes->>'subscription_period_end')::timestamptz,worksheet_quota=COALESCE(p_quota,worksheet_quota) WHERE id=p_profile;
END; $$;
REVOKE ALL ON FUNCTION admin_update_profile(uuid,jsonb,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION admin_update_profile(uuid,jsonb,integer) TO service_role;
CREATE FUNCTION reconcile_generation_reservations() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE owner uuid; refunded integer; total integer:=0;
BEGIN
  FOR owner IN SELECT DISTINCT parent_id FROM generation_requests WHERE status='reserved' AND created_at<now()-interval '15 minutes' ORDER BY parent_id LOOP
    PERFORM 1 FROM profiles WHERE id=owner FOR UPDATE;
    WITH expired AS (UPDATE generation_requests SET status='failed',error_code='EXPIRED' WHERE parent_id=owner AND status='reserved' AND created_at<now()-interval '15 minutes' RETURNING question_count) SELECT COALESCE(sum(question_count),0) INTO refunded FROM expired;
    PERFORM set_config('teatch.quota_reason','expired_refund',true);
    UPDATE profiles SET worksheet_quota=worksheet_quota+refunded WHERE id=owner; total:=total+refunded;
  END LOOP;
  RETURN total;
END; $$;
CREATE FUNCTION quota_audit() RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=public,pg_temp AS $$
SELECT jsonb_build_object('discrepancies',(SELECT count(*) FROM profiles p LEFT JOIN (SELECT parent_id,sum(delta) balance FROM quota_ledger GROUP BY parent_id) l ON l.parent_id=p.id WHERE p.worksheet_quota<>COALESCE(l.balance,0)), 'expiredReservations',(SELECT count(*) FROM generation_requests WHERE status='reserved' AND created_at<now()-interval '15 minutes'), 'heldQuestions',(SELECT COALESCE(sum(question_count),0) FROM generation_requests WHERE status='reserved'));
$$;
REVOKE ALL ON FUNCTION reconcile_generation_reservations(),quota_audit() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION reconcile_generation_reservations(),quota_audit() TO service_role;
COMMIT;
