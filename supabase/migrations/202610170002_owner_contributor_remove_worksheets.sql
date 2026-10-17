-- 2026-10-17: Owner / contributor deletion with historical integrity.
-- Non-destructive for past downloads: deleted entries are archived and marked,
-- all public access is withdrawn, private R2 objects are queued for cleanup.
CREATE OR REPLACE FUNCTION public.remove_owned_worksheet(p_worksheet_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE actor uuid:=auth.uid();is_owner boolean;w record;files jsonb;
BEGIN
 IF actor IS NULL THEN RAISE EXCEPTION 'Authentication required';END IF;
 SELECT EXISTS(SELECT 1 FROM public.admin_profiles p
  WHERE p.user_id=actor AND p.role='owner' AND p.enabled) INTO is_owner;
 SELECT id,title,created_by,status,tags INTO w
 FROM public.worksheets WHERE id=p_worksheet_id FOR UPDATE;
 IF NOT FOUND OR ('removed-by-author'=ANY(coalesce(w.tags,'{}'::text[])))
  THEN RAISE EXCEPTION 'Worksheet not found';END IF;
 IF NOT is_owner AND w.created_by IS DISTINCT FROM actor
  THEN RAISE EXCEPTION 'Cannot remove another user''s worksheet';END IF;
 INSERT INTO public.draft_r2_cleanup_queue(worksheet_id,r2_bucket,object_key)
 SELECT p_worksheet_id,f.r2_bucket,f.object_key FROM public.worksheet_files f
 WHERE f.worksheet_id=p_worksheet_id
 ON CONFLICT(r2_bucket,object_key) DO NOTHING;
 SELECT coalesce(jsonb_agg(jsonb_build_object(
  'id',q.id,'bucket',q.r2_bucket,'key',q.object_key)), '[]'::jsonb)
 INTO files FROM public.draft_r2_cleanup_queue q
 WHERE q.worksheet_id=p_worksheet_id;
 UPDATE public.worksheets SET status='archived',published_at=NULL,
  available_formats='{}'::text[],featured=false,
  tags=array_append(coalesce(tags,'{}'::text[]),'removed-by-author'),
  updated_at=now() WHERE id=p_worksheet_id;
 INSERT INTO public.audit_logs(actor_id,action,resource_type,resource_id,safe_diff)
 VALUES(actor,'worksheet.removed','worksheet',p_worksheet_id,
  jsonb_build_object('prior_status',w.status,'by_owner',is_owner,
  'file_count',jsonb_array_length(files),'title',left(w.title,120)));
 RETURN jsonb_build_object('removed',true,'files',files,'previous_status',w.status);
END $fn$;
REVOKE ALL ON FUNCTION public.remove_owned_worksheet(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.remove_owned_worksheet(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_free_worksheet(
 p_category_id uuid,p_grade_id uuid DEFAULT NULL::uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE uid uuid:=auth.uid();total integer;result_id uuid;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Please sign in first';END IF;
 IF NOT EXISTS(SELECT 1 FROM auth.users u
  WHERE u.id=uid AND u.email_confirmed_at IS NOT NULL)
  THEN RAISE EXCEPTION 'Confirm your email to use free worksheet uploads';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.categories c
  WHERE c.id=p_category_id AND c.status='active')
  THEN RAISE EXCEPTION 'Invalid subject';END IF;
 IF p_grade_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.grades g
  WHERE g.id=p_grade_id) THEN RAISE EXCEPTION 'Invalid grade';END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,44));
 SELECT count(*) INTO total FROM public.worksheets
  WHERE created_by=uid
   AND NOT ('removed-by-author'=ANY(coalesce(tags,'{}'::text[])));
 IF total>=5 THEN RAISE EXCEPTION 'Free limit reached: five worksheets per account';END IF;
 INSERT INTO public.worksheets(title,slug,status,category_id,grade_id,source,created_by,summary)
 VALUES('Untitled worksheet','community-'||replace(gen_random_uuid()::text,'-',''),
  'draft',p_category_id,p_grade_id,'manual',uid,NULL) RETURNING id INTO result_id;
 RETURN result_id;
END $fn$;
REVOKE ALL ON FUNCTION public.create_free_worksheet(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_free_worksheet(uuid,uuid) TO authenticated;
