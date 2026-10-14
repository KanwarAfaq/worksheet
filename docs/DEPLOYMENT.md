# Worksheet Studio — Vercel preview setup

1. Sign in to Vercel and import **KanwarAfaq/worksheet** from GitHub.
2. Framework Preset: **Next.js**; Root Directory: repository root.
3. Use the temporary Vercel hostname until a custom domain is ready.
4. The site recognizes `VERCEL_PROJECT_PRODUCTION_URL` automatically and falls back to the current preview origin.
5. Once a purchased domain is attached, set `NEXT_PUBLIC_SITE_URL=https://yourdomain.example`.
6. Do **not** set `ENABLE_SEARCH_INDEXING=true` until the website has verified published content, legal pages, SEO and a live custom domain.
7. Deploy the `main` branch and enable automatic deployments.

## Supabase

Project: `ijikaqxgsfsakdtzzgkc`. Foundation schema created with RLS enabled.
The public catalog is still labeled sample data. It does **not** expose private file object keys or connect to worksheet downloads.
Owner email: `kmafaq2@gmail.com`. Supabase Auth user must be created separately; do not share passwords.

## Future R2 storage

Create a **private** Cloudflare R2 bucket and backend file delivery on `/api/worksheets/{id}/download`.
No public R2 domain is used. Upload signatures, file inspection, server-verified SHA-256 and admin authorization must be implemented first.

## Hosting costs

Vercel Hobby is for eligible non-commercial preview use. Before commercial launch, choose a plan/provider that allows the intended business use. Confirm current Supabase and Cloudflare quotas and billing requirements.
