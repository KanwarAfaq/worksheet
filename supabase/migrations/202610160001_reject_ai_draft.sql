-- Owner-only permanent rejection. Apply manually in Supabase SQL Editor before using Reject.
create or replace function public.reject_ai_worksheet(p_worksheet_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_owner uuid := auth.uid(); v_title text;
begin
 if v_owner is null or not exists (
  select 1 from public.admin_profiles where user_id=v_owner and role='owner' and enabled=true
 ) then raise exception 'Owner access required'; end if;
 select title into v_title from public.worksheets
  where id=p_worksheet_id and status='draft' and source='generator'
  for update;
 if not found then raise exception 'AI draft not found or not rejectable'; end if;
 delete from public.worksheet_files where worksheet_id=p_worksheet_id;
 delete from public.worksheets where id=p_worksheet_id;
 insert into public.audit_logs(actor_id,action,resource_type,resource_id,safe_diff)
 values(v_owner,'agent.ai_draft.rejected','worksheet',p_worksheet_id,
   jsonb_build_object('title',left(v_title,120),'permanent_deletion',true));
end $$;
revoke all on function public.reject_ai_worksheet(uuid) from public,anon;
grant execute on function public.reject_ai_worksheet(uuid) to authenticated;
