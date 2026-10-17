-- Already applied to production in October 2026.
-- User-created text and coloring AI generations share a maximum of 3 requests
-- per UTC day; admin autonomous agent generations are separate and unchanged.
CREATE OR REPLACE FUNCTION public.reserve_worksheet_ai_generation()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $function$
DECLARE who uuid:=auth.uid();today date:=(now() at time zone 'utc')::date;used integer;
BEGIN
 IF who IS NULL THEN RAISE EXCEPTION 'Authentication required';END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(who::text||today::text,0));
 INSERT INTO public.worksheet_ai_daily_usage(user_id,day,requests) VALUES(who,today,1)
 ON CONFLICT(user_id,day) DO UPDATE SET requests=public.worksheet_ai_daily_usage.requests+1
 WHERE public.worksheet_ai_daily_usage.requests<3 RETURNING requests INTO used;
 IF used IS NULL THEN RAISE EXCEPTION 'Daily AI limit reached (3 worksheets per day)'; END IF;
 RETURN used;
END $function$;
REVOKE ALL ON FUNCTION public.reserve_worksheet_ai_generation() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.reserve_worksheet_ai_generation() TO authenticated;
