-- Applied with connected Supabase migrations:
-- verified_private_r2_file_workflow
-- correct_worksheet_publication_rowcount
-- lockdown_audit_trigger_rpc_permissions
-- safe_public_worksheet_format_listing
-- This file documents the public-safe formats migration.
alter table public.worksheet_files
  add column if not exists license_basis text,
  add column if not exists license_note text,
  add column if not exists uploaded_by uuid references auth.users(id);
alter table public.worksheets
  add column if not exists available_formats text[] not null default '{}'::text[];
-- Private worksheet_files table must never grant anonymous SELECT.
-- Publishing uses owner-only security-definer RPCs, requires verified student PDF,
-- and sets public-safe available_formats from checked file metadata.
-- Audit trigger function must not be directly called by anon/authenticated.
revoke all on function public.audit_worksheet_draft_changes() from PUBLIC,anon,authenticated;
