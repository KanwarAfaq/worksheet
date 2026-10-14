# Worksheet Studio — Vercel preview setup

1. Sign in to Vercel and import **KanwarAfaq/worksheet** from GitHub.
2. Set Framework Preset to **Next.js**, Root Directory to repository root.
3. Leave the custom domain unset for now; use the Vercel-generated preview hostname.
4. Set `NEXT_PUBLIC_SITE_URL` to the final Vercel preview URL once known, then redeploy.
5. Deploy the `main` branch, with automatic deployments enabled on future commits.
6. Review build logs and visit home, English/Math/Coloring, catalog, and three generator routes.

## Supabase

The Supabase project `ijikaqxgsfsakdtzzgkc` is connected and has a foundation schema applied.
The public preview catalog currently contains clearly labeled sample data. It does **not** yet query Supabase or expose private files.
The initial database is intentionally locked down: RLS on all tables and no anonymous file-object-key exposure.

## Next phase

Provision R2 private bucket and credentials, implement authenticated file gateway and Supabase role-checked CRUD.
Do not put R2 keys or the Supabase service-role secret in `NEXT_PUBLIC_*` environment variables.
The Supabase Auth owner has not been created yet. Owner email: `kmafaq2@gmail.com`.
Set up the owner through Supabase Auth securely before turning on administration.

## Hosting and cost

Vercel Hobby is a development-preview option only when eligible under Vercel's terms; commercial use requires eligible hosting.
R2/Supabase limits and potential billing requirements must be checked before production release.
Do not assume `pages.dev` or Vercel preview URLs are permanent canonical domains.
