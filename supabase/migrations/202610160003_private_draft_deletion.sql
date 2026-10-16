-- Applied 2026-10-16: authenticated users may delete their own unpublished
-- drafts and owner may delete any unpublished draft. DB deletion queues private
-- R2 object keys for durable cleanup; keys never reach ordinary API clients.
CREATE TABLE IF NOT EXISTS public.draft_r2_cleanup_queue(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 worksheet_id uuid NOT NULL,
 r2_bucket text NOT NULL,
 object_key text NOT NULL,
 queued_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT draft_r2_cleanup_queue_object_unique UNIQUE(r2_bucket,object_key)
);
ALTER TABLE public.draft_r2_cleanup_queue ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.draft_r2_cleanup_queue FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.draft_r2_cleanup_queue TO service_role;

CREATE OR REPLACE FUNCTION public.delete_worksheet_draft(p_worksheet_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $body$
DECLARE actor uuid:=auth.uid();owner_mode boolean:=false;record_row record;keys jsonb;
BEGIN
 IF actor IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 SELECT EXISTS(SELECT 1 FROM public.admin_profiles
  WHERE user_id=actor AND enabled=true AND role='owner') INTO owner_mode;
 SELECT id,title,status,created_by,source INTO record_row FROM public.worksheets
 WHERE id=p_worksheet_id AND status='draft' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Draft not found or cannot be deleted'; END IF;
 IF record_row.created_by IS DISTINCT FROM actor AND NOT owner_mode
 THEN RAISE EXCEPTION 'You cannot delete someone else''s draft'; END IF;
 IF EXISTS(SELECT 1 FROM public.generated_drafts WHERE worksheet_id=p_worksheet_id)
  THEN RAISE EXCEPTION 'Generated draft has dependent records; use its dedicated review workflow'; END IF;
 IF EXISTS(SELECT 1 FROM public.download_events WHERE worksheet_id=p_worksheet_id)
  THEN RAISE EXCEPTION 'This worksheet has download history and cannot be deleted as a draft'; END IF;
 INSERT INTO public.draft_r2_cleanup_queue(worksheet_id,r2_bucket,object_key)
 SELECT p_worksheet_id,f.r2_bucket,f.object_key FROM public.worksheet_files f WHERE f.worksheet_id=p_worksheet_id
 ON CONFLICT(r2_bucket,object_key) DO NOTHING;
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',q.id,'bucket',q.r2_bucket,'key',q.object_key)),'[]'::jsonb)
 INTO keys FROM public.draft_r2_cleanup_queue q WHERE q.worksheet_id=p_worksheet_id;
 DELETE FROM public.worksheets WHERE id=p_worksheet_id;
 INSERT INTO public.audit_logs(actor_id,action,resource_type,resource_id,safe_diff)
 VALUES(actor,'worksheet.draft.deleted','worksheet',p_worksheet_id,
  jsonb_build_object('title',left(record_row.title,120),'by_owner',owner_mode,'file_count',jsonb_array_length(keys)));
 RETURN jsonb_build_object('deleted',true,'files',keys);
END $body$;
REVOKE ALL ON FUNCTION public.delete_worksheet_draft(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.delete_worksheet_draft(uuid) TO authenticated;
