-- Applied to Worksheet Supabase: worksheet_ai_daily_quota
create table if not exists public.worksheet_ai_daily_usage(
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null default (now() at time zone 'utc')::date,
 requests integer not null default 0 check(requests>=0 and requests<=20),
 primary key(user_id,day)
);
alter table public.worksheet_ai_daily_usage enable row level security;
create policy worksheet_ai_own_read on public.worksheet_ai_daily_usage for select to authenticated using ((select auth.uid())=user_id);
create or replace function public.reserve_worksheet_ai_generation() returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare who uuid:=auth.uid(); today date:=(now() at time zone 'utc')::date; used integer;
begin
 if who is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(who::text||today::text,0));
 insert into public.worksheet_ai_daily_usage(user_id,day,requests) values(who,today,1)
 on conflict(user_id,day) do update set requests=public.worksheet_ai_daily_usage.requests+1
 where public.worksheet_ai_daily_usage.requests<5 returning requests into used;
 if used is null then raise exception 'Daily AI limit reached (5 worksheets per day)'; end if;
 return used;
end $$;
revoke all on function public.reserve_worksheet_ai_generation() from public,anon;
grant execute on function public.reserve_worksheet_ai_generation() to authenticated;
grant select on public.worksheet_ai_daily_usage to authenticated;
