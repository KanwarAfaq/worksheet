# Production verification — October 16, 2026
Project: Worksheet Studio. Target: worksheet.live and Vercel deployment. This report distinguishes real database-level exercises from unexecuted authenticated production integrations.

## Directly confirmed
- GitHub `main` commit `73ceb87628a6eca2ec2d23a346889684f1d4bdb5`: `build-and-test` workflow concluded SUCCESS. Vercel GitHub commit status SUCCESS. The network/browser could not independently fetch the live site; commit status is not a functional API test.
- Supabase project `ijikaqxgsfsakdtzzgkc`: live SQL connection succeeded. Worksheet/files/moderation tables have RLS enabled. Existing live database: 2 worksheet records (1 draft, 1 published), 2 stored verified file-metadata rows, zero pending community moderation records.
- `create_free_worksheet` **failed** on real production DB during a transaction-safe test: invalid PostgreSQL `'community-' + text` slug expression. Corrected to `'community-' || text` with applied migration `fix_community_worksheet_creation_slug_operator_20261016`.
- After repair, transaction-scoped, fully rolled-back simulation using a verified non-owner account: 5 drafts created and sixth blocked by quota. No records persisted.
- Transaction-scoped checks: submission without a verified file was rejected; non-owner publication was rejected.
- Anonymous role RLS returned only published worksheet records.
- Transaction-scoped AI-draft rejection (with owner identity) removed a temporary draft and created audit entry. File deletion from private R2 was **not exercised**.
- After rollback, no temporary rows persisted and database totals stayed unchanged.

## Not executed in live production
- Authorized `POST /api/admin/diagnostics`: requires a **current owner Supabase access token**; the available GitHub and Supabase connectors do not expose or mint an authenticated owner session. This endpoint tests actual CGU local/compatible, Groq, NVIDIA, R2 Put/Get/Delete, and LINE push. Do not mark these successful from a build.
- Real sign-up and authenticated user API end-to-end: not executed via browser.
- Real R2 binary upload/download and automated file cleanup: not executed.
- The 5-worksheet full API workflow with actual uploads, owner publication and rejection: not executed.
- External website view / browser smoke testing: unavailable in this session.
- Cron `AUTO_GENERATION_ENABLED` configuration: not verifiable from GitHub. Do not enable daily generation before complete integration checks.

## Security / operational cautions
- The configured diagnostic endpoint sends an actual LINE message and consumes small provider tokens. Use only after authenticated owner authorizes it.
- Supabase's security advisor flags some intentionally locked-down RLS tables without policies and some SECURITY DEFINER functions intentionally callable by authenticated users. Confirm each exposed function performs adequate role, ownership and status authorization; do not indiscriminately disable RLS or drop required grants.
- Keep Vercel and Supabase API keys server-side; never commit an owner JWT or credential into source, logs or GitHub Actions.

## Next step for true live integration coverage
Authorize a Vercel connection with the correct project and a supported way to invoke owner diagnostics (or sign in to the deployed owner dashboard to run the test). A repository deployment alone cannot authenticate an owner or read backend secrets. Owner auth restriction must not be bypassed.
