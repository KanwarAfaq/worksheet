-- Run after the worksheet_studio_foundation_v1 migration.
-- Owner account is assigned manually from Supabase, not by the public website.
CREATE POLICY "Admin reads own role" ON public.admin_profiles FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Enabled owner reads draft worksheets" ON public.worksheets FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = (SELECT auth.uid()) AND ap.enabled AND ap.role = 'owner'));
CREATE POLICY "Enabled owner creates draft worksheets" ON public.worksheets FOR INSERT TO authenticated
WITH CHECK (status='draft' AND created_by=(SELECT auth.uid())
AND EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id=(SELECT auth.uid()) AND ap.enabled AND ap.role='owner'));
-- No generic UPDATE, DELETE, file-object or admin-profile write policies.
