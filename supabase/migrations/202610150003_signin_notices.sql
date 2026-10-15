create table if not exists public.worksheet_signin_notices(
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null,
 created_at timestamptz not null default now(),
 primary key(user_id,session_id)
);
alter table public.worksheet_signin_notices enable row level security;
create policy worksheet_signin_owner_select on public.worksheet_signin_notices
 for select to authenticated using ((select auth.uid())=user_id);
create policy worksheet_signin_owner_insert on public.worksheet_signin_notices
 for insert to authenticated with check ((select auth.uid())=user_id);
create policy worksheet_signin_owner_delete on public.worksheet_signin_notices
 for delete to authenticated using ((select auth.uid())=user_id);
grant select,insert,delete on public.worksheet_signin_notices to authenticated;