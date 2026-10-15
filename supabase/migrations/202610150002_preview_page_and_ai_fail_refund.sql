-- Applied to the worksheet Supabase project (ijikaqxgsfsakdtzzgkc).
-- Uploaders select a 1-based PDF page for the catalog cover.
ALTER TABLE public.worksheets ADD COLUMN IF NOT EXISTS preview_page integer NOT NULL DEFAULT 1;
ALTER TABLE public.worksheets DROP CONSTRAINT IF EXISTS worksheets_preview_page_range;
ALTER TABLE public.worksheets ADD CONSTRAINT worksheets_preview_page_range CHECK (preview_page BETWEEN 1 AND 200);

-- Provider failures must not spend the user's AI quota. Only a service-role
-- request from the server-side generation failure handler may refund a slot.
DROP FUNCTION IF EXISTS public.refund_failed_worksheet_ai_generation();
CREATE FUNCTION public.refund_failed_worksheet_ai_generation(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE today date:=(now() at time zone 'utc')::date;
BEGIN
 IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'Service-only operation'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text||today::text,0));
 UPDATE public.worksheet_ai_daily_usage SET requests=greatest(0,requests-1)
 WHERE user_id=p_user_id AND day=today AND requests>0;
END $$;
REVOKE ALL ON FUNCTION public.refund_failed_worksheet_ai_generation(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.refund_failed_worksheet_ai_generation(uuid) TO service_role;
