-- Applied to Worksheet Supabase as worksheet_profiles_saved_and_likes.
-- Row-level access for private profile, saved worksheets and liked worksheets.
create table if not exists public.worksheet_user_profiles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 avatar_object_key text,
 avatar_sha256 char(64),
 avatar_mime text,
 avatar_updated_at timestamptz,
 updated_at timestamptz not null default now(),
 constraint worksheet_name_length check(char_length(display_name)<=80),
 constraint worksheet_avatar_type check(avatar_mime is null or avatar_mime in('image/png','image/jpeg','image/webp'))
);
alter table public.worksheet_user_profiles enable row level security;
create policy worksheet_profile_owner_select on public.worksheet_user_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy worksheet_profile_owner_insert on public.worksheet_user_profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy worksheet_profile_owner_update on public.worksheet_user_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create table if not exists public.worksheet_user_saves(
 user_id uuid not null references auth.users(id) on delete cascade,
 worksheet_id uuid not null references public.worksheets(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,worksheet_id)
);
alter table public.worksheet_user_saves enable row level security;
create policy worksheet_saves_own_select on public.worksheet_user_saves for select to authenticated using ((select auth.uid())=user_id);
create policy worksheet_saves_own_insert on public.worksheet_user_saves for insert to authenticated with check ((select auth.uid())=user_id and exists(select 1 from public.worksheets w where w.id=worksheet_id and w.status='published'));
create policy worksheet_saves_own_delete on public.worksheet_user_saves for delete to authenticated using ((select auth.uid())=user_id);
create table if not exists public.worksheet_user_likes(
 user_id uuid not null references auth.users(id) on delete cascade,
 worksheet_id uuid not null references public.worksheets(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,worksheet_id)
);
alter table public.worksheet_user_likes enable row level security;
create policy worksheet_likes_own_select on public.worksheet_user_likes for select to authenticated using ((select auth.uid())=user_id);
create policy worksheet_likes_own_insert on public.worksheet_user_likes for insert to authenticated with check ((select auth.uid())=user_id and exists(select 1 from public.worksheets w where w.id=worksheet_id and w.status='published'));
create policy worksheet_likes_own_delete on public.worksheet_user_likes for delete to authenticated using ((select auth.uid())=user_id);
grant select,insert,update on public.worksheet_user_profiles to authenticated;
grant select,insert,delete on public.worksheet_user_saves,public.worksheet_user_likes to authenticated;
