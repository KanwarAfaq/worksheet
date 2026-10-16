-- Correction tested on the Worksheet production Supabase project 2026-10-16.
-- The original function used 'community-' + text, which PostgreSQL rejects (SQLSTATE 42883).
-- Use text concatenation ||; preserve atomic 5-slot enforcement and verified-user checks.
CREATE OR REPLACE FUNCTION public.create_free_worksheet(
  p_category_id uuid,
  p_grade_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE uid uuid:=auth.uid(); total integer; result_id uuid;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Please sign in first'; END IF;
 IF NOT EXISTS(SELECT 1 FROM auth.users u WHERE u.id=uid AND u.email_confirmed_at IS NOT NULL)
  THEN RAISE EXCEPTION 'Confirm your email to use free worksheet uploads'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.categories c WHERE c.id=p_category_id AND c.status='active')
  THEN RAISE EXCEPTION 'Invalid subject'; END IF;
 IF p_grade_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.grades g WHERE g.id=p_grade_id)
  THEN RAISE EXCEPTION 'Invalid grade'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text, 44));
 SELECT count(*) INTO total FROM public.worksheets WHERE created_by=uid;
 IF total >=5 THEN RAISE EXCEPTION 'Free limit reached: five worksheets per account'; END IF;
 INSERT INTO public.worksheets(title,slug,status,category_id,grade_id,source,created_by,summary)
 VALUES('Untitled worksheet','community-'||replace(gen_random_uuid()::text,'-',''),
        'draft',p_category_id,p_grade_id,'manual',uid,NULL)
 RETURNING id INTO result_id;
 RETURN result_id;
END $$;
REVOKE ALL ON FUNCTION public.create_free_worksheet(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_free_worksheet(uuid,uuid) TO authenticated;
