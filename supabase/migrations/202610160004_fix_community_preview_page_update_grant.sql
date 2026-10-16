-- Fix the community quick-upload metadata PATCH regression.
-- preview_page was introduced after the initial column-level permissions,
-- so every PATCH updating preview_page failed with insufficient privilege.
-- Existing RLS policy still restricts each contributor to their own
-- status='draft' rows; this grants access only to one metadata field.
GRANT UPDATE(preview_page) ON public.worksheets TO authenticated;
