-- Run this entire file after migrations 001-006, before deploying the app.
-- Safe to rerun. Existing worksheet content, attempts and quota are preserved.
BEGIN;
SET LOCAL search_path = public, extensions, pg_temp;

DO $$ BEGIN
  IF to_regprocedure('public.finalize_generation(uuid,uuid,uuid,jsonb,jsonb,jsonb)') IS NULL THEN
    RAISE EXCEPTION 'Migration 005 must be installed in public before migration 007';
  END IF;
END $$;

-- A successful generation is immediately ready for practice, in the same
-- transaction that stores its questions and completes the quota reservation.
CREATE OR REPLACE FUNCTION public.finalize_generation(p_request uuid,p_child uuid,p_subject uuid,p_params jsonb,p_result jsonb,p_usage jsonb) RETURNS uuid
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
  VALUES(p_child,p_subject,p_result->>'title',p_params->>'difficulty',p_params->>'questionType',r.question_count,p_params->>'topic',p_params->>'objectiveId',p_result,'generated',2) RETURNING id INTO w;
  FOR q IN SELECT value FROM jsonb_array_elements(p_result->'questions') LOOP
    INSERT INTO questions(worksheet_id,type,question,options,answer,explanation,content,schema_version,order_index)
    VALUES(w,q->>'type',q->>'question',COALESCE(q->'pairs',q->'options','[]'),q->>'answer',q->>'explanation',q,2,idx);
    idx:=idx+1;
  END LOOP;
  UPDATE generation_requests SET status='succeeded',worksheet_id=w,usage=p_usage WHERE id=r.id;
  RETURN w;
END; $$;

REVOKE ALL ON FUNCTION public.finalize_generation(uuid,uuid,uuid,jsonb,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_generation(uuid,uuid,uuid,jsonb,jsonb,jsonb) TO service_role;

-- Retire the old publish/edit RPC as well as direct client content writes.
DROP FUNCTION IF EXISTS public.update_worksheet_content(uuid,uuid,jsonb);
REVOKE INSERT, UPDATE ON public.worksheets, public.questions FROM anon,authenticated;

-- Existing drafts become usable without changing their content or charging again.
UPDATE public.worksheets SET status='generated' WHERE status='draft';
ALTER TABLE public.worksheets DROP CONSTRAINT IF EXISTS worksheets_status_check;
ALTER TABLE public.worksheets ADD CONSTRAINT worksheets_status_check CHECK (status IN ('generating','generated','error'));

NOTIFY pgrst, 'reload schema';
COMMIT;

SELECT
  NOT EXISTS(SELECT 1 FROM public.worksheets WHERE status='draft') AS drafts_migrated,
  to_regprocedure('public.update_worksheet_content(uuid,uuid,jsonb)') IS NULL AS content_editing_disabled;
